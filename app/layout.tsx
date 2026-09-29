import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title:'Travel With Sanjib', description:'Your Aviation World', manifest:'/manifest.json' };
export const viewport = { themeColor: '#07111F' };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }
