'use client';
import { useState, useEffect } from 'react';
import { DailyEntry } from '@/lib/types';
import { getAllEntries, saveEntry, deleteEntry } from '@/lib/storage';
import HistoryEntryComp from '@/components/HistoryEntry';
import CheckInForm from '@/components/CheckInForm';

export default function HistoryPage() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [editing, setEditing] = useState<DailyEntry | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); getAllEntries().then(setEntries); }, []);

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
      <h1 className="text-2xl font-bold text-neutral-900 mb-5">History</h1>

      {entries.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-sm font-medium text-neutral-400">No entries yet.</p>
          <p className="text-xs mt-1 text-neutral-300">Complete your first check-in to get started.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {entries.map(entry => (
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
