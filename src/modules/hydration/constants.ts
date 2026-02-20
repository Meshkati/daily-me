export const DEFAULT_DAILY_GOAL_ML = 2500
export const DEFAULT_CUP_SIZE_ML = 250

export const PRESET_GOALS = [2000, 2500, 3000, 3500] as const
export const PRESET_CUP_SIZES = [200, 250, 300, 330, 500] as const

export const DRINK_TYPE_ICONS: Record<string, string> = {
  water: '💧',
  tea: '🍵',
  coffee: '☕',
  other: '🥤',
}

export const DRINK_TYPE_LABELS: Record<string, string> = {
  water: 'Water',
  tea: 'Tea',
  coffee: 'Coffee',
  other: 'Other',
}
