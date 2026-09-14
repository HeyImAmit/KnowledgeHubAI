import { useParams } from 'react-router-dom';
import { useKnowledge } from '../context/useKnowledge';
import ConversationHistory from '../components/chat/ConversationHistory';
import ChatWindow from '../components/chat/ChatWindow';

export default function ChatPage() {
  const { conversationId } = useParams();
  const { conversations } = useKnowledge();

  const activeConversation = conversationId
    ? conversations.find((c) => c.id === conversationId)
    : null;

  return (
    <div className="h-[calc(100vh-3.5rem)] flex overflow-hidden">
      {/* Conversation history pane */}
      <ConversationHistory activeConversationId={conversationId} />

      {/* Main chat window */}
      <ChatWindow
        conversation={activeConversation}
        conversationId={conversationId}
      />
    </div>
  );
}
