import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Badge from '../common/Badge';

export default function DocumentStatus({ status, size = 'sm', showIcon = true }) {
  switch (status) {
    case 'Indexed':
      return (
        <Badge variant="success" size={size} dot={!showIcon} className="font-medium">
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
          <span>Indexed</span>
        </Badge>
      );
    case 'Processing':
      return (
        <Badge variant="warning" size={size} dot={!showIcon} className="font-medium">
          {showIcon && <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin shrink-0" />}
          <span>Processing</span>
        </Badge>
      );
    case 'Failed':
      return (
        <Badge variant="error" size={size} dot={!showIcon} className="font-medium">
          {showIcon && <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
          <span>Failed</span>
        </Badge>
      );
    default:
      return (
        <Badge variant="neutral" size={size}>
          <span>{status}</span>
        </Badge>
      );
  }
}
