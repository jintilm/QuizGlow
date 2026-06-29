// EXPORTS: CHART_COLORS

/**
 * 图表颜色配置（供 ECharts / recharts 等图表库使用）
 * 与 tailwind-theme.css 中的 --chart-1..5 一一对应，使用 hex 字面量
 * chart-1: hsl(221 83% 53%) → #2563eb
 * chart-2: hsl(251 83% 60%) → #7c3aed
 * chart-3: hsl(281 75% 65%) → #a855f7
 * chart-4: hsl(311 70% 65%) → #ec4899
 * chart-5: hsl(191 80% 55%) → #06b6d4
 */
export const CHART_COLORS = [
  '#2563eb',
  '#7c3aed',
  '#a855f7',
  '#ec4899',
  '#06b6d4',
] as const;
