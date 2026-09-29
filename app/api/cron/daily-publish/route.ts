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
    const publishedAt = new Date(`${date}T${time}:00+05:30`).toISOString();
    const enrichedMedia = await relatedCommonsImages(daily.chronicle.title, daily.chronicle.media);
    const { error: chronicleError } = await supabase.from('chronicles').upsert({ ...daily.chronicle, media: enrichedMedia, status: 'published', published_at: publishedAt, automation_key: daily.key }, { onConflict: 'automation_key', ignoreDuplicates: true });
    chronicleStatus = chronicleError ? chronicleError.message : 'published';
  }
  // The official-source incident worker is optional and only runs when News
  // automation is enabled by an admin.
  const incidentNews = values.automation?.enabled
    ? await fetch(new URL('/api/cron/news', request.url), { headers: { authorization: `Bearer ${process.env.CRON_SECRET}` }, cache: 'no-store' })
    : null;
  return NextResponse.json({ day: index + 1, quiz: quizError ? quizError.message : '10 questions ready', chronicle: chronicleStatus, incident_news: incidentNews ? await incidentNews.json().catch(() => null) : 'paused' });
}
