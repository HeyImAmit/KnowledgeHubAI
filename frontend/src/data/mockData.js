export const initialDocuments = [
  {
    id: 'doc-1',
    name: 'Operating Systems.pdf',
    type: 'PDF',
    size: '14.2 MB',
    pages: 420,
    status: 'Indexed',
    uploadedAt: '2 hours ago',
    indexedAt: '1 hour ago',
    chunksCount: 1240,
    summary: 'Foundational concepts covering process scheduling, memory management, virtual memory paging, deadlock prevention, and distributed file systems.',
    author: 'Silberschatz, Galvin & Gagne',
    topics: ['Concurrency', 'Deadlocks', 'Virtual Memory', 'Kernel Architecture'],
    tokensCount: '342,000'
  },
  {
    id: 'doc-2',
    name: 'Database Management Systems.pdf',
    type: 'PDF',
    size: '9.8 MB',
    pages: 310,
    status: 'Indexed',
    uploadedAt: 'Yesterday',
    indexedAt: 'Yesterday',
    chunksCount: 980,
    summary: 'Relational data models, normalization (1NF through BCNF), indexing structures (B+ trees, Hash indexes), ACID transactions, and lock protocols.',
    author: 'Raghu Ramakrishnan',
    topics: ['Relational Schema', '3NF / BCNF', 'Indexing', 'Query Optimization', 'ACID'],
    tokensCount: '265,000'
  },
  {
    id: 'doc-3',
    name: 'Computer Networks.pdf',
    type: 'PDF',
    size: '8.1 MB',
    pages: 285,
    status: 'Indexed',
    uploadedAt: '3 days ago',
    indexedAt: '3 days ago',
    chunksCount: 820,
    summary: 'OSI 7-layer and TCP/IP protocol suites, congestion control (Reno, Cubic), routing protocols (BGP, OSPF), DNS, and TLS handshake security.',
    author: 'Kurose & Ross',
    topics: ['TCP / UDP', 'Congestion Control', 'Subnetting', 'Routing', 'TLS Handshake'],
    tokensCount: '210,000'
  },
  {
    id: 'doc-4',
    name: 'Distributed Systems Concepts.pdf',
    type: 'PDF',
    size: '6.4 MB',
    pages: 195,
    status: 'Indexed',
    uploadedAt: '4 days ago',
    indexedAt: '4 days ago',
    chunksCount: 540,
    summary: 'Consensus algorithms (Raft, Paxos), CAP theorem guarantees, vector clocks, leader election mechanisms, and distributed hash tables.',
    author: 'Coulouris et al.',
    topics: ['Raft Consensus', 'CAP Theorem', 'Vector Clocks', 'Distributed Storage'],
    tokensCount: '158,000'
  },
  {
    id: 'doc-5',
    name: 'System Design Primer.pdf',
    type: 'PDF',
    size: '5.2 MB',
    pages: 160,
    status: 'Processing',
    uploadedAt: '8 minutes ago',
    indexedAt: null,
    chunksCount: 0,
    summary: 'High-level architectural patterns for scalable distributed caching, load balancing, database sharding, asynchronous queues, and rate limiters.',
    author: 'Engineering Community',
    topics: ['Scalability', 'Caching', 'Sharding', 'Rate Limiting'],
    tokensCount: 'Pending'
  },
  {
    id: 'doc-6',
    name: 'Modern Database Internals.pdf',
    type: 'PDF',
    size: '7.5 MB',
    pages: 212,
    status: 'Failed',
    uploadedAt: '1 hour ago',
    indexedAt: null,
    chunksCount: 0,
    summary: 'Deep dive into storage engine design, LSM-Trees vs B-Trees, Write-Ahead Logs (WAL), and multi-version concurrency control (MVCC).',
    author: 'Alex Petrov',
    topics: ['Storage Engines', 'LSM-Trees', 'WAL', 'MVCC'],
    tokensCount: '0',
    errorMessage: 'PDF text extraction timed out during chunk embedding generation.'
  }
];

export const initialConversations = [
  {
    id: 'conv-1',
    title: 'Deadlock prevention and recovery techniques',
    lastMessage: 'Coffman conditions form the theoretical foundation for deadlock characterization...',
    updatedAt: '15m ago',
    referencedDocs: ['Operating Systems.pdf'],
    messages: [
      {
        id: 'm1-1',
        sender: 'user',
        timestamp: '10:24 AM',
        content: 'What are the primary conditions required for a deadlock to occur in an operating system, and how can we systematically prevent them?'
      },
      {
        id: 'm1-2',
        sender: 'assistant',
        timestamp: '10:24 AM',
        content: 'According to Coffman\'s formal characterization, a deadlock can only occur if the following four conditions hold simultaneously:\n\n1. **Mutual Exclusion**: At least one resource must be held in a non-shareable mode (only one process can use it at a time).\n2. **Hold and Wait**: A process currently holding at least one resource is actively waiting to acquire additional resources held by other processes.\n3. **No Preemption**: Resources cannot be preemptively taken from a process; they can only be released voluntarily upon task completion.\n4. **Circular Wait**: A closed chain of processes ${P_0, P_1, ..., P_n}$ exists such that $P_0$ is waiting for a resource held by $P_1$, $P_1$ is waiting for $P_2$, and $P_n$ is waiting for $P_0$.\n\n### Systematic Prevention Strategy\nTo prevent deadlocks, the operating system design must ensure that at least **one** of these conditions is rendered impossible at runtime:\n\n- **Eliminating Circular Wait**: Enforce a strict global linear ordering on all resource types. A process can only request resources in an increasing enumeration order.\n- **Eliminating Hold and Wait**: Require processes to request and be allocated all necessary resources upfront before starting execution.',
        citations: [
          {
            id: 'cit-1',
            documentName: 'Operating Systems.pdf',
            page: 17,
            snippet: 'Coffman conditions form the theoretical foundation for deadlock characterization. Invalidation of circular wait via global resource hierarchical ranking is the most practical prevention method in modern kernels.',
            score: '0.94'
          },
          {
            id: 'cit-2',
            documentName: 'Operating Systems.pdf',
            page: 24,
            snippet: 'Resource allocation graphs (RAG) provide cycle detection for single-unit resource scenarios. When cycles exist in single-instance resource systems, deadlock is guaranteed.',
            score: '0.89'
          }
        ]
      }
    ]
  },
  {
    id: 'conv-2',
    title: 'Database normalization: 3NF vs BCNF',
    lastMessage: 'BCNF eliminates anomalies caused by functional dependencies whose determinant...',
    updatedAt: '2h ago',
    referencedDocs: ['Database Management Systems.pdf'],
    messages: [
      {
        id: 'm2-1',
        sender: 'user',
        timestamp: '8:45 AM',
        content: 'Can you explain the key difference between Third Normal Form (3NF) and Boyce-Codd Normal Form (BCNF)?'
      },
      {
        id: 'm2-2',
        sender: 'assistant',
        timestamp: '8:46 AM',
        content: 'The fundamental distinction between 3NF and BCNF lies in how each form treats functional dependencies where the determinant is not a superkey:\n\n- **Third Normal Form (3NF)**: A relation schema $R$ is in 3NF if for every non-trivial functional dependency $X \\rightarrow Y$, at least one of the following conditions is satisfied:\n  1. $X$ is a superkey of $R$, or\n  2. $Y$ is a prime attribute (meaning $Y$ is part of some candidate key of $R$).\n\n- **Boyce-Codd Normal Form (BCNF)**: BCNF is strictly more rigorous and eliminates condition (2). A relation $R$ is in BCNF if and only if for every non-trivial functional dependency $X \\rightarrow Y$, **$X$ is a superkey** of $R$.\n\n### Practical Tradeoff\nWhile every BCNF relation is strictly in 3NF, decomposing a relation into BCNF may sometimes lose dependency preservation, whereas 3NF decomposition always guarantees both lossless join and dependency preservation.',
        citations: [
          {
            id: 'cit-3',
            documentName: 'Database Management Systems.pdf',
            page: 112,
            snippet: 'BCNF removes anomalies caused by functional dependencies whose determinant is not a candidate key, even if the dependent attribute is prime. 3NF allows prime attributes on the right-hand side.',
            score: '0.96'
          }
        ]
      }
    ]
  },
  {
    id: 'conv-3',
    title: 'TCP congestion control vs UDP semantics',
    lastMessage: 'TCP Reno and Cubic dynamically adjust cwnd and ssthresh upon packet loss...',
    updatedAt: 'Yesterday',
    referencedDocs: ['Computer Networks.pdf'],
    messages: [
      {
        id: 'm3-1',
        sender: 'user',
        timestamp: 'Yesterday 4:15 PM',
        content: 'Why does TCP utilize sliding window congestion control whereas UDP leaves flow management entirely to the application?'
      },
      {
        id: 'm3-2',
        sender: 'assistant',
        timestamp: 'Yesterday 4:16 PM',
        content: 'TCP and UDP represent two complementary philosophies in the transport layer:\n\n- **TCP (Transmission Control Protocol)**: Prioritizes network stability, fair bandwidth allocation, and guaranteed byte-stream delivery. It implements adaptive Congestion Window (`cwnd`) algorithms (Slow Start, Congestion Avoidance, Fast Retransmit, and Fast Recovery) to actively prevent intermediate router bufferbloat and collapse.\n\n- **UDP (User Datagram Protocol)**: Provides a lightweight, connectionless datagram framing with zero connection state and 8-byte header overhead (compared to 20-60 bytes in TCP). UDP delegates pacing and loss-handling to the application layer, making it ideal for real-time applications (VoIP, live video, multiplayer gaming) where immediate low latency is prioritized over complete retransmission.',
        citations: [
          {
            id: 'cit-4',
            documentName: 'Computer Networks.pdf',
            page: 78,
            snippet: 'TCP Reno and Cubic dynamically adjust cwnd and ssthresh upon triple-duplicate ACKs or RTO timeouts to avoid intermediate bufferbloat.',
            score: '0.92'
          },
          {
            id: 'cit-5',
            documentName: 'Computer Networks.pdf',
            page: 84,
            snippet: 'UDP datagram framing provides 8-byte headers compared to TCP\'s 20-60 bytes, prioritizing minimum protocol latency without transport-level retransmission queues.',
            score: '0.88'
          }
        ]
      }
    ]
  }
];

export const mockOverviewMetrics = {
  totalDocuments: 12,
  indexedDocuments: 10,
  processingDocuments: 1,
  failedDocuments: 1,
  totalIndexedPages: 842,
  totalKnowledgeChunks: '4,120',
  lastIndexedTime: '8 minutes ago',
  totalConversations: 8,
  systemStatus: 'Operational'
};
