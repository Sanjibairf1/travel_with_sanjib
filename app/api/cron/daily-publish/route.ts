import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { freeDailyContent } from '@/lib/free-daily-library';

const dateInTimezone = (timezone: string) => new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date());
const dayNumber = (date: string, start: string) => Math.floor((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86400000);

async function relatedCommonsImages(title: string, fallback: string[]) {
  try {
    const query = encodeURIComponent(title.replace(/[:–—]/g, ' '));
    const endpoint = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${query}&gsrnamespace=6&gsrlimit=4&prop=imageinfo&iiprop=url&iiurlwidth=1400&format=json&origin=*`;
    const response = await fetch(endpoint, { cache: 'no-store' });
    if (!response.ok) return fallback;
    const payload = await response.json() as { query?: { pages?: Record<string, { imageinfo?: Array<{ thumburl?: string; url?: string }> }> } };
    const urls = Object.values(payload.query?.pages || {}).flatMap(page => page.imageinfo?.[0]?.thumburl || page.imageinfo?.[0]?.url || []).filter(Boolean);
    // Use the curated story images unless Commons produced a complete set.
    // This avoids mixing a single possibly unrelated search result into a story.
    return urls.length >= 3 ? urls.slice(0, 3) : fallback;
  } catch { return fallback; }
}


const decodeXml = (value: string) => value
  .replace(/<!\\[CDATA\\[|\\]\\]>/g, '')
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>');

const plainText = (value: string) => decodeXml(value)
  .replace(/<script[\\s\\S]*?<\\/script>/gi, ' ')
  .replace(/<style[\\s\\S]*?<\\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\\s+/g, ' ').trim();

async function officialNtsbStory(storyNumber: number) {
  try {
    const feedUrl = 'https://www.ntsb.gov/_layouts/feed.aspx?page=674e62a9-4f3b-4058-846b-150bc1c21aa0&pageurl=%2FPages%2FRSS-Feed-Page.aspx&web=%2F&wp=a19255e2-c8e3-41fd-8c99-f8bc0453cb58&xsl=1';
    const feed = await fetch(feedUrl, { cache: 'no-store', headers: { 'user-agent': 'TravelWithSanjib/1.0' } });
    if (!feed.ok) return null;
    const xml = await feed.text();
    const items = [...xml.matchAll(/<item\\b[\\s\\S]*?<\\/item>/gi)].map(match => match[0]);
    const parsed = items.map(item => ({
      title: plainText(item.match(/<title[^>]*>([\\s\\S]*?)<\\/title>/i)?.[1] || ''),
      link: decodeXml(item.match(/<link[^>]*>([\\s\\S]*?)<\\/link>/i)?.[1] || '').trim(),
      description: plainText(item.match(/<description[^>]*>([\\s\\S]*?)<\\/description>/i)?.[1] || ''),
    })).filter(item => item.title && item.link && /aviation|aircraft|airplane|flight|pilot|helicopter|airport|runway|airline/i.test(item.title + ' ' + item.description));
    if (!parsed.length) return null;
    const picked = parsed[(Math.max(1, storyNumber) - 1) % parsed.length];
    const page = await fetch(picked.link, { cache: 'no-store', headers: { 'user-agent': 'TravelWithSanjib/1.0' } });
    const html = page.ok ? await page.text() : '';
    const pageText = plainText(html);
    const useful = pageText.length >= 500 ? pageText.slice(0, 6500) : picked.description;
    if (useful.length < 180) return null;
    const lesson = 'LESSON\\nOfficial investigation material is most useful when we focus on the chain of events, contributing factors and safety actions—not on blame or speculation.';
    return {
      kind: 'story' as const,
      title: picked.title,
      excerpt: (picked.description || useful).slice(0, 320),
      body: useful + '\\n\\n' + lesson + '\\n\\nOfficial source: ' + picked.link,
      media: [] as string[],
      sourceUrl: picked.link,
    };
  } catch { return null; }
}

export async function GET(request: NextRequest) {
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return NextResponse.json({ error: 'Server configuration incomplete' }, { status: 500 });
  const supabase = createClient(url, key);
  const { data: settings } = await supabase.from('app_settings').select('key,value').in('key', ['automation', 'publishing', 'daily_content_library']);
  const values = Object.fromEntries((settings || []).map(row => [row.key, row.value as Record<string, unknown>]));
  // Quiz and Chronicle publishing use the free daily library. News review is a
  // separate optional workflow, so disabling it must not stop daily content.
  if (!values.daily_content_library?.enabled) return NextResponse.json({ message: 'Daily content automation is paused' });
  const timezone = String(values.publishing?.timezone || 'Asia/Kolkata'); const date = dateInTimezone(timezone); const start = String(values.daily_content_library?.start_date || '2026-09-01'); const index = dayNumber(date, start);
  if (index < 0) return NextResponse.json({ message: 'Daily content schedule has not started yet', day: index + 1 });
  const daily = freeDailyContent(index);
  const quizRows = daily.questions.map((question, i) => ({ ...question, difficulty: `${question.difficulty}-${String(i + 1).padStart(2, '0')}`, quiz_date: date, is_published: true }));
  // Existing schema has a unique (quiz_date,difficulty) key. A numbered suffix
  // lets us safely publish ten automatic questions without a database migration.
  const { error: quizError } = await supabase.from('quiz_questions').upsert(quizRows, { onConflict: 'quiz_date,difficulty', ignoreDuplicates: true });
  let chronicleStatus = 'not due today';
  if (daily.chronicle) {
    const time = String(values.publishing?.chronicles_time || '19:00');
    const storyNumber = Math.floor(index / 3) + 1;
    const sourcedStory = await officialNtsbStory(storyNumber);
    const chronicle = sourcedStory || daily.chronicle;
    const publishedAt = new Date(`${date}T${time}:00+05:30`).toISOString();
    const fallbackMedia = daily.chronicle.media;
    const enrichedMedia = await relatedCommonsImages(chronicle.title, chronicle.media.length ? chronicle.media : fallbackMedia);
    const { sourceUrl: _sourceUrl, ...storyRow } = chronicle as typeof chronicle & { sourceUrl?: string };
    const automationKey = sourcedStory ? 'ntsb-story-' + date : daily.key;
    const { error: chronicleError } = await supabase.from('chronicles').upsert({ ...storyRow, media: enrichedMedia, status: 'published', published_at: publishedAt, automation_key: automationKey }, { onConflict: 'automation_key', ignoreDuplicates: true });
    chronicleStatus = chronicleError ? chronicleError.message : 'published';
  }
  // The official-source incident worker is optional and only runs when News
  // automation is enabled by an admin.
  const incidentNews = values.automation?.enabled
    ? await fetch(new URL('/api/cron/news', request.url), { headers: { authorization: `Bearer ${process.env.CRON_SECRET}` }, cache: 'no-store' })
    : null;
  return NextResponse.json({ day: index + 1, quiz: quizError ? quizError.message : '10 questions ready', chronicle: chronicleStatus, incident_news: incidentNews ? await incidentNews.json().catch(() => null) : 'paused' });
}
