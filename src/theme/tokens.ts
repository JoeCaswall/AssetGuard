import { ThemeMode } from '../types/domain';

export interface ThemeTokens {
  mode: ThemeMode;
  background: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  success: string;
  warning: string;
  danger: string;
}

export const lightTheme: ThemeTokens = {
  mode: 'light',
  background: '#f3f5ef',
  surface: '#ffffff',
  surfaceMuted: '#e7ebde',
  text: '#182219',
  textMuted: '#5a6b5d',
  border: '#ccd5c0',
  primary: '#1f5f4a',
  success: '#2d7d46',
  warning: '#bf7b16',
  danger: '#ae3d37',
};

export const darkTheme: ThemeTokens = {
  mode: 'dark',
  background: '#101712',
  surface: '#162019',
  surfaceMuted: '#223127',
  text: '#eef5ed',
  textMuted: '#a1b2a4',
  border: '#314237',
  primary: '#75c4a5',
  success: '#86d39b',
  warning: '#ffc86e',
  danger: '#ff948f',
};

export function getTheme(mode: ThemeMode): ThemeTokens {
  return mode === 'dark' ? darkTheme : lightTheme;
}
