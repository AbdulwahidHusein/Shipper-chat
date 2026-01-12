/**
 * Design Tokens from Figma
 * Exact colors, typography, spacing, and other design values
 */

export const colors = {
  // Brand Colors
  brand: {
    500: '#1e9a80', // semantic/brand/500
  },
  
  // Background Colors
  background: {
    primary: '#f3f3ee', // background/bg-primary-cards
    brandPrimary: '#f0fdf4', // background/bg-brand-primary
    tertiary: '#f8f8f5', // background/bg-tertiary
    senary: '#e8e5df', // background/bg-senary
  },
  
  // Surface Colors
  surface: {
    default: '#ffffff', // bg/surface/default
    weak: '#f7f9fb', // bg/surface/weak
  },
  
  // Border Colors
  border: {
    primary: '#e8e5df', // border/border-primary
    brand: '#1e9a80', // border/border-brand
  },
  
  // Text Colors
  text: {
    neutral: {
      main: '#111625', // text/neutral/main
      sub: '#596881', // text/neutral/sub
      soft: '#8796af', // text/neutral/soft
      white: '#ffffff', // text/neutral/white
    },
    heading: {
      primary: '#1c1c1c', // text/heading-primary
      secondary: '#404040', // text/heading-secondary
    },
    placeholder: '#8b8b8b', // text/placeholder
    state: {
      success: '#38c793', // text/state/success
    },
  },
  
  // Icon Colors
  icon: {
    primary: '#151515', // Icon/Neutral/Icon-Primary
    primaryInverted: '#ffffff', // Icon/Neutral/Icon-Primary-Inverted
    secondary: '#262626', // icons/icon-secondary
    quinary: '#8b8b8b', // icons/icon-quinary
    neutral: {
      sub: '#596881', // icon/neutral/sub
      soft: '#8796af', // icon/neutral/soft
      white: '#ffffff', // icon/neutral/white
    },
  },
  
  // Other Colors
  grey: {
    950: '#09090b', // Colors/grey/950
  },
  
  // Stroke Colors (from Figma)
  stroke: {
    neutral: 'rgba(89, 104, 129, 1)', // #596881
    soft: 'rgba(135, 150, 175, 1)', // #8796af
    dark: 'rgba(38, 38, 38, 1)', // #262626
    placeholder: 'rgba(139, 139, 139, 1)', // #8b8b8b
    brand: 'rgba(30, 154, 128, 1)', // #1e9a80
    border: 'rgba(232, 229, 223, 1)', // #e8e5df
  },
} as const;

export const typography = {
  fontFamily: {
    sans: ['Inter', 'sans-serif'],
  },
  
  fontSize: {
    xs: '12px', // Paragraph/XSmall, Label/XSmall
    sm: '14px', // Label/Small, Paragraph/Small, Caption large/Medium
    base: '16px',
    lg: '18px', // Caption small/Regular
    xl: '20px', // Subheadline/Semibold
  },
  
  fontWeight: {
    regular: 400, // Regular
    medium: 500, // Medium
    semibold: 600, // Semi Bold
  },
  
  lineHeight: {
    tight: '16px', // Paragraph/XSmall, Label/XSmall
    normal: '18px', // Caption small/Regular
    base: '20px', // Label/Small, Paragraph/Small, Caption large/Medium
    relaxed: '30px', // Subheadline/Semibold
  },
  
  letterSpacing: {
    tight: '-0.084px', // Label/Small, Paragraph/Small
    tighter: '-0.14px', // Some labels
    normal: '0px', // Paragraph/XSmall, Caption small/Regular
    wide: '-0.12px', // Some captions
  },
  
  // Typography Styles (matching Figma)
  styles: {
    labelSmall: {
      fontFamily: 'Inter',
      fontSize: '14px',
      fontWeight: 500,
      lineHeight: '20px',
      letterSpacing: '-0.084px',
    },
    labelXSmall: {
      fontFamily: 'Inter',
      fontSize: '12px',
      fontWeight: 500,
      lineHeight: '16px',
      letterSpacing: '0px',
    },
    paragraphSmall: {
      fontFamily: 'Inter',
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: '20px',
      letterSpacing: '-0.084px',
    },
    paragraphXSmall: {
      fontFamily: 'Inter',
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: '16px',
      letterSpacing: '0px',
    },
    subheadlineSemibold: {
      fontFamily: 'Inter',
      fontSize: '20px',
      fontWeight: 600,
      lineHeight: '30px',
      letterSpacing: '0px',
    },
    captionSmall: {
      fontFamily: 'Inter',
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: '18px',
      letterSpacing: '0px',
    },
    captionLarge: {
      fontFamily: 'Inter',
      fontSize: '14px',
      fontWeight: 500,
      lineHeight: '20px',
      letterSpacing: '0px',
    },
  },
} as const;

export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
} as const;

export const borderRadius = {
  sm: '6px',
  base: '8px',
  md: '10px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '100px', // rounded-full (1000px in Figma, but we use 100px for CSS)
  pill: '60px', // For date dividers
} as const;

export const shadows = {
  menu: '0px 1px 13.8px 1px rgba(18, 18, 18, 0.1)',
  inset: 'inset 0px 1px 0px 1px rgba(255, 255, 255, 0.12)',
} as const;

// Component-specific dimensions from Figma
export const dimensions = {
  sidebar: {
    width: '76px',
  },
  messageList: {
    width: '400px',
  },
  avatar: {
    sm: '32px',
    md: '40px',
    lg: '72px',
  },
  icon: {
    xs: '12.5px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
  },
  button: {
    height: {
      sm: '32px',
      md: '40px',
    },
  },
  input: {
    height: {
      sm: '32px',
      md: '40px',
    },
  },
} as const;

// Export all tokens
export const tokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  dimensions,
} as const;
