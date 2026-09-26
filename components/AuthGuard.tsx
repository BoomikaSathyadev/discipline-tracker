'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import BottomNav from '@/components/BottomNav';
import type { User } from '@supabase/supabase-js';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user === undefined) return;
    if (!user && pathname !== '/auth') router.replace('/auth');
    if (user && pathname === '/auth') router.replace('/today');
  }, [user, pathname, router]);

  // Still loading
  if (user === undefined) return null;

  // Not logged in — show nothing while redirecting
  if (!user && pathname !== '/auth') return null;

  // On auth page — no nav
  if (pathname === '/auth') return <>{children}</>

  return <>{children}<BottomNav /></>;

  return <>{children}</>;
}
