/**
 * Loading Spinner Component
 * Clean, professional loading indicator
 */

'use client';

import { tokens } from '@/lib/design-tokens';
import { useEffect, useState } from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export default function LoadingSpinner({ size = 'md', message }: LoadingSpinnerProps) {
  const [rotation, setRotation] = useState(0);

  const sizeMap = {
    sm: '24px',
    md: '40px',
    lg: '64px',
  };

  const spinnerSize = sizeMap[size];

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 6) % 360);
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: tokens.spacing[4],
      }}
    >
      <div
        style={{
          width: spinnerSize,
          height: spinnerSize,
          border: `3px solid ${tokens.colors.border.primary}`,
          borderTop: `3px solid ${tokens.colors.brand[500]}`,
          borderRadius: '50%',
          transform: `rotate(${rotation}deg)`,
          transition: 'transform 0.1s linear',
        }}
      />
      {message && (
        <p
          style={{
            ...tokens.typography.styles.paragraphSmall,
            color: tokens.colors.text.placeholder,
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}
