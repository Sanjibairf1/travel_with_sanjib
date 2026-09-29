import {createClient} from '@/lib/supabase';

export async function trackEvent(eventName:string){
  try{
    const supabase=createClient();
    if(!supabase)return;
    await supabase.from('analytics_events').insert({event_name:eventName});
  }catch{}
}

export function sourceFromLocation(){
  if(typeof window==='undefined')return '';
  const source=new URLSearchParams(window.location.search).get('src')?.toLowerCase();
  if(source)return source.replace(/[^a-z0-9_-]/g,'').slice(0,32);
  const ref=document.referrer.toLowerCase();
  if(ref.includes('instagram.com')||ref.includes('l.instagram.com'))return 'instagram';
  return '';
}
