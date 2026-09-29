'use client';
import Link from 'next/link'; import {Home, Trophy, BookOpen, Newspaper} from 'lucide-react'; import {usePathname} from 'next/navigation';
const items=[['/','Home',Home],['/challenge','Challenge',Trophy],['/chronicles','Chronicles',BookOpen],['/news','News',Newspaper]] as const;
export function BottomNav(){const path=usePathname(); return <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-line bg-[#081523]/95 px-5 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur"><div className="mx-auto flex max-w-[680px] justify-between">{items.map(([href,label,Icon])=><Link href={href} key={href} className={'nav-item '+(path===href?'active':'')}><Icon size={20} strokeWidth={path===href?2.5:1.8}/><span>{label}</span></Link>)}</div></nav>}
