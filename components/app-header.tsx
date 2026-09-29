'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Plane, ShieldCheck, UserRound } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export function AppHeader() {
  const [staff, setStaff] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    const client = createClient();
    if (client === null) return;
    const activeClient = client;

    async function loadAccount() {
      const { data: { user } } = await activeClient.auth.getUser();
      if (!user) {
        setStaff(false);
        setName('');
        return;
      }

      const { data: profile } = await activeClient
        .from('profiles')
        .select('role, username, display_name')
        .eq('id', user.id)
        .maybeSingle();

      setStaff(Boolean(profile && ['admin', 'editor', 'moderator'].includes(profile.role)));
      setName(profile?.display_name || profile?.username || user.email?.split('@')[0] || 'Aviator');
    }

    void loadAccount();
    const { data: { subscription } } = activeClient.auth.onAuthStateChange(() => {
      void loadAccount();
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="mb-8 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky text-ink"><Plane size={19} /></span>
        <div>
          <div className="text-xs font-bold tracking-[.14em]">TRAVEL WITH SANJIB</div>
          <div className="text-[10px] text-[#91A9C2]">Your Aviation World</div>
        </div>
      </Link>
      <span className="flex items-start gap-2">
        <Link href="/account" aria-label="Account" className="flex max-w-[74px] flex-col items-center gap-1 text-[#91A9C2]">
          <span className="rounded-xl border border-line p-2"><UserRound size={18} /></span>
          {name && <span className="max-w-full truncate text-[10px] font-semibold leading-none text-sky">{name}</span>}
        </Link>
        {staff && <Link href="/admin" aria-label="Admin access" className="rounded-xl border border-line p-2 text-[#91A9C2]"><ShieldCheck size={18} /></Link>}
      </span>
    </header>
  );
}
