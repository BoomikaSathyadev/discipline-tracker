'use client';
import { useState, useEffect } from 'react';
import { DailyEntry } from '@/lib/types';
import { getAllEntries } from '@/lib/storage';
import { calculateStreaks } from '@/lib/streaks';
import { ScoreChart, LearningChart, ScreenTimeChart } from '@/components/Charts';

function avg(nums: number[]) {
  if (!nums.length) return 0;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
}

function StatCard({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div className="bg-white rounded-2xl p-4" style={{ border: '1px solid #e5e5e3' }}>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">{label}</p>
      <p className="text-2xl font-bold text-neutral-900">
        {value}
        {unit && <span className="text-sm font-normal text-neutral-400 ml-1">{unit}</span>}
      </p>
    </div>
  );
}

export default function ProgressPage() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [range, setRange] = useState<7 | 30>(7);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); getAllEntries().then(setEntries); }, []);

  if (!mounted) return null;

  const recent = entries.slice(0, range);
  const streaks = calculateStreaks(entries);
  const stats = {
    avgScore: avg(recent.map(e => e.disciplineScore)),
    avgStudy: avg(recent.map(e => e.learningMinutes)),
    avgSteps: avg(recent.map(e => e.steps)),
    avgSleep: avg(recent.map(e => e.sleep.durationHours)),
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-8 pb-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-neutral-900">Progress</h1>
        <div className="flex rounded-xl p-0.5 gap-0.5 bg-neutral-100">
          {([7, 30] as const).map(r => (
            <button key={r} onClick={() => setRange(r)}
              className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer"
              style={range === r
                ? { background: '#fff', color: '#1a1a1a', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
                : { background: 'transparent', color: '#a3a3a3' }}>
              {r}d
            </button>
          ))}
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">📈</p>
          <p className="text-sm font-medium text-neutral-400">Complete some check-ins to see your progress.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Streaks */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4" style={{ border: '1px solid #e5e5e3' }}>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">🔥 Current streak</p>
              <p className="text-2xl font-bold text-neutral-900">{streaks.current}<span className="text-sm font-normal text-neutral-400 ml-1">days</span></p>
            </div>
            <div className="bg-white rounded-2xl p-4" style={{ border: '1px solid #e5e5e3' }}>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">🏆 Best streak</p>
              <p className="text-2xl font-bold text-neutral-900">{streaks.best}<span className="text-sm font-normal text-neutral-400 ml-1">days</span></p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Avg Score" value={stats.avgScore} unit="/ 100" />
            <StatCard label="Avg Study" value={stats.avgStudy} unit="min" />
            <StatCard label="Avg Steps" value={stats.avgSteps.toLocaleString()} />
            <StatCard label="Avg Sleep" value={stats.avgSleep} unit="h" />
            <div className="col-span-2"><StatCard label="Entries" value={recent.length} /></div>
          </div>

          <ScoreChart entries={entries} days={range} />
          <LearningChart entries={entries} days={range} />
          <ScreenTimeChart entries={entries} days={range} />
        </div>
      )}
    </div>
  );
}
