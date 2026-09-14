import { useState, useEffect } from 'react';
import { KnowledgeContext } from './KnowledgeContextInstance';
import { initialConversations, mockOverviewMetrics } from '../data/mockData';
import { documentApi } from '../services/api';
import { normalizeDocument } from '../utils/formatters';

export function KnowledgeProvider({ children }) {
  const [documents, setDocuments] = useState([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [docError, setDocError] = useState(null);

  const [conversations, setConversations] = useState(initialConversations);
  const [activeCitation, setActiveCitation] = useState(null);
  const [isSourceDrawerOpen, setIsSourceDrawerOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedDocForDetails, setSelectedDocForDetails] = useState(null);

  const fetchDocuments = async () => {
    setIsLoadingDocs(true);
    setDocError(null);
    try {
      const rawDocs = await documentApi.getDocuments();
      const normalized = (rawDocs || []).map(normalizeDocument);
      setDocuments(normalized);
    } catch (error) {
      console.error('Failed to fetch documents from PostgreSQL backend:', error);
      setDocError(error.response?.data?.message || error.message || 'Failed to connect to backend server');
    } finally {
      setIsLoadingDocs(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function loadInitial() {
      try {
        const rawDocs = await documentApi.getDocuments();
        if (isMounted) {
          setDocuments((rawDocs || []).map(normalizeDocument));
          setIsLoadingDocs(false);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Failed to fetch documents:', error);
          setDocError(error.response?.data?.message || error.message || 'Failed to connect to backend server');
          setIsLoadingDocs(false);
        }
      }
    }

    loadInitial();

    return () => {
      isMounted = false;
    };
  }, []);

  const uploadDocument = async (file, onUploadProgress) => {
    try {
      const createdRaw = await documentApi.uploadDocument(file, onUploadProgress);
      const normalized = normalizeDocument(createdRaw);
      setDocuments((prev) => [normalized, ...prev]);
      return normalized;
    } catch (error) {
      console.error('Failed to upload document to backend:', error);
      throw error;
    }
  };

  const addDocument = async (newDoc) => {
    try {
      const createdRaw = await documentApi.createDocument({
        filename: newDoc.name || 'Untitled Document.pdf',
        original_name: newDoc.name || 'Untitled Document.pdf',
        file_size: newDoc.file_size_raw || 4500000,
        page_count: newDoc.pages || 45,
        status: 'PROCESSING',
      });

      const normalized = normalizeDocument(createdRaw);
      setDocuments((prev) => [normalized, ...prev]);

      // Refresh after a moment to reflect pipeline updates
      setTimeout(() => {
        fetchDocuments();
      }, 3500);

      return normalized;
    } catch (error) {
      console.error('Failed to create document:', error);
      throw error;
    }
  };

  const deleteDocument = async (id) => {
    const previousDocs = documents;
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    if (selectedDocForDetails?.id === id) {
      setSelectedDocForDetails(null);
    }

    try {
      await documentApi.deleteDocument(id);
    } catch (error) {
      console.error('Failed to delete document from database:', error);
      setDocuments(previousDocs);
      alert(`Failed to delete document: ${error.response?.data?.message || error.message}`);
    }
  };

  const retryDocument = (id) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status: 'Processing',
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
                uploadedAt: 'Just now',
                chunksCount: Math.floor(d.pages * 3.4)
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
        referencedDocs: documents.length > 0 ? [documents[0].name] : ['Technical Specification.pdf'],
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
      const firstDocName = documents.length > 0 ? documents[0].name : 'Operating Systems.pdf';
      const simulatedAssistantMsg = {
        id: `msg-resp-${Date.now()}`,
        sender: 'assistant',
        timestamp: 'Just now',
        content: `Based on your PostgreSQL indexed technical documents, here is the synthesized answer regarding "${content}":\n\n1. **Document Record Verification**: Document metadata is indexed in PostgreSQL.\n2. **Retrieval Ready**: Ready for vector chunk retrieval and semantic search.\n\nCross-referenced with active document records.`,
        citations: [
          {
            id: `cit-${Date.now()}-1`,
            documentName: firstDocName,
            page: 17,
            snippet: 'Deterministic indexing and transaction verification ensure strict relational integrity across document metadata records.',
            score: '0.93'
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

  const totalIndexedPages = documents
    .filter((d) => d.status === 'Indexed')
    .reduce((acc, curr) => acc + (curr.pages || 0), 0);

  const totalKnowledgeChunks = documents
    .filter((d) => d.status === 'Indexed')
    .reduce((acc, curr) => acc + (curr.chunksCount || 0), 0);

  return (
    <KnowledgeContext.Provider
      value={{
        documents,
        isLoadingDocs,
        docError,
        refreshDocuments: fetchDocuments,
        conversations,
        overviewMetrics: {
          ...mockOverviewMetrics,
          totalDocuments: documents.length,
          indexedDocuments: documents.filter((d) => d.status === 'Indexed').length,
          processingDocuments: documents.filter((d) => d.status === 'Processing').length,
          failedDocuments: documents.filter((d) => d.status === 'Failed').length,
          totalIndexedPages: totalIndexedPages || 842,
          totalKnowledgeChunks: totalKnowledgeChunks ? totalKnowledgeChunks.toLocaleString() : '4,120',
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
        uploadDocument,
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
