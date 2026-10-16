import React from 'react';
import StudyMateLogo from './StudyMateLogo';

export default function IntroScreen({ onStart }) {
  return (
    <main className="intro-screen">
      <div className="intro-halo intro-halo-one" aria-hidden="true" />
      <div className="intro-halo intro-halo-two" aria-hidden="true" />
      <div className="intro-content">
        <div className="intro-brand"><StudyMateLogo /></div>
        <div className="intro-badge">TON PARTENAIRE EN IA &amp; INFORMATIQUE</div>
        <h1>Apprends. Explore.<br /><span>Dépasse tes limites.</span></h1>
        <p>Comprends les concepts, débloque ton code et progresse à ton rythme avec Study Mate.</p>
        <button type="button" className="intro-cta" onClick={onStart}>Let's get started <span aria-hidden="true">↗</span></button>
      </div>
      <div className="intro-visual" aria-hidden="true">
        <div className="visual-ring visual-ring-one" />
        <div className="visual-ring visual-ring-two" />
        <div className="visual-sphere"><span className="sphere-shine" /><strong>AI</strong></div>
        <span className="visual-symbol symbol-code">&lt;/&gt;</span>
        <span className="visual-symbol symbol-braces">{`{ }`}</span>
        <span className="visual-symbol symbol-spark">✦</span>
      </div>
      <span className="intro-footnote">Study Mate · learning, one breakthrough at a time</span>
    </main>
  );
}