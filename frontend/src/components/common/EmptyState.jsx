import Button from './Button';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  className = ''
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 ${className}`}>
      {Icon && (
        <div className="w-11 h-11 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center text-slate-500 mb-3.5 shadow-xs">
          <Icon className="w-5 h-5 text-slate-600" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mb-5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button
          size="sm"
          variant="secondary"
          icon={actionIcon}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
