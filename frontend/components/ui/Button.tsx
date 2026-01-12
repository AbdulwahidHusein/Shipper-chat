/**
 * Button Component
 * Matches Figma design - Primary button with brand green
 */

import { tokens } from '@/lib/design-tokens';
import Icon, { IconName } from './Icon';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'icon';
  size?: 'sm' | 'md';
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  onClick,
  className = '',
  disabled = false,
  type = 'button',
}: ButtonProps) {
  const baseStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing[2], // 8px
    borderRadius: tokens.borderRadius.base, // 8px
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: tokens.typography.fontFamily.sans.join(', '),
    ...(size === 'sm'
      ? {
          height: tokens.dimensions.button.height.sm, // 32px
          padding: '8px',
          fontSize: tokens.typography.fontSize.sm, // 14px
          fontWeight: tokens.typography.fontWeight.medium, // 500
          lineHeight: tokens.typography.lineHeight.base, // 20px
        }
      : {
          height: tokens.dimensions.button.height.md, // 40px
          padding: '8px',
          fontSize: tokens.typography.fontSize.sm, // 14px
          fontWeight: tokens.typography.fontWeight.medium, // 500
          lineHeight: tokens.typography.lineHeight.base, // 20px
        }),
  };

  const variantStyles = {
    primary: {
      backgroundColor: tokens.colors.brand[500],
      color: tokens.colors.text.neutral.white,
      border: `1px solid ${tokens.colors.border.brand}`,
      backgroundImage:
        'linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 100%), linear-gradient(90deg, rgba(30, 154, 128, 1) 0%, rgba(30, 154, 128, 1) 100%)',
      boxShadow: 'inset 0px 1px 0px 1px rgba(255, 255, 255, 0.12)',
      opacity: disabled ? 0.5 : 1,
    },
    secondary: {
      backgroundColor: tokens.colors.surface.default,
      color: tokens.colors.text.heading.primary,
      border: `1px solid ${tokens.colors.border.primary}`,
      opacity: disabled ? 0.5 : 1,
    },
    icon: {
      backgroundColor: 'transparent',
      color: tokens.colors.icon.primary,
      border: 'none',
      padding: '8px',
      width: size === 'sm' ? '32px' : '40px',
      opacity: disabled ? 0.5 : 1,
    },
  };

  const iconSize = size === 'sm' ? 18 : 16;

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      className={className}
      style={{
        ...baseStyles,
        ...variantStyles[variant],
      }}
      disabled={disabled}
    >
      {icon && iconPosition === 'left' && (
        <Icon name={icon} size={iconSize} color={variant === 'primary' ? tokens.colors.text.neutral.white : undefined} />
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <Icon name={icon} size={iconSize} color={variant === 'primary' ? tokens.colors.text.neutral.white : undefined} />
      )}
    </button>
  );
}
