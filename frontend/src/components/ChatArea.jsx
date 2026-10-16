import React, { useEffect, useRef } from 'react';
import MessageItem from './MessageItem';

export default function ChatArea({ messages, profileName, isLoading, error, onQuickQuestion, onRetry }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    const container = document.getElementById('chat-messages-container');
    if (container && container.scrollHeight - container.scrollTop - container.clientHeight < 180) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, error]);

  const quickStarters = [
    ['⌘', 'Comprendre un concept', 'Explique-moi un concept informatique simplement.'],
    ['↗', 'Résoudre un exercice', 'Aide-moi à résoudre cet exercice étape par étape.'],
    ['{ }', 'Expliquer du code', 'Explique ce code et indique les bonnes pratiques :'],
    ['◌', 'Réviser avec un quiz', 'Pose-moi un quiz progressif sur l’informatique.'],
  ];
  const isWelcome = messages.length <= 1 && messages[0]?.role === 'assistant';

  return (
    <div className="chat-area" id="chat-messages-container">
      {isWelcome && (
        <section className="welcome-panel">
          <div className="welcome-orbit" aria-hidden="true"><span /></div>
          <span className="eyebrow">TON ESPACE D'ÉTUDE</span>
          <h2>Bonjour{profileName ? ` ${profileName}` : ''} <span>👋</span></h2>
          <p>Que souhaites-tu apprendre aujourd’hui ?</p>
          <div className="quick-grid">
            {quickStarters.map(([icon, title, prompt]) => (
              <button key={title} type="button" className="quick-card" onClick={() => onQuickQuestion(prompt)}>
                <span className="quick-card-icon" aria-hidden="true">{icon}</span>
                <span><strong>{title}</strong><small>Commencer une session</small></span>
                <span className="quick-arrow" aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Messages list */}
      <div className="messages-list">
        {messages.filter((msg, index) => !isWelcome || index > 0).map((msg, index) => (
          <MessageItem key={`${msg.timestamp}-${index}`} message={msg} />
        ))}

        {/* Loading state indicator */}
        {isLoading && (
          <div className="message-row assistant-row loading-row">
            <div className="message-avatar">
              <span className="avatar-icon ai-avatar pulse">🤖</span>
            </div>
            <div className="message-bubble loading-bubble">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className="loading-text">StudyMate prépare une explication…</span>
            </div>
          </div>
        )}

        {/* Frontend error message display */}
        {error && (
          <div className="error-banner" role="alert">
            <span className="error-icon" aria-hidden="true">!</span>
            <div className="error-text">
              <strong>La réponse n’a pas pu être chargée.</strong><span>{error}</span>
            </div>
            <button type="button" className="retry-button" onClick={onRetry}>Réessayer</button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
