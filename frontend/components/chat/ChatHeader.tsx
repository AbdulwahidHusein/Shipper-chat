'use client';

import { tokens } from '@/lib/design-tokens';
import Avatar from '@/components/ui/Avatar';
import Icon from '@/components/ui/Icon';
import { useIsMobile } from '@/hooks/useMediaQuery';
import type { User } from '@/types';

interface ChatHeaderProps {
  participant?: User;
  sessionId?: string;
  isArchived?: boolean;
  onOpenContactInfo?: () => void;
  onOpenContextMenu?: (sessionId: string, position: { x: number; y: number }) => void;
  onBack?: () => void;
}

export default function ChatHeader({
  participant,
  sessionId,
  isArchived = false,
  onOpenContactInfo,
  onOpenContextMenu,
  onBack,
}: ChatHeaderProps) {
  const isMobile = useIsMobile();
  return (
    <div
      style={{
        display: 'flex',
        gap: tokens.spacing[3], // 12px
        alignItems: 'center',
        padding: `4px ${tokens.spacing[3]} ${tokens.spacing[4]} ${tokens.spacing[3]}`, // 4px 12px 16px 12px
        borderBottom: `1px solid ${tokens.colors.border.primary}`,
      }}
    >
      {/* Back button on mobile */}
      {isMobile && onBack && (
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            backgroundColor: tokens.colors.surface.default,
            border: `1px solid ${tokens.colors.border.primary}`,
            borderRadius: tokens.borderRadius.base,
            cursor: 'pointer',
            marginRight: tokens.spacing[2],
          }}
        >
          <Icon name="arrow-left" size={18} color={tokens.colors.icon.secondary} />
        </button>
      )}
      <button
        onClick={onOpenContactInfo}
        style={{
          border: 'none',
          background: 'none',
          padding: 0,
          cursor: 'pointer',
        }}
      >
        <Avatar
          src={participant?.picture}
          name={participant?.name}
          size="md"
        />
      </button>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          flex: 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
          }}
        >
          <p
            style={{
              ...tokens.typography.styles.labelSmall,
              color: isArchived
                ? tokens.colors.text.placeholder
                : tokens.colors.text.neutral.main,
            }}
          >
            {participant?.name}
          </p>
          {isArchived && (
            <span
              style={{
                ...tokens.typography.styles.paragraphXSmall,
                color: tokens.colors.text.placeholder,
                fontSize: '10px',
                textTransform: 'uppercase',
                padding: `2px ${tokens.spacing[2]}`,
                backgroundColor: tokens.colors.surface.weak,
                borderRadius: tokens.borderRadius.base,
              }}
            >
              Archived
            </span>
          )}
        </div>
        <p
          style={{
            ...tokens.typography.styles.paragraphXSmall,
            color: participant?.isOnline
              ? tokens.colors.text.state.success
              : tokens.colors.text.placeholder,
          }}
        >
          {participant?.isOnline ? 'Online' : 'Offline'}
        </p>
      </div>
      <div
        style={{
          display: 'flex',
          gap: tokens.spacing[3], // 12px
          alignItems: 'center',
        }}
      >
        {['search', 'phone', 'video'].map((iconName) => (
          <button
            key={iconName}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              backgroundColor: tokens.colors.surface.default,
              border: `1px solid ${tokens.colors.border.primary}`,
              borderRadius: tokens.borderRadius.base, // 8px
              cursor: 'pointer',
            }}
          >
            <Icon
              name={iconName as any}
              size={16}
              color={tokens.colors.icon.secondary}
            />
          </button>
        ))}
        <button
          onClick={(e) => {
            if (onOpenContextMenu && sessionId) {
              const rect = e.currentTarget.getBoundingClientRect();
              onOpenContextMenu(sessionId, {
                x: rect.right,
                y: rect.bottom,
              });
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            backgroundColor: tokens.colors.surface.default,
            border: `1px solid ${tokens.colors.border.primary}`,
            borderRadius: tokens.borderRadius.base, // 8px
            cursor: 'pointer',
          }}
        >
          <Icon
            name="dots"
            size={16}
            color={tokens.colors.icon.secondary}
          />
        </button>
      </div>
    </div>
  );
}
