import React, { useRef, useEffect } from 'react';

export default function MessageInput({
  input,
  setInput,
  onSendMessage,
  isLoading,
}) {
  const textareaRef = useRef(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleKeyDown = (e) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim()) {
        onSendMessage();
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isLoading && input.trim()) {
      onSendMessage();
    }
  };

  return (
    <footer className="input-container">
      <form onSubmit={handleSubmit} className="input-form">
        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            id="chat-user-input"
            className="chat-textarea"
            placeholder="Une question, un exercice, du code ? Écris ici…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={1}
            aria-label="Message à envoyer à StudyMate AI"
          />

          <button
            type="submit"
            id="btn-send-message"
            className="btn btn-send"
            disabled={isLoading || !input.trim()}
            aria-label="Envoyer"
            title={isLoading ? 'StudyMate réfléchit…' : 'Envoyer le message (Entrée)'}
          >
            <span className="send-icon" aria-hidden="true">↑</span>
          </button>
        </div>

        <div className="input-footer-hint">
          <span><strong>Entrée</strong> pour envoyer · <strong>Maj + Entrée</strong> pour une nouvelle ligne</span>
          <span className="char-count">{input.length}/4000</span>
        </div>
      </form>
    </footer>
  );
}
