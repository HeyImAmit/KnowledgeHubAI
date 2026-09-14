import { useState } from 'react';
import { KnowledgeContext } from './KnowledgeContextInstance';
import { initialDocuments, initialConversations, mockOverviewMetrics } from '../data/mockData';

export function KnowledgeProvider({ children }) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [conversations, setConversations] = useState(initialConversations);
  const [activeCitation, setActiveCitation] = useState(null);
  const [isSourceDrawerOpen, setIsSourceDrawerOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedDocForDetails, setSelectedDocForDetails] = useState(null);

  const addDocument = (newDoc) => {
    const docItem = {
      id: `doc-${Date.now()}`,
      name: newDoc.name || 'Untitled Document.pdf',
      type: 'PDF',
      size: newDoc.size || '4.5 MB',
      pages: newDoc.pages || Math.floor(Math.random() * 80) + 20,
      status: 'Processing',
      uploadedAt: 'Just now',
      indexedAt: null,
      chunksCount: 0,
      summary: newDoc.summary || 'Processing document structure and extracting key semantic sections...',
      author: newDoc.author || 'User Upload',
      topics: newDoc.topics || ['General Knowledge'],
      tokensCount: 'Pending'
    };

    setDocuments((prev) => [docItem, ...prev]);

    setTimeout(() => {
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === docItem.id
            ? {
                ...d,
                status: 'Indexed',
                indexedAt: 'Just now',
                chunksCount: Math.floor(d.pages * 3.2),
                tokensCount: `${Math.floor(d.pages * 850).toLocaleString()}`
              }
            : d
        )
      );
    }, 4000);
  };

  const deleteDocument = (id) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    if (selectedDocForDetails?.id === id) {
      setSelectedDocForDetails(null);
    }
  };

  const retryDocument = (id) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status: 'Processing',
              errorMessage: undefined,
              uploadedAt: 'Just now'
            }
          : d
      )
    );

    setTimeout(() => {
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === id
            ? {
                ...d,
                status: 'Indexed',
                indexedAt: 'Just now',
                chunksCount: Math.floor(d.pages * 3.4),
                tokensCount: `${Math.floor(d.pages * 890).toLocaleString()}`
              }
            : d
        )
      );
    }, 3000);
  };

  const sendMessage = (conversationId, content) => {
    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      timestamp: 'Just now',
      content
    };

    let targetConvId = conversationId;

    if (!targetConvId) {
      const newConv = {
        id: `conv-${Date.now()}`,
        title: content.slice(0, 48) + (content.length > 48 ? '...' : ''),
        lastMessage: content,
        updatedAt: 'Just now',
        referencedDocs: ['Operating Systems.pdf', 'Database Management Systems.pdf'],
        messages: [userMsg]
      };
      setConversations((prev) => [newConv, ...prev]);
      targetConvId = newConv.id;
    } else {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === targetConvId
            ? {
                ...c,
                lastMessage: content,
                updatedAt: 'Just now',
                messages: [...c.messages, userMsg]
              }
            : c
        )
      );
    }

    setTimeout(() => {
      const simulatedAssistantMsg = {
        id: `msg-resp-${Date.now()}`,
        sender: 'assistant',
        timestamp: 'Just now',
        content: `Based on your indexed technical documents, here is the synthesized answer regarding "${content}":\n\n1. **Core Concept**: The documented architecture leverages hierarchical indexing and deterministic state transitions.\n2. **Validation**: All components adhere to verified constraints without compromising bounded consistency or runtime throughput.\n\nAdditional implementation details and algorithmic pseudocode are cross-referenced directly in the indexed corpus.`,
        citations: [
          {
            id: `cit-${Date.now()}-1`,
            documentName: 'Operating Systems.pdf',
            page: 42,
            snippet: 'Hierarchical state transitions guarantee deterministic concurrency boundaries when multiple sub-processes execute under resource constraints.',
            score: '0.91'
          }
        ]
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === targetConvId
            ? {
                ...c,
                lastMessage: simulatedAssistantMsg.content.slice(0, 80) + '...',
                messages: [...c.messages, simulatedAssistantMsg]
              }
            : c
        )
      );
    }, 900);

    return targetConvId;
  };

  const openCitationInspector = (citation) => {
    setActiveCitation(citation);
    setIsSourceDrawerOpen(true);
  };

  const closeCitationInspector = () => {
    setIsSourceDrawerOpen(false);
  };

  return (
    <KnowledgeContext.Provider
      value={{
        documents,
        conversations,
        overviewMetrics: {
          ...mockOverviewMetrics,
          totalDocuments: documents.length,
          indexedDocuments: documents.filter((d) => d.status === 'Indexed').length,
          processingDocuments: documents.filter((d) => d.status === 'Processing').length,
          failedDocuments: documents.filter((d) => d.status === 'Failed').length,
          totalConversations: conversations.length
        },
        activeCitation,
        isSourceDrawerOpen,
        isUploadModalOpen,
        selectedDocForDetails,
        setIsUploadModalOpen,
        setSelectedDocForDetails,
        openCitationInspector,
        closeCitationInspector,
        addDocument,
        deleteDocument,
        retryDocument,
        sendMessage
      }}
    >
      {children}
    </KnowledgeContext.Provider>
  );
}
