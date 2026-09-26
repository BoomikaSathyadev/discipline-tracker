'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearAllData } from '@/lib/storage';
import { createClient } from '@/lib/supabase';

export default function SettingsPage() {
  const router = useRouter();
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  function flash(text: string, ok: boolean) {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3000);
  }

  async function handleClear() {
    await clearAllData();
    setConfirmClear(false);
    flash('All data cleared.', true);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth');
    router.refresh();
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-8 pb-6">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Settings</h1>

      {msg && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm font-semibold"
          style={msg.ok
            ? { background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }
            : { background: '#fff5f5', color: '#dc2626', border: '1px solid #fecaca' }}>
          {msg.text}
        </div>
      )}

      <div className="space-y-2.5">
        <SettingCard title="Clear All Data" description="Permanently delete all check-in entries. This cannot be undone.">
          {confirmClear ? (
            <div className="flex gap-2">
              <button onClick={handleClear}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold cursor-pointer"
                style={{ background: '#dc2626', color: '#fff' }}>
                Yes, delete everything
              </button>
              <button onClick={() => setConfirmClear(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-neutral-500 cursor-pointer"
                style={{ background: '#f7f7f5', border: '1px solid #e5e5e3' }}>
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmClear(true)}
              className="w-full py-2.5 rounded-xl text-sm font-semibold cursor-pointer"
              style={{ background: '#fff5f5', color: '#dc2626', border: '1px solid #fecaca' }}>
              Clear All Data
            </button>
          )}
        </SettingCard>

        <SettingCard title="Account" description="Sign out of your account on this device.">
          <button onClick={handleLogout}
            className="w-full py-2.5 rounded-xl text-sm font-semibold cursor-pointer"
            style={{ background: '#f7f7f5', color: '#1a1a1a', border: '1px solid #e5e5e3' }}>
            Log out
          </button>
        </SettingCard>

        <div className="rounded-2xl p-5 text-center space-y-1 bg-white" style={{ border: '1px solid #e5e5e3' }}>
          <p className="text-sm font-semibold text-neutral-800">Discipline Tracker</p>
          <p className="text-xs text-neutral-400">Version 1.0 · Data synced to cloud</p>
        </div>
      </div>
    </div>
  );
}

function SettingCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-4 space-y-3" style={{ border: '1px solid #e5e5e3' }}>
      <div>
        <p className="text-sm font-semibold text-neutral-800">{title}</p>
        <p className="text-xs text-neutral-400 mt-0.5">{description}</p>
      </div>
      {children}
    </div>
  );
}
