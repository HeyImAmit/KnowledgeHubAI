import { useContext } from 'react';
import { KnowledgeContext } from './KnowledgeContextInstance';

export function useKnowledge() {
  const context = useContext(KnowledgeContext);
  if (!context) {
    throw new Error('useKnowledge must be used within a KnowledgeProvider');
  }
  return context;
}
