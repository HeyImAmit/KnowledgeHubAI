export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = ''
}) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2'
  };

  const variantStyles = {
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200/80',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/90',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200/90',
    error: 'bg-rose-50 text-rose-700 border border-rose-200/90',
    indigo: 'bg-indigo-50 text-indigo-700 border border-indigo-200/90',
    slate: 'bg-slate-800 text-slate-100 border border-slate-700'
  };

  const dotStyles = {
    neutral: 'bg-slate-400',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-rose-500',
    indigo: 'bg-indigo-500',
    slate: 'bg-slate-300'
  };

  return (
    <span className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.neutral} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[variant] || dotStyles.neutral}`} />}
      {children}
    </span>
  );
}
