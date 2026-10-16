
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function FormattedContent({ text }) {
  if (!text) return null;

  return (
    <div className="message-content-formatted markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Blocs de code
          pre({ children }) {
            return <div className="markdown-pre">{children}</div>;
          },

          code({ className, children, ...props }) {
            const code = String(children).replace(/\n$/, '');
            const isBlock = Boolean(className) || code.includes('\n');
            const language = className?.replace('language-', '') || 'code';

            if (!isBlock) {
              return (
                <code className="inline-code" {...props}>
                  {children}
                </code>
              );
            }

            return (
              <div className="code-block-wrapper">
                <div className="code-header">
                  <span className="code-lang">{language}</span>
                  <button
                    type="button"
                    className="code-copy-btn"
                    onClick={() => navigator.clipboard.writeText(code)}
                    title="Copier le code"
                  >
                    Copier
                  </button>
                </div>
                <pre className="code-block">
                  <code>{code}</code>
                </pre>
              </div>
            );
          },

          // Tableaux
          table({ children }) {
            return (
              <div className="markdown-table-wrapper">
                <table>{children}</table>
              </div>
            );
          },

          // Liens
          a({ href, children }) {
            const safeHref =
              typeof href === 'string' &&
              /^https?:\/\//i.test(href)
                ? href
                : undefined;

            return (
              <a
                href={safeHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            );
          },
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

export default function MessageItem({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`message-row ${isUser ? 'user-row' : 'assistant-row'}`}>
      <div className="message-avatar">
        {isUser ? (
          <span
            className="avatar-icon user-avatar"
            title="Étudiant"
          >
            🧑‍🎓
          </span>
        ) : (
          <span
            className="avatar-icon ai-avatar"
            title="StudyMate AI"
          >
            🤖
          </span>
        )}
      </div>

      <div className="message-bubble">
        <div className="message-header-info">
          <span className="sender-name">
            {isUser ? 'Toi' : 'StudyMate AI'}
          </span>
          {message.timestamp && (
            <span className="message-time">
              {message.timestamp}
            </span>
          )}
        </div>

        <FormattedContent text={message.content} />
      </div>
    </div>
  );
}
