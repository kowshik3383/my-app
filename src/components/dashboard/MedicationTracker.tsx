"use client";

interface MedicationTrackerProps {
  adherence: number;
  streak?: number;
}

export default function MedicationTracker({ adherence, streak }: MedicationTrackerProps) {
  const color = adherence >= 80 ? "bg-green-500" : adherence >= 50 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Medication Adherence</h3>
      <div className="flex items-center gap-4">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" fill="none" stroke="#e5e7eb" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="16" fill="none"
              stroke={adherence >= 80 ? "#22c55e" : adherence >= 50 ? "#eab308" : "#ef4444"}
              strokeWidth="3"
              strokeDasharray={`${adherence} ${100 - adherence}`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-900 dark:text-white">
            {Math.round(adherence)}%
          </span>
        </div>
        <div className="flex-1">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div className={`${color} h-3 rounded-full transition-all duration-500`} style={{ width: `${adherence}%` }} />
          </div>
          {streak !== undefined && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {streak > 0 ? `🔥 ${streak} day streak` : "Start your streak today!"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
