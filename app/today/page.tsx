'use client';
import { useState, useEffect } from 'react';
import { DailyEntry } from '@/lib/types';
import { getAllEntries, saveEntry } from '@/lib/storage';
import { calculateStreaks } from '@/lib/streaks';
import { toLocalDateString, formatDisplayDate } from '@/lib/utils';
import CheckInForm from '@/components/CheckInForm';
import ScoreDisplay from '@/components/ScoreDisplay';

export default function TodayPage() {
  const today = toLocalDateString();
  const [existing, setExisting] = useState<DailyEntry | null>(null);
  const [streak, setStreak] = useState(0);
  const [editing, setEditing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    getAllEntries().then(entries => {
      setExisting(entries.find(e => e.date === today) ?? null);
      setStreak(calculateStreaks(entries).current);
    });
  }, [today]);

  async function handleSave(entry: DailyEntry) {
    await saveEntry(entry);
    setExisting(entry);
    setEditing(false);
    getAllEntries().then(entries => setStreak(calculateStreaks(entries).current));
  }

  if (!mounted) return null;

  return (
    <div className="max-w-lg mx-auto px-4">
      {/* Header */}
      <div className="pt-8 pb-5" style={{ borderBottom: '1px solid #e5e5e3' }}>
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-1">
          {formatDisplayDate(today)}
        </p>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-neutral-900">Discipline Tracker</h1>
          {streak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100">
              <span className="text-sm">🔥</span>
              <span className="text-sm font-bold text-neutral-700">{streak}</span>
            </div>
          )}
        </div>
      </div>

      <div className="pt-4">
        {/* Saved summary */}
        {existing && !editing && (
          <div className="mb-4 rounded-2xl overflow-hidden" style={{ border: '1px solid #e5e5e3' }}>
            <div className="px-4 py-2.5 flex items-center gap-2 bg-neutral-50" style={{ borderBottom: '1px solid #e5e5e3' }}>
              <span className="text-xs font-semibold text-neutral-500">✓ Today's check-in saved</span>
            </div>
            <div className="p-4 bg-white flex items-center gap-5">
              <ScoreDisplay score={existing.disciplineScore} size="lg" />
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                  <Stat icon="study" label="Study" value={`${existing.learningMinutes}m`} />
                  <Stat icon="steps" label="Steps" value={existing.steps.toLocaleString()} />
                  <Stat icon="rating" label="Rating" value={`${existing.dayRating}/10`} />
                </div>
                <button onClick={() => setEditing(true)}
                  className="mt-3 text-xs font-semibold px-3 py-1.5 rounded-lg text-neutral-500 cursor-pointer"
                  style={{ background: '#f7f7f5', border: '1px solid #e5e5e3' }}>
                  Edit entry →
                </button>
              </div>
            </div>
          </div>
        )}

          {!existing && streak > 0 && (
          <div className="flex items-center gap-3 mb-4 px-4 py-3 rounded-xl bg-neutral-50" style={{ border: '1px solid #e5e5e3' }}>
            <span className="text-lg">🔥</span>
            <span className="text-sm font-semibold text-neutral-600">{streak} day streak — keep it going!</span>
          </div>
        )}

        {(!existing || editing) && (
          <>
            {editing && (
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-neutral-500">Editing today's entry</p>
                <button onClick={() => setEditing(false)} className="text-xs font-medium text-neutral-400 cursor-pointer">Cancel</button>
              </div>
            )}
            <CheckInForm date={today} existing={existing} onSave={handleSave} />
          </>
        )}
      </div>
    </div>
  );
}

const icons = {
  study: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M4 19V6a2 2 0 0 1 2-2h13"/><path d="M4 19a2 2 0 0 0 2 2h13V8H6a2 2 0 0 0-2 2"/></svg>,
  steps: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M3 12h18M3 6h18M3 18h18"/></svg>,
  rating: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M12 20V4M5 11l7-7 7 7"/></svg>,
};

function Stat({ icon, label, value }: { icon: keyof typeof icons; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-neutral-400">{icons[icon]}</span>
      <div>
        <p className="text-[10px] leading-none text-neutral-400">{label}</p>
        <p className="text-xs font-bold text-neutral-800">{value}</p>
      </div>
    </div>
  );
}
