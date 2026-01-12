/**
 * Input Component
 * Matches Figma design - Search inputs and message input
 */

import { tokens } from '@/lib/design-tokens';
import Icon, { IconName } from './Icon';

interface InputProps {
  type?: 'text' | 'search' | 'email' | 'password';
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  size?: 'sm' | 'md';
  className?: string;
  showCommandKey?: boolean; // For search input with ⌘+K
  rounded?: 'default' | 'full'; // For message input (rounded-full)
}

export default function Input({
  type = 'text',
  placeholder,
  value,
  onChange,
  icon,
  iconPosition = 'left',
  size = 'md',
  className = '',
  showCommandKey = false,
  rounded = 'default',
}: InputProps) {
  const height = size === 'sm' ? tokens.dimensions.input.height.sm : tokens.dimensions.input.height.md;
  const iconSize = size === 'sm' ? 14 : 16;
  const borderRadius = rounded === 'full' ? tokens.borderRadius.full : tokens.borderRadius.md;

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height,
        paddingLeft: icon && iconPosition === 'left' ? '10px' : '16px',
        paddingRight: icon && iconPosition === 'right' ? '10px' : showCommandKey ? '4px' : '16px',
        gap: tokens.spacing[2], // 8px
        border: `1px solid ${tokens.colors.border.primary}`,
        borderRadius,
        backgroundColor: tokens.colors.surface.default,
      }}
    >
      {icon && iconPosition === 'left' && (
        <Icon
          name={icon}
          size={iconSize}
          color={tokens.colors.icon.neutral.soft}
          className="shrink-0"
        />
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          backgroundColor: 'transparent',
          fontSize: size === 'sm' ? tokens.typography.fontSize.xs : tokens.typography.fontSize.sm,
          fontWeight: tokens.typography.fontWeight.regular,
          lineHeight: size === 'sm' ? tokens.typography.lineHeight.tight : tokens.typography.lineHeight.base,
          color: tokens.colors.text.neutral.main,
          fontFamily: tokens.typography.fontFamily.sans.join(', '),
        }}
        className="placeholder:text-placeholder"
      />
      {showCommandKey && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            height: '24px',
            padding: '5px 6px',
            borderRadius: tokens.borderRadius.sm, // 6px
            backgroundColor: tokens.colors.background.primary,
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.regular,
            lineHeight: tokens.typography.lineHeight.tight,
            color: tokens.colors.text.heading.secondary,
            fontFamily: tokens.typography.fontFamily.sans.join(', '),
          }}
        >
          ⌘+K
        </div>
      )}
      {icon && iconPosition === 'right' && (
        <Icon
          name={icon}
          size={iconSize}
          color={tokens.colors.icon.neutral.soft}
          className="shrink-0"
        />
      )}
    </div>
  );
}
