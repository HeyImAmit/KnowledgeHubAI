import { Upload } from 'lucide-react';
import Button from '../common/Button';
import { useKnowledge } from '../../context/useKnowledge';

export default function UploadButton({ 
  variant = 'primary', 
  size = 'md', 
  label = 'Upload Document',
  className = ''
}) {
  const { setIsUploadModalOpen } = useKnowledge();

  return (
    <Button
      variant={variant}
      size={size}
      icon={Upload}
      onClick={() => setIsUploadModalOpen(true)}
      className={className}
    >
      {label}
    </Button>
  );
}
