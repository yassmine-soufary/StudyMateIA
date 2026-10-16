import React from 'react';

export default function StudyMateLogo({ iconOnly = false, variant = 'default', className = '' }) {
  const classes = `study-logo study-logo-${variant}${iconOnly ? ' study-logo-icon-only' : ''}${className ? ` ${className}` : ''}`;

  return (
    <div
      className={classes}
      role={iconOnly ? 'img' : undefined}
      aria-label={iconOnly ? 'Study Mate' : undefined}
    >
      <svg className="study-logo-mark" viewBox="0 0 44 44" aria-hidden="true" focusable="false">
        <path
          d="M22 3.5c10.2 0 18.5 6.5 18.5 15.1 0 5.1-3.1 9.6-7.9 12.3l1.8 6.1-7.4-3.8c-1.6.3-3.3.5-5 .5-10.2 0-18.5-6.5-18.5-15.1S11.8 3.5 22 3.5Z"
          fill="#2563EB"
          stroke="#22D3EE"
          strokeWidth="1.5"
        />
        <path
          d="M11.2 16.3c3.4-.5 7.2.2 10.8 2.2v11.2c-3.6-2-7.4-2.7-10.8-2.2V16.3Z"
          fill="#F5F9FF"
        />
        <path
          d="M32.8 16.3c-3.4-.5-7.2.2-10.8 2.2v11.2c3.6-2 7.4-2.7-10.8-2.2V16.3Z"
          fill="#DBEAFE"
        />
        <path d="M22 18.5v11.2M13.7 19.5c2.4-.1 5 .5 7.2 1.8M30.3 19.5c-2.4-.1-5 .5-7.2 1.8" fill="none" stroke="#071B41" strokeLinecap="round" strokeWidth="1.4" />
      </svg>
      {!iconOnly && <span className="study-logo-name">Study Mate</span>}
    </div>
  );
}
