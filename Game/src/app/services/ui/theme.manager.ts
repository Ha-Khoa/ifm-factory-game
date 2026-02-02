/**
 * The UI_THEME object is dynamically filled with CSS variables from the root document.
 * This allows the canvas UI to use the same theme as the HTML components.
 */
export const UI_THEME = {
  fontFamily: '',
  fontFamilyCentaur: '',
  textColor: '',
  bgColor: '',
  borderColor: '',
  highlightColor: '',
  lockedColor: '',
  shadowColor: '',
  progressBg: '',
  progressFill: '',
  progressBorder: '',
  primary: '',
  secondary: '',
  tertiary: '',
  transparent: '',
  black: '',
  white: '',
  outline: '',
  info: ''
};

/**
 * Loads the UI theme from CSS custom properties into the UI_THEME object.
 * This should be called once during initialization.
 */
export function loadTheme(): void {
  const rootStyle = getComputedStyle(document.documentElement);
  UI_THEME.primary = rootStyle.getPropertyValue('--primary').trim();
  UI_THEME.secondary = rootStyle.getPropertyValue('--secondary').trim();
  UI_THEME.tertiary = rootStyle.getPropertyValue('--tertiary').trim();
  UI_THEME.fontFamily = rootStyle.getPropertyValue('--font-family').trim();
  UI_THEME.fontFamilyCentaur = rootStyle.getPropertyValue('--font-family-centaur').trim();
  UI_THEME.textColor = UI_THEME.tertiary;
  UI_THEME.bgColor = UI_THEME.primary;
  UI_THEME.borderColor = rootStyle.getPropertyValue('--border-color').trim();
  UI_THEME.highlightColor = UI_THEME.secondary;
  UI_THEME.lockedColor = rootStyle.getPropertyValue('--locked-color').trim();
  UI_THEME.shadowColor = rootStyle.getPropertyValue('--shadow-color').trim();
  UI_THEME.progressBg = rootStyle.getPropertyValue('--progress-bg').trim();
  UI_THEME.progressFill = rootStyle.getPropertyValue('--progress-fill').trim();
  UI_THEME.progressBorder = rootStyle.getPropertyValue('--progress-border').trim();
  UI_THEME.transparent = rootStyle.getPropertyValue('--md-sys-color-transparent').trim();
  UI_THEME.black = rootStyle.getPropertyValue('--md-sys-color-black').trim(); // Corrected from 'transparent' in original code
  UI_THEME.white = rootStyle.getPropertyValue('--md-sys-color-white').trim();
  UI_THEME.outline = rootStyle.getPropertyValue('--md-sys-color-outline').trim();
  UI_THEME.info = rootStyle.getPropertyValue('--md-sys-color-info').trim();
}
