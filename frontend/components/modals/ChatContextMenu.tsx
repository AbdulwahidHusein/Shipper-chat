/**
 * Chat Context Menu
 * Right-click menu for chat items
 * Matches Figma design exactly
 */

'use client';

import { useEffect, useRef } from 'react';
import { tokens } from '@/lib/design-tokens';
import Icon from '@/components/ui/Icon';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  hasArrow?: boolean;
  isDestructive?: boolean;
  onClick: () => void;
}

interface ChatContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onMarkUnread: () => void;
  onArchive: () => void;
  onMute: () => void;
  onContactInfo: () => void;
  onExportChat: () => void;
  onClearChat: () => void;
  onDeleteChat: () => void;
}

export default function ChatContextMenu({
  isOpen,
  position,
  onClose,
  onMarkUnread,
  onArchive,
  onMute,
  onContactInfo,
  onExportChat,
  onClearChat,
  onDeleteChat,
}: ChatContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const menuItems: MenuItem[] = [
    {
      id: 'mark-unread',
      label: 'Mark as unread',
      icon: 'message-circle-2',
      onClick: onMarkUnread,
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: 'archive',
      onClick: onArchive,
    },
    {
      id: 'mute',
      label: 'Mute',
      icon: 'volume-3',
      hasArrow: true,
      onClick: onMute,
    },
    {
      id: 'contact-info',
      label: 'Contact info',
      icon: 'user-circle',
      onClick: onContactInfo,
    },
    {
      id: 'export-chat',
      label: 'Export chat',
      icon: 'upload',
      onClick: onExportChat,
    },
    {
      id: 'clear-chat',
      label: 'Clear chat',
      icon: 'x',
      onClick: onClearChat,
    },
    {
      id: 'delete-chat',
      label: 'Delete chat',
      icon: 'trash',
      isDestructive: true,
      onClick: onDeleteChat,
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
        }}
      />

      {/* Context Menu */}
      <div
        ref={menuRef}
        style={{
          position: 'fixed',
          top: `${position.y}px`,
          left: `${position.x}px`,
          width: '200px',
          backgroundColor: tokens.colors.surface.default,
          borderRadius: tokens.borderRadius.xl, // 16px
          boxShadow: tokens.shadows.menu,
          padding: '4px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          border: `1px solid ${tokens.colors.border.primary}`,
        }}
      >
        {menuItems.map((item, index) => (
          <button
            key={item.id}
            onClick={() => {
              item.onClick();
              onClose();
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
                ? '#ef4444' // Red for destructive actions
                : tokens.colors.text.heading.primary,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = tokens.colors.surface.weak;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Icon
              name={item.icon as any}
              size={16}
              color={
                item.isDestructive
                  ? '#ef4444'
                  : tokens.colors.icon.secondary
              }
            />
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
            {item.hasArrow && (
              <Icon
                name="chevron-right"
                size={16}
                color={tokens.colors.icon.secondary}
              />
            )}
          </button>
        ))}
      </div>
    </>
  );
}
