export const theme = {
  colors: {
    // Primary colors
    primary: '#6c5ce7',
    primaryLight: '#a29bfe',
    primaryDark: '#5f3dc4',
    
    // Secondary colors
    secondary: '#007AFF',
    secondaryLight: '#4DA3FF',
    secondaryDark: '#0056CC',
    
    // Status colors
    success: '#00C851',
    warning: '#FF8800',
    error: '#FF3B30',
    info: '#17A2B8',
    
    // Recording states
    recording: '#FF4757',
    processing: '#636E72',
    
    // Neutral colors
    background: '#F8F9FA',
    surface: '#FFFFFF',
    surfaceSecondary: '#F1F3F4',
    
    // Text colors
    textPrimary: '#1C1C1E',
    textSecondary: '#3C3C43',
    textTertiary: '#8E8E93',
    textDisabled: '#C7C7CC',
    
    // Border colors
    border: '#E9ECEF',
    borderLight: '#F1F3F4',
    
    // Overlay colors
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
    
    // Mood colors
    mood: {
      happy: '#FFD93D',
      sad: '#6C5CE7',
      angry: '#FF6B6B',
      excited: '#FF8E53',
      calm: '#74B9FF',
      anxious: '#A29BFE',
      neutral: '#636E72',
      grateful: '#00B894',
      frustrated: '#E17055',
      content: '#81ECEC'
    }
  },
  
  typography: {
    // Font families
    fontFamily: {
      regular: 'System',
      medium: 'System',
      bold: 'HelveticaNeue-Bold',
      light: 'HelveticaNeue-Light'
    },
    
    // Font sizes
    fontSize: {
      xs: 10,
      sm: 12,
      base: 14,
      md: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 32,
      '4xl': 40,
      '5xl': 48
    },
    
    // Font weights
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    },
    
    // Line heights
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.6,
      loose: 2
    }
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
    '4xl': 48,
    '5xl': 64
  },
  
  borderRadius: {
    xs: 4,
    sm: 6,
    base: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1
    },
    base: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 4
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 8
    }
  },
  
  components: {
    button: {
      height: {
        sm: 32,
        base: 44,
        lg: 56
      },
      padding: {
        sm: 12,
        base: 16,
        lg: 20
      }
    },
    
    card: {
      padding: 16,
      borderRadius: 12,
      backgroundColor: '#FFFFFF'
    },
    
    input: {
      height: 44,
      padding: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#E9ECEF'
    }
  }
};

export type Theme = typeof theme;