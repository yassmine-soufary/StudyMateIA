import React, { useEffect, useMemo, useState } from 'react';
import StudyMateLogo from './StudyMateLogo';

function periodLabel(timestamp) {
  const date = new Date(timestamp);
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const difference = startToday - new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const days = Math.floor(difference / 86400000);
  if (days <= 0) return "Aujourd'hui";
  if (days === 1) return 'Hier';
  if (days <= 7) return '7 derniers jours';
  return 'Plus ancien';
}

export default function Sidebar({
  conversations,
  activeId,
  isOpen,
  isCollapsed,
  profileName,
  onClose,
  onToggleCollapse,
  onShowIntro,
  onNewChat,
  onSelectConversation,
  onRenameConversation,
  onDeleteConversation,
}) {
  const [search, setSearch] = useState('');
  const [menuId, setMenuId] = useState(null);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  const groups = useMemo(() => {
    const query = search.trim().toLowerCase();
    const grouped = {};
    conversations
      .filter((conversation) => !query || conversation.title.toLowerCase().includes(query))
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .forEach((conversation) => {
        const label = periodLabel(conversation.updatedAt);
        if (!grouped[label]) grouped[label] = [];
        grouped[label].push(conversation);
      });
    return grouped;
  }, [conversations, search]);

  const handleMenuAction = (action, id) => {
    setMenuId(null);
    action(id);
  };

  return (
    <>
      {isOpen && <button className="sidebar-scrim" type="button" aria-label="Fermer le menu" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''} ${isCollapsed ? 'sidebar-collapsed' : ''}`} aria-label="Historique des conversations">
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <div className="sidebar-brand-copy"><StudyMateLogo variant="sidebar" /><span className="sidebar-brand-caption">AI learning studio</span></div>
            <button className="sidebar-collapse" type="button" onClick={onToggleCollapse} aria-label="Replier la barre latérale">‹</button>
          </div>
          <button className="new-chat-button" type="button" onClick={onNewChat}><span aria-hidden="true">＋</span> Nouvelle conversation</button>
          <label className="search-field">
            <span aria-hidden="true">⌕</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher une conversation" />
            <span className="sr-only">Rechercher une conversation</span>
          </label>
        </div>

        <div className="conversation-list">
          {Object.keys(groups).length === 0 && <p className="empty-history">Tes conversations apparaîtront ici</p>}
          {Object.entries(groups).map(([label, items]) => (
            <section className="conversation-group" key={label}>
              <h2>{label}</h2>
              {items.map((conversation) => (
                <div className="conversation-entry" key={conversation.id}>
                  <button type="button" className={`conversation-item ${conversation.id === activeId ? 'conversation-active' : ''}`} onClick={() => onSelectConversation(conversation.id)}>
                    <span className="conversation-title">{conversation.title}</span>
                    <span className="conversation-time">{new Date(conversation.updatedAt).toLocaleDateString([], { day: '2-digit', month: '2-digit' })}</span>
                  </button>
                  <button type="button" className="conversation-menu" aria-label={`Options pour ${conversation.title}`} onClick={() => setMenuId(menuId === conversation.id ? null : conversation.id)}>•••</button>
                  {menuId === conversation.id && <div className="conversation-actions"><button type="button" onClick={() => handleMenuAction(onRenameConversation, conversation.id)}>Renommer</button><button type="button" onClick={() => handleMenuAction(onDeleteConversation, conversation.id)}>Supprimer</button></div>}
                </div>
              ))}
            </section>
          ))}
        </div>

        <div className="profile-card">
          <span className="profile-avatar" aria-hidden="true">{profileName ? profileName.charAt(0).toUpperCase() : 'É'}</span>
          <div><strong>{profileName || 'Étudiant'}</strong><span>Profil local</span></div>
          <span className="profile-status" aria-label="Profil actif" />
        </div>
        <button type="button" className="revisit-intro" onClick={onShowIntro}>Revoir l’introduction</button>
      </aside>
    </>
  );
}