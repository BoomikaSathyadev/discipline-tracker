'use client';
import { useState, useEffect } from 'react';
import { DailyEntry, PartialEntry } from '@/lib/types';
import { calculateScore } from '@/lib/scoring';
import { calcSleepDuration, to12h, to24h } from '@/lib/utils';
import ScoreDisplay from './ScoreDisplay';
import ScoreBreakdownList from './ScoreBreakdownList';

interface Props {
  date: string;
  existing?: DailyEntry | null;
  onSave: (entry: DailyEntry) => void;
}

function blank(date: string): PartialEntry {
  return {
    date,
    sleep: { bedtime: '00:00', wakeTime: '00:00', durationHours: 0 },
    screenTime: { totalMinutes: 0, socialMediaMinutes: 0 },
    steps: 0, exercise: false, exerciseLevel: 'none', learningMinutes: 0, learningTopic: '',
    habits: { wokeUpOnTime: false, completedMainTask: false, keptOrganized: false, limitedSocialMedia: false, followedRoutine: false, readBook: false, drankWater: false, noAddedSugar: false },
    mood: 0, dayRating: 0, note: '',
  };
}

const habits = [
  { key: 'wokeUpOnTime' as const,      label: 'Woke up on time' },
  { key: 'completedMainTask' as const,  label: 'Completed main task' },
  { key: 'keptOrganized' as const,      label: 'Kept surroundings organized' },
  { key: 'limitedSocialMedia' as const, label: 'Limited social media' },
  { key: 'readBook' as const,           label: 'Read a book' },
  { key: 'followedRoutine' as const,    label: 'Followed my routine' },
  { key: 'drankWater' as const,         label: 'Drank 2–2.5L Water' },
  { key: 'noAddedSugar' as const,       label: 'No Added Sugar' },
];

export default function CheckInForm({ date, existing, onSave }: Props) {
  const [form, setForm] = useState<PartialEntry>(() => existing ? { ...existing } : blank(date));
  const [saved, setSaved] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => { setForm(existing ? { ...existing } : blank(date)); setSaved(false); }, [date, existing]);

  useEffect(() => {
    const dur = calcSleepDuration(form.sleep.bedtime, form.sleep.wakeTime);
    if (dur !== form.sleep.durationHours)
      setForm(f => ({ ...f, sleep: { ...f.sleep, durationHours: dur } }));
  }, [form.sleep.bedtime, form.sleep.wakeTime]);

  const breakdown = calculateScore(form);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const now = new Date().toISOString();
    onSave({ ...form, disciplineScore: breakdown.total, createdAt: existing?.createdAt ?? now, updatedAt: now });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function set<K extends keyof PartialEntry>(key: K, val: PartialEntry[K]) {
    setForm(f => ({ ...f, [key]: val }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 pb-6">

      {/* Score */}
      <Section>
        <div className="flex items-center gap-5">
          <ScoreDisplay score={breakdown.total} size="lg" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-neutral-400 mb-1.5">Today's score</p>
            <button type="button" onClick={() => setShowBreakdown(v => !v)}
              className="text-xs text-neutral-500 underline underline-offset-2 bg-transparent border-none p-0 cursor-pointer">
              {showBreakdown ? 'Hide breakdown' : 'How is this calculated?'}
            </button>
            {showBreakdown && <div className="mt-3"><ScoreBreakdownList breakdown={breakdown} /></div>}
          </div>
        </div>
      </Section>

      {/* Sleep */}
      <Section label="Sleep">
        <div className="grid grid-cols-2 gap-2">
          <Field label="Bedtime">
            <TimePicker value={form.sleep.bedtime} onChange={v => set('sleep', { ...form.sleep, bedtime: v })} />
          </Field>
          <Field label="Wake-up">
            <TimePicker value={form.sleep.wakeTime} onChange={v => set('sleep', { ...form.sleep, wakeTime: v })} />
          </Field>
        </div>
        <p className="text-xs text-neutral-400 mt-2">Duration: <span className="font-semibold text-neutral-700">{form.sleep.durationHours}h</span></p>
      </Section>

      {/* Screen time */}
      <Section label="Screen time">
        <div className="grid grid-cols-1 gap-3">
          <Field label="Total screen time">
            <DurationPicker value={form.screenTime.totalMinutes} onChange={v => set('screenTime', { ...form.screenTime, totalMinutes: v })} />
          </Field>
          <Field label="Social media">
            <DurationPicker value={form.screenTime.socialMediaMinutes} onChange={v => set('screenTime', { ...form.screenTime, socialMediaMinutes: v })} />
          </Field>
        </div>
      </Section>

      {/* Activity */}
      <Section label="Physical activity">
        <div className="grid grid-cols-2 gap-2">
          <Field label="Steps"><input type="number" min="0" step="100" value={form.steps || ''} placeholder="0" onChange={e => set('steps', +e.target.value)} /></Field>
          <Field label="Exercise">
            <div className="flex flex-col gap-1.5">
              {([
                ['faceYoga', 'Face Yoga'],
                ['workout', 'Workout'],
                ['fullExercise', 'Full Exercise'],
              ] as const).map(([level, label]) => {
                const selected = (form.exerciseLevel ?? (form.exercise ? 'fullExercise' : 'none')) === level;
                return (
                  <button key={level} type="button"
                    onClick={() => { const exerciseLevel = selected ? 'none' : level; set('exerciseLevel', exerciseLevel); set('exercise', exerciseLevel !== 'none'); }}
                    aria-pressed={selected}
                    className="w-full transition-colors"
                    style={{ padding: '8px 10px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: selected ? '#1a1a1a' : '#fff', color: selected ? '#fff' : '#737373', border: `1.5px solid ${selected ? '#1a1a1a' : '#e5e5e3'}` }}>
                    {label}
                  </button>
                );
              })}
            </div>
          </Field>
        </div>
      </Section>

      {/* Learning */}
      <Section label="Learning">
        <div className="grid grid-cols-2 gap-2">
          <Field label="Minutes studied"><input type="number" min="0" step="5" value={form.learningMinutes || ''} placeholder="0" onChange={e => set('learningMinutes', +e.target.value)} /></Field>
          <Field label="Topic"><input type="text" value={form.learningTopic} onChange={e => set('learningTopic', e.target.value)} /></Field>
        </div>
      </Section>

      {/* Habits */}
      <Section label="Habits">
        <div className="space-y-1.5">
          {habits.map(h => {
            const on = form.habits[h.key] ?? false;
            return (
              <label key={h.key} className="flex items-center gap-3 cursor-pointer"
                style={{ padding: '10px 12px', borderRadius: 10, background: on ? '#f5f5f4' : '#fafaf9', border: `1.5px solid ${on ? '#d4d4d0' : '#e5e5e3'}` }}>
                <span style={{
                  width: 20, height: 20, borderRadius: 6, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: on ? '#1a1a1a' : '#fff', border: `1.5px solid ${on ? '#1a1a1a' : '#d4d4d0'}`,
                }}>
                  {on && <svg viewBox="0 0 10 10" width="10" height="10"><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </span>
                <input type="checkbox" checked={on} onChange={e => set('habits', { ...form.habits, [h.key]: e.target.checked })} className="hidden" />
                <span style={{ fontSize: 14, color: on ? '#1a1a1a' : '#737373', fontWeight: on ? 500 : 400 }}>{h.label}</span>
              </label>
            );
          })}
          <p className="text-xs text-neutral-400 mt-2">Avoid added/free sugars; whole fruit and plain milk are okay.</p>
        </div>
      </Section>

      {/* Reflection */}
      <Section label="Reflection">
        <div className="grid grid-cols-2 gap-4 mb-3">
          <Field label={`Mood — ${form.mood}/10`}>
            <input type="range" min="0" max="10" value={form.mood} onChange={e => set('mood', +e.target.value)} className="w-full mt-1" />
          </Field>
          <Field label={`Day rating — ${form.dayRating}/10`}>
            <input type="range" min="0" max="10" value={form.dayRating} onChange={e => set('dayRating', +e.target.value)} className="w-full mt-1" />
          </Field>
        </div>
        <Field label="Note">
          <textarea value={form.note} placeholder="Anything worth remembering…" onChange={e => set('note', e.target.value)} rows={2} />
        </Field>
      </Section>

      <button type="submit" className="w-full transition-colors"
        style={{
          padding: '15px', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', border: 'none',
          background: saved ? '#f0fdf4' : '#1a1a1a',
          color: saved ? '#16a34a' : '#fff',
        }}>
        {saved ? 'Saved ✓' : existing ? 'Update check-in' : 'Save check-in'}
      </button>
    </form>
  );
}

function Section({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-4" style={{ border: '1px solid #e5e5e3' }}>
      {label && <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-3">{label}</p>}
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-neutral-500">{label}</label>
      {children}
    </div>
  );
}

const DURATION_HOURS = Array.from({ length: 25 }, (_, i) => i);
const DURATION_MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

function DurationPicker({ value, onChange }: { value: number; onChange: (mins: number) => void }) {
  const h = Math.floor(value / 60);
  const m = value % 60;

  const sel: React.CSSProperties = {
    background: '#fafaf9', border: '1.5px solid #e5e5e3', borderRadius: 10,
    padding: '10px 8px', fontSize: 14, color: '#1a1a1a', cursor: 'pointer',
    outline: 'none', appearance: 'none', WebkitAppearance: 'none', textAlign: 'center',
  };

  return (
    <div className="flex gap-1.5 items-center">
      <select value={h} onChange={e => onChange(+e.target.value * 60 + m)} style={{ ...sel, flex: 1 }}>
        {DURATION_HOURS.map(v => <option key={v} value={v}>{v}h</option>)}
      </select>
      <span className="text-neutral-400 font-semibold text-sm">:</span>
      <select value={m} onChange={e => onChange(h * 60 + +e.target.value)} style={{ ...sel, flex: 1 }}>
        {DURATION_MINUTES.map(v => <option key={v} value={v}>{String(v).padStart(2, '0')}m</option>)}
      </select>
    </div>
  );
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

function TimePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const parsed = to12h(value);
  const [hour, setHour] = useState(parsed.hour);
  const [minute, setMinute] = useState(parsed.minute);
  const [ampm, setAmpm] = useState<'AM' | 'PM'>(parsed.ampm);

  useEffect(() => {
    const p = to12h(value);
    setHour(p.hour); setMinute(p.minute); setAmpm(p.ampm);
  }, [value]);

  function update(h: number, m: number, ap: 'AM' | 'PM') {
    onChange(to24h(h, m, ap));
  }

  const sel: React.CSSProperties = {
    background: '#fafaf9', border: '1.5px solid #e5e5e3', borderRadius: 10,
    padding: '10px 8px', fontSize: 14, color: '#1a1a1a', cursor: 'pointer',
    outline: 'none', appearance: 'none', WebkitAppearance: 'none', textAlign: 'center',
  };

  return (
    <div className="flex gap-1.5 items-center">
      <select value={hour} onChange={e => { const h = +e.target.value; setHour(h); update(h, minute, ampm); }} style={{ ...sel, flex: 1 }}>
        {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
      </select>
      <span className="text-neutral-400 font-semibold text-sm">:</span>
      <select value={minute} onChange={e => { const m = +e.target.value; setMinute(m); update(hour, m, ampm); }} style={{ ...sel, flex: 1 }}>
        {MINUTES.map(m => <option key={m} value={m}>{String(m).padStart(2, '0')}</option>)}
      </select>
      <button type="button"
        onClick={() => { const ap = ampm === 'AM' ? 'PM' : 'AM'; setAmpm(ap); update(hour, minute, ap); }}
        style={{ ...sel, flex: 'none', padding: '10px 10px', fontWeight: 600, fontSize: 13, color: '#1a1a1a' }}>
        {ampm}
      </button>
    </div>
  );
}
