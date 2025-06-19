// src/styles/themes.ts - نظام الثيمات المحدث
export const lightTheme = {
  colors: {
    // Primary Colors
    primary: '#2196F3',
    primaryContainer: '#E3F2FD',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#1976D2',
    
    // Secondary Colors
    secondary: '#03DAC6',
    secondaryContainer: '#E0F7FA',
    onSecondary: '#000000',
    onSecondaryContainer: '#00695C',
    
    // Background Colors
    background: '#FFFFFF',
    onBackground: '#000000',
    
    // Surface Colors
    surface: '#FFFFFF',
    onSurface: '#000000',
    surfaceVariant: '#F5F5F5',
    onSurfaceVariant: '#757575',
    
    // Error Colors
    error: '#F44336',
    onError: '#FFFFFF',
    errorContainer: '#FFEBEE',
    onErrorContainer: '#C62828',
    
    // Success Colors
    success: '#4CAF50',
    onSuccess: '#FFFFFF',
    successContainer: '#E8F5E8',
    
    // Warning Colors
    warning: '#FF9800',
    onWarning: '#FFFFFF',
    warningContainer: '#FFF3E0',
    
    // Info Colors
    info: '#2196F3',
    onInfo: '#FFFFFF',
    infoContainer: '#E3F2FD',
    
    // Outline & Borders
    outline: '#E0E0E0',
    outlineVariant: '#F5F5F5',
    
    // Additional Colors
    disabled: '#BDBDBD',
    placeholder: '#9E9E9E',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    notification: '#2196F3',
    
    // Card & Elevation
    elevation: {
      level0: '#FFFFFF',
      level1: '#FAFAFA',
      level2: '#F5F5F5',
      level3: '#F0F0F0',
      level4: '#EEEEEE',
      level5: '#E8E8E8',
    },
  },
  roundness: 12,
  version: 3 as const,
};

export const darkTheme = {
  colors: {
    // Primary Colors
    primary: '#90CAF9',
    primaryContainer: '#1976D2',
    onPrimary: '#000000',
    onPrimaryContainer: '#E3F2FD',
    
    // Secondary Colors
    secondary: '#A7FFEB',
    secondaryContainer: '#00695C',
    onSecondary: '#000000',
    onSecondaryContainer: '#E0F7FA',
    
    // Background Colors
    background: '#121212',
    onBackground: '#FFFFFF',
    
    // Surface Colors
    surface: '#1E1E1E',
    onSurface: '#FFFFFF',
    surfaceVariant: '#2C2C2C',
    onSurfaceVariant: '#BDBDBD',
    
    // Error Colors
    error: '#EF5350',
    onError: '#000000',
    errorContainer: '#B71C1C',
    onErrorContainer: '#FFCDD2',
    
    // Success Colors
    success: '#66BB6A',
    onSuccess: '#000000',
    successContainer: '#2E7D32',
    
    // Warning Colors
    warning: '#FFB74D',
    onWarning: '#000000',
    warningContainer: '#E65100',
    
    // Info Colors
    info: '#64B5F6',
    onInfo: '#000000',
    infoContainer: '#1976D2',
    
    // Outline & Borders
    outline: '#424242',
    outlineVariant: '#2C2C2C',
    
    // Additional Colors
    disabled: '#616161',
    placeholder: '#757575',
    backdrop: 'rgba(0, 0, 0, 0.8)',
    notification: '#90CAF9',
    
    // Card & Elevation
    elevation: {
      level0: '#121212',
      level1: '#1E1E1E',
      level2: '#2C2C2C',
      level3: '#373737',
      level4: '#404040',
      level5: '#4A4A4A',
    },
  },
  roundness: 12,
  version: 3 as const,
};

// Social Media Colors (same for both themes)
export const socialColors = {
  facebook: '#1877F2',
  instagram: '#E4405F',
  whatsapp: '#25D366',
  telegram: '#0088CC',
  twitter: '#1DA1F2',
  linkedin: '#0077B5',
  snapchat: '#FFFC00',
  tiktok: '#000000',
  youtube: '#FF0000',
  github: '#181717',
  discord: '#5865F2',
  reddit: '#FF4500',
  pinterest: '#BD081C',
  behance: '#1769FF',
  dribbble: '#EA4C89',
};

// Spacing (same for both themes)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border Radius (same for both themes)
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

// Animation Durations
export const animation = {
  fast: 150,
  normal: 300,
  slow: 500,
};

// Typography
export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
};

// Shadows (different for light/dark)
export const lightShadows = {
  small: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const darkShadows = {
  small: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
};