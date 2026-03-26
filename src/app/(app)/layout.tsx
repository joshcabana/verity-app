import type { Metadata } from 'next';
import { BottomNav } from '@/components/BottomNav';
import { PushPrompt } from '@/components/PushPrompt';

export const metadata: Metadata = {
  title: {
    template: '%s — Verity',
    default: 'Verity — Real Dates. Real People.',
  },
  description: 'Video-first dating built on trust and genuine connection.',
  openGraph: {
    siteName: 'Verity',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <PushPrompt />
      <BottomNav />
    </>
  );
}
