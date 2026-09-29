'use client';
import Link from 'next/link';
import {FormEvent,useEffect,useState} from 'react';
import {ArrowLeft,LogIn,LogOut,Mail,UserPlus,UserRound} from 'lucide-react';
import {createClient} from '@/lib/supabase';
import {trackEvent} from '@/lib/analytics';

export default function AccountPage(){
  const [mode,setMode]=useState<'signin'|'signup'>('signin');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [profileName,setProfileName]=useState('');
  const [accountEmail,setAccountEmail]=useState('');
  const [message,setMessage]=useState('');
  const [loading,setLoading]=useState(false);
  const [signedIn,setSignedIn]=useState(false);

  async function loadSignedInUser(){
    const s=createClient();
    if(!s)return;
    const {data:{user}}=await s.auth.getUser();
    if(!user){setSignedIn(false);setProfileName('');setAccountEmail('');return;}
    setSignedIn(true);
    setAccountEmail(user.email||'');
    const {data:p}=await s.from('profiles').select('username,display_name').eq('id',user.id).maybeSingle();
    setProfileName(p?.display_name||p?.username||user.email?.split('@')[0]||'Aviator');
  }

  useEffect(()=>{void loadSignedInUser()},[]);

  async function submit(e:FormEvent){
    e.preventDefault();setLoading(true);
    const s=createClient();
    if(!s){setMessage('Supabase is not configured.');setLoading(false);return}
    const r=mode==='signup'
      ?await s.auth.signUp({email,password,options:{emailRedirectTo:window.location.origin}})
      :await s.auth.signInWithPassword({email,password});
    const limited=r.error?.code==='over_email_send_rate_limit'||r.error?.message.toLowerCase().includes('email rate limit');
    setMessage(limited?'Too many confirmation emails were requested. Please wait about one hour, then try once more.':r.error?r.error.message:mode==='signup'?'Account created. Check your email to confirm it, then sign in.':'Signed in successfully.');
    if(!r.error&&mode==='signup')void trackEvent('account_created');
    if(!r.error&&mode==='signin')await loadSignedInUser();
    setLoading(false);
  }

  async function signOut(){
    setLoading(true);
    await createClient()?.auth.signOut();
    setSignedIn(false);setProfileName('');setAccountEmail('');setPassword('');
    setMessage('You are signed out.');setLoading(false);
  }

  return <main className="page">
    <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-[#AFC3D6]"><ArrowLeft size={16}/> Back to home</Link>
    <section className="card p-6">
      <p className="eyebrow">Your profile</p>
      <h1 className="mt-2 text-3xl font-bold">{signedIn?'Profile':mode==='signin'?'Welcome back':'Join the crew'}</h1>
      {signedIn?<>
        <div className="mt-6 flex items-center gap-4 rounded-2xl border border-line bg-ink p-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sky/15 text-sky"><UserRound size={24}/></span>
          <div className="min-w-0">
            <p className="truncate font-bold">{profileName||'Aviator'}</p>
            {accountEmail&&<p className="mt-1 truncate text-xs text-[#91A9C2]">{accountEmail}</p>}
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-[#AFC3D6]">You’re signed in. Your Sky Challenge scores and leaderboard activity are saved automatically.</p>
        <button onClick={signOut} disabled={loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-line py-3 text-sm font-bold"><LogOut size={17}/>{loading?'Please wait…':'Sign out'}</button>
      </>:<>
        <p className="mt-3 text-sm leading-6 text-[#AFC3D6]">Sign in to save your Sky Challenge score, streak, and leaderboard place.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-xs font-bold tracking-wider text-[#AFC3D6]">EMAIL<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-line bg-ink p-4 text-sm outline-none focus:border-sky" placeholder="you@example.com"/></label>
          <label className="block text-xs font-bold tracking-wider text-[#AFC3D6]">PASSWORD<input required minLength={6} type="password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-line bg-ink p-4 text-sm outline-none focus:border-sky" placeholder="At least 6 characters"/></label>
          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky py-4 text-sm font-bold text-ink">{mode==='signin'?<LogIn size={17}/>:<UserPlus size={17}/>} {loading?'Please wait…':mode==='signin'?'Sign in':'Create account'}</button>
        </form>
        <button onClick={()=>{setMode(mode==='signin'?'signup':'signin');setMessage('')}} className="mt-5 w-full text-sm text-sky">{mode==='signin'?'New here? Create an account':'Already have an account? Sign in'}</button>
      </>}
      {message&&<p className="mt-5 rounded-xl bg-sky/10 p-3 text-sm text-sky">{message}</p>}
    </section>
    <p className="mt-5 flex items-center gap-2 text-xs text-[#718AA5]"><Mail size={14}/> We use only the minimum account information needed to save your activity.</p>
  </main>
}
