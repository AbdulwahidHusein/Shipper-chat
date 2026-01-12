'use client';

import { tokens } from '@/lib/design-tokens';

interface DateDividerProps {
  label: string;
}

export default function DateDivider({ label }: DateDividerProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          backgroundColor: tokens.colors.surface.default,
          padding: '4px 12px',
          borderRadius: tokens.borderRadius.pill, // 60px
        }}
      >
        <p
          style={{
            ...tokens.typography.styles.labelSmall,
            color: tokens.colors.text.neutral.sub,
          }}
        >
          {label}
        </p>
      </div>
    </div>
  );
}
