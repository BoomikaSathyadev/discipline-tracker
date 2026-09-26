import { ScoreBreakdown } from '@/lib/scoring';

export default function ScoreBreakdownList({ breakdown }: { breakdown: ScoreBreakdown }) {
  return (
    <div className="space-y-2.5">
      {breakdown.items.map(item => (
        <div key={item.label} className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex justify-between mb-1">
              <span style={{ fontSize: 12, color: '#6b6b6b' }}>{item.label}</span>
              <span style={{ fontSize: 12, color: item.earned === item.max ? '#1a1a1a' : '#b0b0aa', fontWeight: 600 }}>
                {item.earned}/{item.max}
              </span>
            </div>
            <div style={{ height: 3, background: '#ebebea', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${(item.earned / item.max) * 100}%`,
                background: item.earned === item.max ? '#1a1a1a' : item.earned > 0 ? '#6b6b6b' : '#ebebea',
                borderRadius: 2,
                transition: 'width 0.4s ease',
              }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
