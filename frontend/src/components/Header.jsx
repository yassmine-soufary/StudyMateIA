import React from 'react';
import StudyMateLogo from './StudyMateLogo';

export default function Header({ onNewChat, onOpenLimits, isConnected, onOpenSidebar, conversationTitle }) {
  return (
    <header className="app-header">
      <button className="icon-button menu-trigger" type="button" onClick={onOpenSidebar} aria-label="Ouvrir l'historique des conversations">☰</button>
      <div className="header-brand">
        <StudyMateLogo iconOnly variant="header" />
        <div className="header-titles">
          <div className="title-row">
            <h1 className="header-title">{conversationTitle || 'StudyMate AI'}</h1>
            {isConnected && <span className="status-pill online"><span className="status-dot" />En ligne</span>}
          </div>
          <p className="header-subtitle">
            Assistant pédagogique en informatique et intelligence artificielle
          </p>
        </div>
      </div>

      <div className="header-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onOpenLimits}
          title="Consulter les limites d'utilisation du chatbot"
          id="btn-limits"
        >
          <span className="btn-icon" aria-hidden="true">ⓘ</span>
          <span className="btn-text">Limites du chatbot</span>
        </button>

        <button
          type="button"
          className="btn btn-primary"
          onClick={onNewChat}
          title="Démarrer une nouvelle conversation"
          id="btn-new-chat"
        >
          <span className="btn-icon" aria-hidden="true">＋</span>
          <span className="btn-text">Nouvelle conversation</span>
        </button>
      </div>
    </header>
  );
}
