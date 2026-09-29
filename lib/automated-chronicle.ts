export type GeneratedChronicle = {
  kind: 'story';
  title: string;
  excerpt: string;
  body: string;
  media: string[];
};

const NTSB_REPORTS_FEED =
  'https://www.ntsb.gov/_layouts/feed.aspx?page=674e62a9-4f3b-4058-846b-150bc1c21aa0&pageurl=%2FPages%2FRSS-Feed-Page.aspx&web=%2F&wp=4d4ae30f-92c9-4e6c-9c58-6bac99822531&xsl=1';

function decode(value: string) {
  return value.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}
function text(value: string) { return decode(value).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); }
function tag(item: string, name: string) {
  const start = item.toLowerCase().indexOf('<' + name.toLowerCase());
  if (start < 0) return '';
  const open = item.indexOf('>', start);
  const end = item.toLowerCase().indexOf('</' + name.toLowerCase() + '>', open);
  return open >= 0 && end >= 0 ? item.slice(open + 1, end) : '';
}

async function sourceFromNtsb(seed: number) {
  const response = await fetch(NTSB_REPORTS_FEED, { cache: 'no-store', headers: { 'user-agent': 'TravelWithSanjib/1.0' } });
  if (!response.ok) return null;
  const xml = await response.text();
  const rawItems = xml.split(/<item[^>]*>/i).slice(1).map(x => x.split(/<\/item>/i)[0]);
  const items = rawItems.map(item => ({
    title: text(tag(item, 'title')),
    url: decode(tag(item, 'link')).trim(),
    summary: text(tag(item, 'description')),
  })).filter(x => x.title && x.url && /aviation|aircraft|airplane|flight|pilot|helicopter|airport|runway|airline/i.test(x.title + ' ' + x.summary));
  if (!items.length) return null;
  return items[Math.abs(seed) % items.length];
}

type OpenAIResponsePayload = {
  output_text?: string;
  output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
};

function outputText(payload: OpenAIResponsePayload): string {
  if (typeof payload.output_text === 'string') return payload.output_text;
  for (const item of payload.output || []) {
    for (const part of item.content || []) {
      if (part.type === 'output_text' && typeof part.text === 'string') return part.text;
    }
  }
  return '';
}

export async function generateOfficialChronicle(seed: number): Promise<GeneratedChronicle | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  try {
    const source = await sourceFromNtsb(seed);
    if (!source) return null;
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { authorization: 'Bearer ' + apiKey, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-5-mini',
        input: [
          { role: 'system', content: 'Write a factual aviation Chronicle only from the supplied official NTSB material. Do not invent names, dates, aircraft, causes, findings, casualties, quotations or recommendations. If the source does not support a detail, omit it. Write for general aviation enthusiasts in clear English. The body must be a substantial multi-paragraph story and end with a section headed LESSON. Explicitly identify NTSB as the official source and include the supplied source URL.' },
          { role: 'user', content: JSON.stringify(source) }
        ],
        text: { format: { type: 'json_schema', name: 'aviation_chronicle', strict: true, schema: {
          type: 'object', additionalProperties: false,
          properties: { title: { type: 'string' }, excerpt: { type: 'string' }, body: { type: 'string' } },
          required: ['title','excerpt','body']
        } } },
        max_output_tokens: 2600
      })
    });
    if (!response.ok) return null;
    const payload = await response.json();
    const raw = outputText(payload);
    if (!raw) return null;
    const story = JSON.parse(raw) as { title: string; excerpt: string; body: string };
    if (!story.title || !story.excerpt || !story.body || story.body.length < 900) return null;
    return { kind: 'story', title: story.title, excerpt: story.excerpt, body: story.body, media: [] };
  } catch { return null; }
}
