'use client';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { DailyEntry } from '@/lib/types';
import { formatShortDate } from '@/lib/utils';

interface ChartData { date: string; value: number; }

function buildData(entries: DailyEntry[], days: number, fn: (e: DailyEntry) => number): ChartData[] {
  return [...entries].sort((a, b) => a.date.localeCompare(b.date)).slice(-days)
    .map(e => ({ date: formatShortDate(e.date), value: fn(e) }));
}

function Chart({ data, unit }: { data: ChartData[]; unit?: string }) {
  if (data.length < 2) return (
    <p className="text-xs text-neutral-400 text-center py-5">Not enough data yet</p>
  );
  return (
    <ResponsiveContainer width="100%" height={110}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0ee" />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#a3a3a3' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#a3a3a3' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: '#fff', border: '1px solid #e5e5e3', borderRadius: 8, fontSize: 12, color: '#1a1a1a', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          formatter={(v) => [`${v}${unit ?? ''}`, '']}
          labelStyle={{ color: '#737373' }}
          cursor={{ stroke: '#e5e5e3' }}
        />
        <Line type="monotone" dataKey="value" stroke="#1a1a1a" strokeWidth={1.5}
          dot={{ r: 2.5, fill: '#1a1a1a', strokeWidth: 0 }}
          activeDot={{ r: 4, fill: '#1a1a1a', strokeWidth: 0 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-4" style={{ border: '1px solid #e5e5e3' }}>
      <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3">{title}</p>
      {children}
    </div>
  );
}

interface Props { entries: DailyEntry[]; days?: number; }

export function ScoreChart({ entries, days = 7 }: Props) {
  return <ChartCard title={`Score — last ${days} days`}><Chart data={buildData(entries, days, e => e.disciplineScore)} /></ChartCard>;
}
export function LearningChart({ entries, days = 7 }: Props) {
  return <ChartCard title={`Study time — last ${days} days`}><Chart data={buildData(entries, days, e => e.learningMinutes)} unit=" min" /></ChartCard>;
}
export function SocialMediaChart({ entries, days = 7 }: Props) {
  return <ChartCard title={`Social media — last ${days} days`}><Chart data={buildData(entries, days, e => e.screenTime.socialMediaMinutes)} unit="m" /></ChartCard>;
}
