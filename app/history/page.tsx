'use client';
import { useState, useEffect } from 'react';
import { DailyEntry } from '@/lib/types';
import { getAllEntries, saveEntry, deleteEntry } from '@/lib/storage';
import { toLocalDateString } from '@/lib/utils';
import HistoryEntryComp from '@/components/HistoryEntry';
import CheckInForm from '@/components/CheckInForm';

function monthLabel(month: string) {
  const [year, value] = month.split('-').map(Number);
  return new Date(year, value - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(() => toLocalDateString().slice(0, 7));
  const [editing, setEditing] = useState<DailyEntry | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); getAllEntries().then(setEntries); }, []);

  const currentMonth = toLocalDateString().slice(0, 7);
  const availableMonths = Array.from(new Set([
    currentMonth,
    ...entries.map(entry => entry.date.slice(0, 7)),
  ])).sort((a, b) => b.localeCompare(a));
  const monthEntries = entries.filter(entry => entry.date.slice(0, 7) === selectedMonth);

  useEffect(() => {
    if (!availableMonths.includes(selectedMonth)) setSelectedMonth(currentMonth);
  }, [entries, selectedMonth, currentMonth]);

  async function handleSave(entry: DailyEntry) {
    await saveEntry(entry);
    getAllEntries().then(setEntries);
    setEditing(null);
  }

  async function handleDelete(date: string) {
    await deleteEntry(date);
    getAllEntries().then(setEntries);
    setConfirmDelete(null);
  }

  if (!mounted) return null;

  if (editing) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-8">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold text-neutral-900">Edit Entry</h1>
          <button onClick={() => setEditing(null)} className="text-sm font-medium px-3 py-1.5 rounded-lg text-neutral-500 cursor-pointer" style={{ background: '#f7f7f5', border: '1px solid #e5e5e3' }}>← Back</button>
        </div>
        <CheckInForm date={editing.date} existing={editing} onSave={handleSave} />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-8 pb-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-neutral-900">History</h1>
        <select
          aria-label="Select history month"
          value={selectedMonth}
          onChange={event => setSelectedMonth(event.target.value)}
          className="px-3 py-2 rounded-xl text-sm font-medium text-neutral-600 cursor-pointer"
          style={{ background: '#f7f7f5', border: '1px solid #e5e5e3' }}>
          {availableMonths.map(month => <option key={month} value={month}>{monthLabel(month)}</option>)}
        </select>
      </div>

      {monthEntries.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-sm font-medium text-neutral-400">
            {entries.length === 0 ? 'No entries yet.' : `No entries for ${monthLabel(selectedMonth)}.`}
          </p>
          {entries.length === 0 && <p className="text-xs mt-1 text-neutral-300">Complete your first check-in to get started.</p>}
        </div>
      ) : (
        <div className="space-y-2.5">
          {monthEntries.map(entry => (
            <div key={entry.date}>
              {confirmDelete === entry.date ? (
                <div className="rounded-2xl p-4 flex items-center justify-between gap-3 bg-white" style={{ border: '1px solid #fecaca' }}>
                  <p className="text-sm font-medium text-red-500">Delete this entry?</p>
                  <div className="flex gap-2">
                    <button onClick={() => handleDelete(entry.date)} className="px-4 py-2 rounded-xl text-sm font-bold cursor-pointer" style={{ background: '#dc2626', color: '#fff' }}>Delete</button>
                    <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-500 cursor-pointer" style={{ background: '#f7f7f5', border: '1px solid #e5e5e3' }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <HistoryEntryComp
                  entry={entry}
                  compact
                  onEdit={() => setEditing(entry)}
                  onDelete={() => setConfirmDelete(entry.date)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
