import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#7c3aed',
    primaryContainer: '#e9d5ff',
    secondary: '#64748b',
    secondaryContainer: '#f1f5f9',
    background: '#ffffff',
    surface: '#ffffff',
    surfaceVariant: '#f8fafc',
    error: '#ef4444',
    errorContainer: '#fef2f2',
    onPrimary: '#ffffff',
    onPrimaryContainer: '#1e1b4b',
    onSecondary: '#ffffff',
    onSecondaryContainer: '#334155',
    onBackground: '#0f172a',
    onSurface: '#0f172a',
    onSurfaceVariant: '#64748b',
    onError: '#ffffff',
    onErrorContainer: '#991b1b',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#a855f7',
    primaryContainer: '#581c87',
    secondary: '#94a3b8',
    secondaryContainer: '#475569',
    background: '#0f172a',
    surface: '#1e293b',
    surfaceVariant: '#334155',
    error: '#f87171',
    errorContainer: '#7f1d1d',
  },
};