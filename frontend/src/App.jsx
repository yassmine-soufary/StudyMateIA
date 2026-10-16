import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ChatArea from './components/ChatArea';
import MessageInput from './components/MessageInput';
import LimitsModal from './components/LimitsModal';
import Sidebar from './components/Sidebar';
import IntroScreen from './components/IntroScreen';
import { sendChatMessage, resetConversation, checkBackendHealth } from './services/api';

const STORAGE_KEY = 'studymate-conversations-v2';
const PROFILE_KEY = 'studymate-profile';
const INTRO_KEY = 'studymate-intro-seen';
const SIDEBAR_KEY = 'studymate-sidebar-collapsed';
const INITIAL_WELCOME_MESSAGE = {
  role: 'assistant',
  content:
    "Bonjour ! Je suis StudyMate AI, un assistant pédagogique spécialisé en informatique et intelligence artificielle. Tu peux me poser des questions sur Python, algorithmique, IA, machine learning, API, FastAPI, React et d’autres notions informatiques. Par quoi veux-tu commencer ?",
};

function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'conv-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now().toString(36);
}

function now() {
  return new Date().toISOString();
}

function createConversation() {
  const createdAt = now();
  return {
    id: generateUUID(),
    title: 'Nouvelle conversation',
    messages: [{ ...INITIAL_WELCOME_MESSAGE, timestamp: createdAt }],
    createdAt,
    updatedAt: createdAt,
  };
}

function loadConversations() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(stored)) return [createConversation()];
    const valid = stored.filter(
      (conversation) =>
        conversation &&
        typeof conversation.id === 'string' &&
        Array.isArray(conversation.messages),
    );
    return valid.length ? valid : [createConversation()];
  } catch {
    return [createConversation()];
  }
}

function getProfileName() {
  try {
    const profile = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null');
    return typeof profile?.firstName === 'string' && profile.firstName.trim()
      ? profile.firstName.trim()
      : '';
  } catch {
    return '';
  }
}

export default function App() {
  const [hasSeenIntro, setHasSeenIntro] = useState(() => localStorage.getItem(INTRO_KEY) === 'true');
  const [conversations, setConversations] = useState(loadConversations);
  const [activeId, setActiveId] = useState(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingConversationId, setPendingConversationId] = useState(null);
  const [errors, setErrors] = useState({});
  const [failedMessages, setFailedMessages] = useState({});
  const [isLimitsOpen, setIsLimitsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => localStorage.getItem(SIDEBAR_KEY) === 'true');
  const [profileName] = useState(getProfileName);

  const currentActiveId = activeId || conversations[0]?.id;
  const activeConversation = conversations.find((conversation) => conversation.id === currentActiveId) || conversations[0];
  const messages = activeConversation?.messages || [];

  // Periodic health check
  const verifyBackend = useCallback(async () => {
    const ok = await checkBackendHealth();
    setIsConnected(ok);
  }, []);

  useEffect(() => {
    verifyBackend();
    const interval = setInterval(verifyBackend, 15000);
    return () => clearInterval(interval);
  }, [verifyBackend]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  const updateConversation = useCallback((id, updater) => {
    setConversations((previous) =>
      previous.map((conversation) => (conversation.id === id ? updater(conversation) : conversation)),
    );
  }, []);

  // Handle creating a new conversation
  const handleNewChat = () => {
    const conversation = createConversation();
    setConversations((previous) => [conversation, ...previous]);
    setActiveId(conversation.id);
    setInput('');
    setIsSidebarOpen(false);
  };

  // Handle sending message
  const handleSendMessage = async (textToSend, targetId = currentActiveId, shouldAppendUser = true) => {
    const content = (textToSend || input).trim();
    if (!content || (isLoading && pendingConversationId === targetId)) return;

    if (shouldAppendUser) {
      const userMsg = { role: 'user', content, timestamp: now() };
      updateConversation(targetId, (conversation) => ({
        ...conversation,
        title:
          conversation.title === 'Nouvelle conversation'
            ? content.slice(0, 58) + (content.length > 58 ? '…' : '')
            : conversation.title,
        messages: [...conversation.messages, userMsg],
        updatedAt: now(),
      }));
    }

    if (targetId === currentActiveId) setInput('');
    setIsLoading(true);
    setPendingConversationId(targetId);
    setErrors((previous) => ({ ...previous, [targetId]: null }));

    try {
      const data = await sendChatMessage(targetId, content);
      const assistantMsg = {
        role: 'assistant',
        content: data.response,
        timestamp: now(),
      };

      updateConversation(targetId, (conversation) => ({
        ...conversation,
        messages: [...conversation.messages, assistantMsg],
        updatedAt: now(),
      }));
      setFailedMessages((previous) => ({ ...previous, [targetId]: null }));
      setIsConnected(true);
    } catch (err) {
      console.error('Error during chat interaction:', err);
      setErrors((previous) => ({
        ...previous,
        [targetId]: err.message || 'Une erreur est survenue lors de la communication.',
      }));
      setFailedMessages((previous) => ({ ...previous, [targetId]: content }));
      // Also update connection state if it was a network failure
      if (err.message && err.message.includes('contacter le serveur')) {
        setIsConnected(false);
      }
    } finally {
      setIsLoading(false);
      setPendingConversationId(null);
    }
  };

  const handleQuickQuestion = (question) => {
    handleSendMessage(question, currentActiveId);
  };

  const handleRetry = () => {
    const failed = failedMessages[currentActiveId];
    if (failed) handleSendMessage(failed, currentActiveId, false);
  };

  const handleSelectConversation = (id) => {
    setActiveId(id);
    setErrors((previous) => ({ ...previous, [id]: null }));
    setIsSidebarOpen(false);
  };

  const handleRenameConversation = (id) => {
    const conversation = conversations.find((item) => item.id === id);
    const title = window.prompt('Nouveau titre de la conversation', conversation?.title || '');
    if (title?.trim()) {
      updateConversation(id, (current) => ({ ...current, title: title.trim(), updatedAt: now() }));
    }
  };

  const handleDeleteConversation = async (id) => {
    const conversation = conversations.find((item) => item.id === id);
    if (!conversation || !window.confirm(`Supprimer « ${conversation.title} » ?`)) return;
    await resetConversation(id);
    const remaining = conversations.filter((item) => item.id !== id);
    const replacement = remaining.length ? remaining : [createConversation()];
    setConversations(replacement);
    if (id === currentActiveId) setActiveId(replacement[0].id);
  };

  const handleStartApp = () => {
    localStorage.setItem(INTRO_KEY, 'true');
    setHasSeenIntro(true);
  };

  const handleShowIntro = () => {
    setIsSidebarOpen(false);
    setHasSeenIntro(false);
  };

  if (!hasSeenIntro) {
    return <IntroScreen onStart={handleStartApp} />;
  }

  return (
    <div className="app-container">
      <Sidebar
        conversations={conversations}
        activeId={currentActiveId}
        isOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        profileName={profileName}
        onClose={() => setIsSidebarOpen(false)}
        onToggleCollapse={() => setIsSidebarCollapsed((collapsed) => !collapsed)}
        onShowIntro={handleShowIntro}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        onRenameConversation={handleRenameConversation}
        onDeleteConversation={handleDeleteConversation}
      />

      <div className={`app-shell ${isSidebarCollapsed ? 'app-shell-sidebar-collapsed' : ''}`}>
      <Header
        onNewChat={handleNewChat}
        onOpenLimits={() => setIsLimitsOpen(true)}
        isConnected={isConnected}
        conversationTitle={activeConversation?.title}
        onOpenSidebar={() => {
          if (window.innerWidth <= 760) {
            setIsSidebarCollapsed(false);
            setIsSidebarOpen(true);
          }
          else setIsSidebarCollapsed(false);
        }}
      />

      <main className="main-content">
        <ChatArea
          messages={messages}
          profileName={profileName}
          isLoading={isLoading && pendingConversationId === currentActiveId}
          error={errors[currentActiveId]}
          onQuickQuestion={handleQuickQuestion}
          onRetry={handleRetry}
        />

        <MessageInput
          input={input}
          setInput={setInput}
          onSendMessage={() => handleSendMessage()}
          isLoading={isLoading}
        />
      </main>
      </div>

      <LimitsModal
        isOpen={isLimitsOpen}
        onClose={() => setIsLimitsOpen(false)}
      />
    </div>
  );
}
