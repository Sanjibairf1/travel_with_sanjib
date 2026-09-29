import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type Feed = { name: string; domain: string; url: string; official?: boolean };
type FeedItem = { headline: string; summary: string; originalUrl: string; imageUrl?: string; source: Feed; incident: boolean };
type GdeltArticle = { title?: string; url?: string; domain?: string; seendate?: string; socialimage?: string };

// Official safety feeds are preferred. Google News is used only to discover a
// wider range of current aviation reporting; every public card keeps its link
// back to the originating article.
const FEEDS: Feed[] = [
  { name: 'FAA', domain: 'faa.gov', url: 'https://www.faa.gov/news/publicnews-rss.xml', official: true },
  { name: 'NTSB Investigations', domain: 'ntsb.gov', url: 'https://www.ntsb.gov/_layouts/feed.aspx?page=674e62a9-4f3b-4058-846b-150bc1c21aa0&pageurl=%2FPages%2FRSS-Feed-Page.aspx&web=%2F&wp=a19255e2-c8e3-41fd-8c99-f8bc0453cb58&xsl=1', official: true },
  { name: 'Google News — Aviation', domain: 'news.google.com', url: 'https://news.google.com/rss/search?q=aviation%20OR%20airline%20OR%20aircraft%20when%3A2d&hl=en-US&gl=US&ceid=US:en' },
];

const aviationTerms = /aviation|airline|aircraft|airport|airspace|pilot|flight|aerospace|airbus|boeing|helicopter|drone|runway|turbulence|engine|airworthiness/i;
const incidentTerms = /accident|incident|crash|emergency landing|fatal|injur|collision|runway excursion|investigation/i;

const clean = (value: string) => value
  .replace(/<!\[CDATA\[|\]\]>/g, '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'")
  .replace(/\s+/g, ' ').trim();

const tag = (xml: string, name: string) => xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'))?.[1] || '';
const imageFrom = (xml: string) => xml.match(/<(?:media:content|media:thumbnail|enclosure)[^>]+url=["']([^"']+)["']/i)?.[1];

const linkFrom = (xml: string) =>
  clean(tag(xml, 'link')) ||
  xml.match(/<link[^>]+href=["']([^"']+)["']/i)?.[1] ||
  clean(tag(xml, 'guid'));

function parseFeed(xml: string, source: Feed): FeedItem[] {
  const items = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
  return items.slice(0, 16).flatMap(item => {
    const headline = clean(tag(item, 'title'));
    const originalUrl = linkFrom(item);
    const summary = clean(tag(item, 'description')).slice(0, 650);
    if (!headline || !originalUrl || (!source.official && !aviationTerms.test(`${headline} ${summary}`))) return [];
    return [{ headline, summary: summary || 'A verified aviation update is available from the linked source.', originalUrl, imageUrl: imageFrom(item), source, incident: incidentTerms.test(`${headline} ${summary}`) || source.domain === 'ntsb.gov' }];
  });
}

async function gdeltCandidates(): Promise<FeedItem[]> {
  const endpoint = 'https://api.gdeltproject.org/api/v2/doc/doc?query=(aviation%20OR%20airline%20OR%20aircraft)%20language:english&mode=artlist&format=json&maxrecords=25&timespan=1d';
  const response = await fetch(endpoint, { next: { revalidate: 0 } });
  if (!response.ok) throw new Error('GDELT news discovery unavailable');
  const payload = await response.json() as { articles?: GdeltArticle[] };
  return (payload.articles || []).flatMap(article => {
    const headline = clean(article.title || '');
    const originalUrl = article.url || '';
    if (!headline || !originalUrl || !aviationTerms.test(headline)) return [];
    const domain = clean(article.domain || new URL(originalUrl).hostname.replace(/^www\./, ''));
    return [{
      headline,
      summary: 'A current aviation report is available from the linked original source.',
      originalUrl,
      imageUrl: article.socialimage,
      source: { name: domain || 'Aviation news source', domain: domain || 'news-source', url: originalUrl },
      incident: incidentTerms.test(headline),
    }];
  });
}

const fallbackImage = (headline: string) => {
  const h = headline.toLowerCase();
  if (/airport|runway|terminal/.test(h)) return 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1400&q=85';
  if (/helicopter|rotor/.test(h)) return 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1400&q=85';
  if (/engine|boeing|airbus|aircraft|airline|flight/.test(h)) return 'https://images.unsplash.com/photo-1529074963764-98f45c47344b?auto=format&fit=crop&w=1400&q=85';
  return 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=1400&q=85';
};

async function resolveArticleImage(item: FeedItem) {
  if (item.imageUrl?.startsWith('http')) return item.imageUrl;
  try {
    const response = await fetch(item.originalUrl, { redirect: 'follow', cache: 'no-store', headers: { 'user-agent': 'Mozilla/5.0 TravelWithSanjib/1.0' } });
    if (response.ok) {
      const html = (await response.text()).slice(0, 500000);
      const match = html.match(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image(?::src)?)["'][^>]+content=["']([^"']+)["']/i)
        || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image|twitter:image(?::src)?)["']/i);
      if (match?.[1]) return new URL(match[1].replace(/&amp;/g, '&'), response.url).toString();
    }
  } catch {}
  return fallbackImage(item.headline);
}

export async function GET(request: NextRequest) {
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return NextResponse.json({ error: 'Server configuration incomplete' }, { status: 500 });

  const supabase = createClient(url, key);
  const { data: setting } = await supabase.from('app_settings').select('value').eq('key', 'automation').maybeSingle();
  if (!setting?.value?.enabled) return NextResponse.json({ queued: 0, published: 0, message: 'News automation is paused' });

  const results = await Promise.allSettled(FEEDS.map(async source => {
    const response = await fetch(source.url, { next: { revalidate: 0 }, headers: { 'user-agent': 'TravelWithSanjibNewsBot/1.0 (+https://travelwithsanjib.vercel.app)' } });
    if (!response.ok) throw new Error(`${source.name} feed unavailable`);
    return parseFeed(await response.text(), source);
  }));
  const rssCandidates = results.flatMap(result => result.status === 'fulfilled' ? result.value : []);
  // Free worldwide discovery backup. Cards still link to the original publisher,
  // and nothing is published when no current source is available.
  const gdelt = await gdeltCandidates().catch(() => []);
  const candidates = [...rssCandidates, ...gdelt];
  const seen = new Set<string>();
  const unique = candidates.filter(item => !seen.has(item.originalUrl) && (seen.add(item.originalUrl), true));
  const incidents = unique.filter(item => item.incident).slice(0, 3);
  // Keep every candidate here. The loop below skips stories already published,
  // which lets the evening run find a different item from the morning one.
  const normal = unique.filter(item => !item.incident);

  let incidentsPublished = 0;
  let published = 0;
  for (const item of [...incidents, ...normal]) {
    if (!item.incident && published >= 1) continue;
    const { data: existing } = await supabase.from('news_articles').select('id').eq('original_url', item.originalUrl).maybeSingle();
    if (existing) continue;
    const { data: source } = await supabase.from('news_sources')
      .upsert({ name: item.source.name, domain: item.source.domain, reliability_score: item.source.official ? 100 : 70, is_active: true }, { onConflict: 'domain' })
      .select('id').single();
    const { data: article, error } = await supabase.from('news_articles').insert({
      source_id: source?.id, headline: item.headline, summary: item.summary,
      image_url: await resolveArticleImage(item), original_url: item.originalUrl, status: 'published',
      priority: item.incident ? 100 : 40, is_incident: item.incident,
      review_deadline: null, published_at: new Date().toISOString(),
    }).select('id').single();
    if (error || !article) continue;
    if (item.incident) incidentsPublished++;
    else published++;
  }

  return NextResponse.json({ published, incidents_published: incidentsPublished, checked_sources: FEEDS.map(feed => feed.name), message: 'News collection complete' });
}
