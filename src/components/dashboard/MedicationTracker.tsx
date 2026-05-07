"use client";

interface Props {
  adherence: number;
  streak: number;
}

export default function MedicationTracker({ adherence, streak }: Props) {
  return (
    <div className="med-root">
      <div className="med-header">
        <span className="med-label">Medication Adherence</span>
      </div>
      <div className="med-body">
        <div className="med-ring-container">
          <svg width="80" height="80" viewBox="0 0 80 80" className="med-ring">
            <circle cx="40" cy="40" r="34" fill="none" stroke="var(--chart-grid)" strokeWidth="4" />
            <circle
              cx="40" cy="40" r="34"
              fill="none"
              stroke="var(--chart-line)"
              strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 34 * adherence / 100} ${2 * Math.PI * 34 * (1 - adherence / 100)}`}
              strokeLinecap="round"
              transform="rotate(-90 40 40)"
              style={{ transition: "stroke-dasharray 0.5s ease" }}
            />
            <text x="40" y="40" textAnchor="middle" dominantBaseline="central" fill="var(--text)" fontSize="20" fontWeight="600" fontFamily="var(--font-sans)">
              {Math.round(adherence)}%
            </text>
          </svg>
        </div>
        <div className="med-streak">
          <span className="med-streak-value">{streak}</span>
          <span className="med-streak-label">day streak</span>
        </div>
      </div>
      <style jsx>{`
        .med-root { }
        .med-header {
          padding: 0 0 12px;
        }
        .med-label { font-size: 13px; font-weight: 500; color: var(--text); }
        .med-body {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .med-ring-container {
          flex-shrink: 0;
        }
        .med-ring {
          display: block;
        }
        .med-streak {
          display: flex;
          flex-direction: column;
        }
        .med-streak-value {
          font-size: 28px;
          font-weight: 600;
          color: var(--text);
          letter-spacing: -0.02em;
          line-height: 1;
        }
        .med-streak-label {
          font-size: 11px;
          color: var(--text-tertiary);
          margin-top: 2px;
        }
      `}</style>
    </div>
  );
}
