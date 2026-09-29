'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowLeft, Check, X } from 'lucide-react';
import { createClient } from '@/lib/supabase';

type Alert = { id: string; headline: string; summary: string; review_deadline: string | null };
type Notice = { id: string; title: string; body: string | null; created_at: string };
export default function Alerts() {
  const [items, setItems] = useState<Alert[]>([]); const [notices, setNotices] = useState<Notice[]>([]); const [message, setMessage] = useState(''); const s = createClient();
  async function load() { if (!s) return; const [incidents, notifications] = await Promise.all([s.from('news_articles').select('id,headline,summary,review_deadline').eq('status', 'review').eq('is_incident', true).order('review_deadline'), s.from('admin_notifications').select('id,title,body,created_at').is('read_at', null).order('created_at', { ascending: false })]); setItems((incidents.data || []) as Alert[]); setNotices((notifications.data || []) as Notice[]); if (incidents.error || notifications.error) setMessage(incidents.error?.message || notifications.error?.message || 'Could not load alerts.'); }
  useEffect(() => { void load(); }, []);
  async function decide(id: string, status: 'published' | 'rejected') { if (!s) return; const { error } = await s.from('news_articles').update({ status, published_at: status === 'published' ? new Date().toISOString() : null }).eq('id', id); setMessage(error ? error.message : `Article ${status}.`); void load(); }
  return <main className="page"><Link href="/admin" className="mb-6 inline-flex items-center gap-2 text-sm text-[#AFC3D6]"><ArrowLeft size={16} /> Dashboard</Link><p className="eyebrow">Priority review</p><h1 className="mt-1 flex items-center gap-2 text-3xl font-bold"><AlertTriangle className="text-amber" /> Urgent Alerts</h1>{message && <p className="mt-4 rounded-xl bg-sky/10 p-3 text-sm text-sky">{message}</p>}<section className="mt-7 space-y-3">{notices.map(n => <article className="card border-amber/30 p-4" key={n.id}><p className="text-[10px] font-bold tracking-widest text-amber">ADMIN NOTICE</p><h2 className="mt-1 font-bold">{n.title}</h2>{n.body && <p className="mt-2 text-sm text-[#B8CCDE]">{n.body}</p>}</article>)}{items.length === 0 && notices.length === 0 && <div className="card p-5 text-sm text-[#AFC3D6]">No urgent alerts awaiting review.</div>}{items.map(x => <article className="card border-amber/30 p-5" key={x.id}><h2 className="font-bold">{x.headline}</h2><p className="mt-2 text-sm text-[#B8CCDE]">{x.summary}</p><div className="mt-4 flex gap-2"><button onClick={() => decide(x.id, 'published')} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-sky py-3 text-xs font-bold text-ink"><Check size={15} /> Approve</button><button onClick={() => decide(x.id, 'rejected')} className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-[#FF8E8E]/50 py-3 text-xs text-[#FF8E8E]"><X size={15} /> Reject</button></div></article>)}</section></main>;
}
