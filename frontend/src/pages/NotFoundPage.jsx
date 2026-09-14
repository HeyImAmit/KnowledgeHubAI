import { useNavigate } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
import Button from '../components/common/Button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-4xl font-mono font-bold text-slate-800 mb-2">404</h1>
      <h2 className="text-sm font-semibold text-slate-900 mb-1">Page not found</h2>
      <p className="text-xs text-slate-500 max-w-sm mb-6">
        The route you are looking for does not exist in the KnowledgeHub AI document index.
      </p>
      <Button
        variant="primary"
        size="sm"
        icon={LayoutDashboard}
        onClick={() => navigate('/dashboard')}
      >
        Return to Dashboard
      </Button>
    </div>
  );
}
