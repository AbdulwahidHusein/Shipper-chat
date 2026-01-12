/**
 * Dropdown Menu Component
 * Clean, reusable dropdown for user menus
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { tokens } from '@/lib/design-tokens';
import Icon from './Icon';

interface DropdownItem {
  id: string;
  label: string;
  icon?: string;
  onClick: () => void;
  isDestructive?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
}

export default function Dropdown({ trigger, items, align = 'right' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <div onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
        {trigger}
      </div>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 998,
            }}
          />

          {/* Dropdown Menu */}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              [align]: 0,
              marginTop: tokens.spacing[2], // 8px
              width: '200px',
              backgroundColor: tokens.colors.surface.default,
              borderRadius: tokens.borderRadius.xl, // 16px
              boxShadow: tokens.shadows.menu,
              padding: '4px',
              zIndex: 999,
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
              border: `1px solid ${tokens.colors.border.primary}`,
            }}
          >
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  gap: tokens.spacing[2], // 8px
                  alignItems: 'center',
                  padding: '6px 8px',
                  borderRadius: tokens.borderRadius.base, // 8px
                  width: '100%',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.2s ease',
                  color: item.isDestructive
                    ? '#ef4444'
                    : tokens.colors.text.heading.primary,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = tokens.colors.surface.weak;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {item.icon && (
                  <Icon
                    name={item.icon as any}
                    size={16}
                    color={item.isDestructive ? '#ef4444' : tokens.colors.icon.secondary}
                  />
                )}
                <span
                  style={{
                    ...tokens.typography.styles.labelSmall,
                    color: item.isDestructive
                      ? '#ef4444'
                      : tokens.colors.text.heading.primary,
                    flex: 1,
                  }}
                >
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
