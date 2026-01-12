/**
 * TopBar Component
 * Matches Figma design - Page label, search, notifications, settings, profile
 */

'use client';

import { tokens } from '@/lib/design-tokens';
import Icon from '@/components/ui/Icon';
import Input from '@/components/ui/Input';
import Avatar from '@/components/ui/Avatar';
import { currentUser } from '@/data/mockData';

export default function TopBar() {
  return (
    <div
      style={{
        backgroundColor: tokens.colors.surface.default,
        display: 'flex',
        flexDirection: 'column',
        padding: `${tokens.spacing[3]} ${tokens.spacing[6]}`, // 12px 24px
        borderRadius: tokens.borderRadius.xl, // 16px
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        {/* Left: Page Label */}
        <div
          style={{
            display: 'flex',
            gap: tokens.spacing[2], // 8px
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="chat" size={20} color={tokens.colors.icon.neutral.sub} />
          </div>
          <p
            style={{
              ...tokens.typography.styles.labelSmall,
              color: tokens.colors.text.neutral.main,
            }}
          >
            Message
          </p>
        </div>

        {/* Right: Search, Icons, Profile */}
        <div
          style={{
            display: 'flex',
            gap: tokens.spacing[4], // 16px
            alignItems: 'center',
          }}
        >
          {/* Search, Bell, Settings */}
          <div
            style={{
              display: 'flex',
              gap: tokens.spacing[3], // 12px
              alignItems: 'center',
            }}
          >
            <Input
              type="search"
              placeholder="Search"
              icon="search"
              size="sm"
              showCommandKey
              className="w-[300px]"
            />
            <button
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
              <Icon name="bell" size={16} color={tokens.colors.icon.secondary} />
            </button>
            <button
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
              <Icon name="settings" size={16} color={tokens.colors.icon.secondary} />
            </button>
          </div>

          {/* Divider */}
          <div
            style={{
              width: '0px',
              height: '20px',
              borderLeft: `1px solid ${tokens.colors.border.primary}`,
            }}
          />

          {/* Profile */}
          <div
            style={{
              display: 'flex',
              gap: tokens.spacing[2], // 8px
              alignItems: 'center',
            }}
          >
            <Avatar src={currentUser.picture} name={currentUser.name} size="sm" />
            <button
              style={{
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: 'none',
                backgroundColor: 'transparent',
              }}
            >
              <Icon name="chevron-down" size={16} color={tokens.colors.icon.secondary} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

