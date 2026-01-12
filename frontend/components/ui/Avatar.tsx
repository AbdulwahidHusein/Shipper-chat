/**
 * Avatar Component
 * Matches Figma design with sizes: 32px, 40px, 72px
 */

import Image from 'next/image';
import { tokens } from '@/lib/design-tokens';

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  isOnline?: boolean;
}

const sizeMap = {
  sm: tokens.dimensions.avatar.sm, // 32px
  md: tokens.dimensions.avatar.md, // 40px
  lg: tokens.dimensions.avatar.lg, // 72px
};

export default function Avatar({
  src,
  alt,
  name,
  size = 'md',
  className = '',
  isOnline,
}: AvatarProps) {
  const sizeValue = sizeMap[size];
  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full ${className}`}
      style={{
        width: sizeValue,
        height: sizeValue,
        backgroundColor: tokens.colors.surface.weak,
      }}
    >
      {src ? (
        <Image
          src={src}
          alt={alt || name || 'Avatar'}
          width={parseInt(sizeValue)}
          height={parseInt(sizeValue)}
          className="object-cover w-full h-full"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <div
          className="flex items-center justify-center w-full h-full text-white"
          style={{
            backgroundColor: tokens.colors.brand[500],
            fontSize: size === 'lg' ? '24px' : size === 'md' ? '14px' : '12px',
            fontWeight: 500,
          }}
        >
          {initials}
        </div>
      )}
      {isOnline !== undefined && (
        <div
          className="absolute bottom-0 right-0 rounded-full border-2"
          style={{
            width: size === 'lg' ? '16px' : '10px',
            height: size === 'lg' ? '16px' : '10px',
            backgroundColor: isOnline
              ? tokens.colors.text.state.success
              : tokens.colors.text.placeholder,
            borderColor: tokens.colors.surface.default,
          }}
        />
      )}
    </div>
  );
}
