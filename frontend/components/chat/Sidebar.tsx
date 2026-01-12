/**
 * Sidebar Component
 * Matches Figma design exactly - 76px width, navigation icons, user profile
 */

'use client';

import { useState } from 'react';
import { tokens } from '@/lib/design-tokens';
import Icon from '@/components/ui/Icon';
import Avatar from '@/components/ui/Avatar';
import { currentUser } from '@/data/mockData';

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState<'home' | 'chat' | 'compass' | 'folder' | 'images'>('chat');

  const menuItems = [
    { id: 'home' as const, icon: 'home' as const },
    { id: 'chat' as const, icon: 'chat' as const },
    { id: 'compass' as const, icon: 'compass' as const },
    { id: 'folder' as const, icon: 'folder' as const },
    { id: 'images' as const, icon: 'images' as const },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: tokens.dimensions.sidebar.width, // 76px
        padding: `${tokens.spacing[6]} ${tokens.spacing[4]}`, // 24px 16px
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}
    >
      {/* Top Section - Logo and Navigation */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: tokens.spacing[8], // 32px
          alignItems: 'center',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '44px',
            height: '44px',
            padding: '11px',
            borderRadius: tokens.borderRadius.full,
            backgroundColor: tokens.colors.brand[500],
          }}
        >
          <div
            style={{
              width: '22px',
              height: '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Logo icon - using a simple placeholder, can be replaced with actual logo SVG */}
            <div
              style={{
                width: '19.8px',
                height: '22px',
                backgroundColor: tokens.colors.text.neutral.white,
                borderRadius: '2px',
              }}
            />
          </div>
        </div>

        {/* Navigation Menu Items */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacing[2], // 8px
          }}
        >
          {menuItems.map((item) => {
            const isActive = activeItem === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveItem(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '44px',
                  height: '44px',
                  padding: '8px 12px',
                  borderRadius: tokens.borderRadius.base, // 8px
                  backgroundColor: isActive
                    ? tokens.colors.background.brandPrimary
                    : 'transparent',
                  border: isActive
                    ? `1px solid ${tokens.colors.border.brand}`
                    : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon
                  name={item.icon}
                  size={12.5}
                  color={tokens.colors.icon.primary}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Section - Star and User Profile */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: tokens.spacing[6], // 24px
          alignItems: 'center',
          width: '44px',
        }}
      >
        {/* Star Icon */}
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '44px',
            height: '44px',
            padding: '8px 12px',
            borderRadius: tokens.borderRadius.base, // 8px
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <Icon name="star" size={12.5} color={tokens.colors.icon.primary} />
        </button>

        {/* User Avatar */}
        <Avatar
          src={currentUser.picture}
          name={currentUser.name}
          size="md"
          className="cursor-pointer"
        />
      </div>
    </div>
  );
}
