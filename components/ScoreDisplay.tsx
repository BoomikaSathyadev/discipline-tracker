import { scoreMessage, MAX_SCORE } from '@/lib/scoring';

interface Props {
  score: number;
  size?: 'sm' | 'lg';
}

export default function ScoreDisplay({ score, size = 'lg' }: Props) {
  const r = size === 'lg' ? 40 : 24;
  const cx = size === 'lg' ? 48 : 30;
  const svgSize = size === 'lg' ? 96 : 60;
  const strokeW = size === 'lg' ? 5 : 4;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / MAX_SCORE) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: svgSize, height: svgSize }}>
        <svg width={svgSize} height={svgSize} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={cx} cy={cx} r={r} fill="none" stroke="#f0f0ee" strokeWidth={strokeW} />
          <circle cx={cx} cy={cx} r={r} fill="none" stroke="#1a1a1a" strokeWidth={strokeW}
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span style={{ fontSize: size === 'lg' ? 24 : 15, fontWeight: 700, color: '#1a1a1a', lineHeight: 1 }}>{score}</span>

        </div>
      </div>
      {size === 'lg' && (
        <p className="text-xs font-medium text-neutral-500">{scoreMessage(score)}</p>
      )}
    </div>
  );
}
