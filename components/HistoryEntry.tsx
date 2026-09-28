import { DailyEntry } from '@/lib/types';
import { formatDisplayDate, formatMinutes } from '@/lib/utils';
import ScoreDisplay from './ScoreDisplay';

interface Props {
  entry: DailyEntry;
  onEdit?: () => void;
  onDelete?: () => void;
  compact?: boolean;
}

export default function HistoryEntry({ entry, onEdit, onDelete, compact = false }: Props) {
  if (compact) {
    return (
      <div className="bg-white rounded-2xl flex items-center gap-3 px-4 py-3" style={{ border: '1px solid #e5e5e3' }}>
        <ScoreDisplay score={entry.disciplineScore} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-neutral-800">{formatDisplayDate(entry.date)}</p>
          <div className="flex flex-wrap gap-x-3 mt-0.5">
            <span className="text-xs text-neutral-400">{entry.learningMinutes}m study</span>
            <span className="text-xs text-neutral-400">{entry.steps.toLocaleString()} steps</span>
            <span className="text-xs text-neutral-400">{formatMinutes(entry.screenTime.socialMediaMinutes)} social</span>
            <span className="text-xs text-neutral-400">{entry.dayRating}/10</span>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          {onEdit && <button onClick={onEdit} className="text-xs text-neutral-500 px-3 py-1.5 rounded-lg cursor-pointer" style={{ background: '#f7f7f5', border: '1px solid #e5e5e3' }}>Edit</button>}
          {onDelete && <button onClick={onDelete} className="text-xs px-3 py-1.5 rounded-lg cursor-pointer" style={{ color: '#dc2626', background: '#fff5f5', border: '1px solid #fecaca' }}>Del</button>}
        </div>
      </div>
    );
  }

  const stats = [
    ['Sleep', `${entry.sleep.durationHours}h`],
    ['Steps', entry.steps.toLocaleString()],
    ['Study', `${entry.learningMinutes} min`],
    ['Social media', formatMinutes(entry.screenTime.socialMediaMinutes)],
    ['Screen time', formatMinutes(entry.screenTime.totalMinutes)],
    ['Exercise', entry.exerciseLevel === 'faceYoga' ? 'Face Yoga' : entry.exerciseLevel === 'workout' ? 'Workout' : entry.exerciseLevel === 'fullExercise' || entry.exercise ? 'Full Exercise' : 'No'],
  ];

  return (
    <div className="bg-white rounded-2xl p-4 space-y-4" style={{ border: '1px solid #e5e5e3' }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base font-semibold text-neutral-800">{formatDisplayDate(entry.date)}</p>
          <p className="text-xs text-neutral-400 mt-0.5">Rating {entry.dayRating}/10 · Mood {entry.mood}/10</p>
        </div>
        <ScoreDisplay score={entry.disciplineScore} size="sm" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {stats.map(([l, v]) => (
          <div key={l} style={{ background: '#f7f7f5', borderRadius: 10, padding: '8px 12px' }}>
            <p className="text-[11px] text-neutral-400">{l}</p>
            <p className="text-sm font-semibold text-neutral-800 mt-0.5">{v}</p>
          </div>
        ))}
      </div>
      {entry.learningTopic && <p className="text-xs text-neutral-500">Topic: {entry.learningTopic}</p>}
      {entry.note && <p className="text-xs text-neutral-500 italic">"{entry.note}"</p>}
      <div className="flex gap-2">
        {onEdit && <button onClick={onEdit} className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer" style={{ background: '#f7f7f5', color: '#1a1a1a', border: '1px solid #e5e5e3' }}>Edit</button>}
        {onDelete && <button onClick={onDelete} className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer" style={{ background: '#fff5f5', color: '#dc2626', border: '1px solid #fecaca' }}>Delete</button>}
      </div>
    </div>
  );
}
