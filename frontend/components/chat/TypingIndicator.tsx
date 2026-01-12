'use client';

import { tokens } from '@/lib/design-tokens';

interface TypingIndicatorProps {
  typingUsers: string[];
}

export default function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  if (typingUsers.length === 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing[2],
        padding: tokens.spacing[2],
        paddingLeft: tokens.spacing[4],
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '4px',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: tokens.colors.brand[500],
            animation: 'typing 1.4s infinite',
          }}
        />
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: tokens.colors.brand[500],
            animation: 'typing 1.4s infinite 0.2s',
          }}
        />
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: tokens.colors.brand[500],
            animation: 'typing 1.4s infinite 0.4s',
          }}
        />
      </div>
      <p
        style={{
          ...tokens.typography.styles.paragraphXSmall,
          color: tokens.colors.text.placeholder,
          fontStyle: 'italic',
        }}
      >
        {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
      </p>
    </div>
  );
}
