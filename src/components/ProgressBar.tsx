interface ProgressBarProps {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const displayProgress = Math.min(Math.round(progress), 100);

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-gray-700">Processing URL...</span>
        <span className="text-blue-600">{displayProgress}%</span>
      </div>
      <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out"
          style={{ width: `${displayProgress}%` }}
        >
          <div className="h-full w-full animate-pulse bg-white/20"></div>
        </div>
      </div>
    </div>
  );
}
