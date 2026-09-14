export default function LoadingState({
  rows = 4,
  message = 'Loading indexed records...',
  className = ''
}) {
  return (
    <div className={`w-full p-6 space-y-4 animate-pulse ${className}`}>
      {message && (
        <div className="h-4 bg-slate-200/70 rounded w-1/4 mb-6" />
      )}
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-slate-200/70 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-slate-200/80 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
          </div>
          <div className="w-20 h-6 bg-slate-200/60 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  );
}
