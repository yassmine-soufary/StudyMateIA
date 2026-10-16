import React from 'react';

export default function LimitsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-icon">🛡️</span>
            <h2>Limites d'utilisation du Chatbot</h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Fermer la fenêtre modale"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-intro">
            StudyMate AI est un assistant pédagogique conçu spécifiquement pour accompagner
            les étudiants universitaires. Afin d'en faire un usage optimal et responsable,
            veuillez prendre connaissance des garde-fous suivants :
          </p>

          <ul className="limits-list">
            <li className="limit-item">
              <span className="limit-badge info">1</span>
              <div>
                <strong>Spécialisation stricte :</strong> L'assistant est exclusivement dédié à l'informatique,
                la programmation (Python, Web), l'algorithmique, les API (FastAPI) et l'Intelligence Artificielle.
              </div>
            </li>

            <li className="limit-item">
              <span className="limit-badge warning">2</span>
              <div>
                <strong>Risque d'erreurs :</strong> Comme tout modèle de langage, StudyMate AI peut occasionnellement
                produire des inexactitudes. Vérifiez toujours le code avant de l'exécuter en production.
              </div>
            </li>

            <li className="limit-item">
              <span className="limit-badge info">3</span>
              <div>
                <strong>Complément, pas remplacement :</strong> Cet outil est un tuteur d'appoint et ne remplace
                en aucun cas les cours, les travaux dirigés, ni les recommandations de vos enseignants.
              </div>
            </li>

            <li className="limit-item">
              <span className="limit-badge danger">4</span>
              <div>
                <strong>Aucun conseil médical, juridique ou financier :</strong> StudyMate AI ne donne aucun avis
                médical ni prescription. En cas de problème de santé ou d'urgence, contactez un professionnel qualifié.
              </div>
            </li>

            <li className="limit-item">
              <span className="limit-badge warning">5</span>
              <div>
                <strong>Refus du hors domaine :</strong> Les questions non liées à l'informatique (cuisine, sport,
                divertissement, etc.) sont poliment refusées et redirigées vers le domaine numérique.
              </div>
            </li>

            <li className="limit-item">
              <span className="limit-badge danger">6</span>
              <div>
                <strong>Protection des données privées :</strong> Ne transmettez jamais d'informations personnelles
                sensibles, mots de passe, clés d'API privées ou données confidentielles dans vos messages.
              </div>
            </li>
          </ul>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            J'ai compris
          </button>
        </div>
      </div>
    </div>
  );
}
