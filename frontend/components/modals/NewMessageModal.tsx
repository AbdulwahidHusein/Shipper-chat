/**
 * New Message Modal
 * Matches Figma design - Modal with search and user list
 */

'use client';

import { useState, useMemo } from 'react';
import { tokens } from '@/lib/design-tokens';
import { mockUsers, currentUser } from '@/data/mockData';
import type { User } from '@/types';
import Input from '@/components/ui/Input';
import Avatar from '@/components/ui/Avatar';
import Icon from '@/components/ui/Icon';

interface NewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: User) => void;
}

export default function NewMessageModal({
  isOpen,
  onClose,
  onSelectUser,
}: NewMessageModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter out current user and filter by search query
  const availableUsers = useMemo(() => {
    return mockUsers
      .filter((user) => user.id !== currentUser.id)
      .filter((user) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
        );
      });
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleUserClick = (user: User) => {
    onSelectUser(user);
    onClose();
    setSearchQuery('');
  };

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
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
        }}
      />

      {/* Modal - Positioned near the New Message button (left side, below header) */}
      <div
        style={{
          position: 'fixed',
          top: '144px', // Positioned below the top bar and message list header
          left: '118px', // Positioned from left (near the New Message button area in message list)
          width: '273px',
          height: '440px',
          backgroundColor: tokens.colors.surface.default,
          borderRadius: tokens.borderRadius.xl, // 16px
          boxShadow: tokens.shadows.menu,
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: tokens.spacing[3], // 12px
          }}
        >
          <h3
            style={{
              ...tokens.typography.styles.subheadlineSemibold,
              color: tokens.colors.text.neutral.main,
              fontSize: '24px',
              lineHeight: '24px',
            }}
          >
            New Message
          </h3>
        </div>

        {/* Search Input */}
        <div
          style={{
            padding: `0 ${tokens.spacing[3]} ${tokens.spacing[3]} ${tokens.spacing[3]}`, // 0 12px 12px 12px
          }}
        >
          <Input
            type="search"
            placeholder="Search name or email"
            icon="search"
            size="sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        {/* User List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: `0 ${tokens.spacing[3]} ${tokens.spacing[3]} ${tokens.spacing[3]}`, // 0 12px 12px 12px
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
            }}
          >
            {availableUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => handleUserClick(user)}
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
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = tokens.colors.surface.weak;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Avatar
                  src={user.picture}
                  name={user.name}
                  size="md"
                />
                <p
                  style={{
                    ...tokens.typography.styles.paragraphXSmall,
                    color: tokens.colors.text.heading.primary,
                    fontWeight: tokens.typography.fontWeight.regular,
                    fontSize: '16px',
                    lineHeight: '16px',
                  }}
                >
                  {user.name}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
