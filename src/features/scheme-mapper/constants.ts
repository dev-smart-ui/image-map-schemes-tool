import config from './config.json';

export const POINTS_MIN = config.points_min || 3;
export const DEFAULT_FILL = config.default_fill_color || 'rgba(255,0,0,0.3)';
export const DEFAULT_PRE_FILL = config.default_pre_fill_color || 'rgba(255,0,0,0.5)';
export const DEFAULT_STROKE = config.default_stroke_color || '#000';
export const TRANSPARENT_OPTION_COLOR = 'transparent';
export const HIGHLIGHT_COLOR = config.highlight_color || '#000000050';