import { useState } from 'react'
import toast from 'react-hot-toast'
import { Header, IconButton } from '../../shared/components/Header'
import { Card } from '../../shared/components/Card'
import { useSettingsStore } from '../hydration/store/settingsStore'
import { useHydrationStore } from '../hydration/store/hydrationStore'
import { PRESET_GOALS, PRESET_CUP_SIZES } from '../hydration/constants'
import { getAllLogs } from '../../shared/db'
import { formatHour } from '../../shared/utils/date'

interface SettingsPageProps {
  onBack: () => void
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  const { dailyGoal, cupSize, theme, dayStartHour, setDailyGoal, setCupSize, setTheme, setDayStartHour } =
    useSettingsStore()
  const { resetToday } = useHydrationStore()

  const [confirmReset, setConfirmReset] = useState(false)

  const handleResetToday = async () => {
    if (!confirmReset) {
      setConfirmReset(true)
      return
    }
    await resetToday()
    setConfirmReset(false)
    toast.success("Today's data reset", { icon: '🗑️' })
  }

  const handleExportData = async () => {
    try {
      const logs = await getAllLogs()
      const json = JSON.stringify(logs, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `daily-me-hydration-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Data exported!', { icon: '📁' })
    } catch {
      toast.error('Export failed')
    }
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Settings"
        leftAction={
          <IconButton icon="←" label="Back" onClick={onBack} />
        }
      />

      <div className="flex-1 overflow-y-auto pb-28 px-4 flex flex-col gap-4 pt-2">

        {/* Daily Goal */}
        <Card className="p-4 flex flex-col gap-3">
          <div>
            <h2 className="text-sm font-semibold text-on-surface dark:text-on-surface-dark">
              Daily Goal
            </h2>
            <p className="text-xs text-on-surface-muted">Current: {dailyGoal} ml</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_GOALS.map((g) => (
              <button
                key={g}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  dailyGoal === g
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-variant dark:bg-surface-variant-dark text-on-surface dark:text-on-surface-dark hover:bg-primary-container'
                }`}
                onClick={() => {
                  setDailyGoal(g)
                  toast.success(`Goal set to ${g} ml`)
                }}
              >
                {g} ml
              </button>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={dailyGoal}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10)
                if (!isNaN(val) && val >= 500 && val <= 10000) setDailyGoal(val)
              }}
              className="flex-1 bg-surface-variant dark:bg-surface-variant-dark rounded-xl px-3 py-2 text-sm text-on-surface dark:text-on-surface-dark outline-none focus:ring-2 focus:ring-primary"
              min={500}
              max={10000}
              aria-label="Custom daily goal in ml"
            />
            <span className="text-sm text-on-surface-muted">ml</span>
          </div>
        </Card>

        {/* Cup Size */}
        <Card className="p-4 flex flex-col gap-3">
          <div>
            <h2 className="text-sm font-semibold text-on-surface dark:text-on-surface-dark">
              Default Cup Size
            </h2>
            <p className="text-xs text-on-surface-muted">Current: {cupSize} ml</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_CUP_SIZES.map((s) => (
              <button
                key={s}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  cupSize === s
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-variant dark:bg-surface-variant-dark text-on-surface dark:text-on-surface-dark hover:bg-primary-container'
                }`}
                onClick={() => {
                  setCupSize(s)
                  toast.success(`Cup size set to ${s} ml`)
                }}
              >
                {s} ml
              </button>
            ))}
          </div>
        </Card>

        {/* Theme */}
        <Card className="p-4 flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-on-surface dark:text-on-surface-dark">
            Theme
          </h2>
          <div className="flex gap-2">
            {(['light', 'dark', 'system'] as const).map((t) => (
              <button
                key={t}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium capitalize transition-colors ${
                  theme === t
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-variant dark:bg-surface-variant-dark text-on-surface dark:text-on-surface-dark hover:bg-primary-container'
                }`}
                onClick={() => setTheme(t)}
              >
                {t === 'light' ? '☀️' : t === 'dark' ? '🌙' : '🌗'} {t}
              </button>
            ))}
          </div>
        </Card>

        {/* Day Start Time */}
        <Card className="p-4 flex flex-col gap-3">
          <div>
            <h2 className="text-sm font-semibold text-on-surface dark:text-on-surface-dark">
              Day Start Time
            </h2>
            <p className="text-xs text-on-surface-muted">
              When does your tracking day begin? Useful for Ramadan or shift schedules.
            </p>
          </div>
          <select
            value={dayStartHour}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10)
              setDayStartHour(val)
              toast.success(`Day starts at ${formatHour(val)}`)
            }}
            className="bg-surface-variant dark:bg-surface-variant-dark rounded-xl px-3 py-2.5 text-sm text-on-surface dark:text-on-surface-dark outline-none focus:ring-2 focus:ring-primary"
          >
            {Array.from({ length: 24 }, (_, h) => (
              <option key={h} value={h}>
                {formatHour(h)}{h === 0 ? ' (default)' : ''}
              </option>
            ))}
          </select>
        </Card>

        {/* Data Management */}
        <Card className="p-4 flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-on-surface dark:text-on-surface-dark mb-1">
            Data
          </h2>

          <button
            className="w-full py-3 px-4 rounded-xl text-sm font-medium text-left bg-surface-variant dark:bg-surface-variant-dark text-on-surface dark:text-on-surface-dark hover:bg-primary-container transition-colors flex items-center gap-2"
            onClick={handleExportData}
          >
            <span>📤</span>
            <span>Export data (JSON)</span>
          </button>

          <button
            className={`w-full py-3 px-4 rounded-xl text-sm font-medium text-left transition-colors flex items-center gap-2 ${
              confirmReset
                ? 'bg-error text-white'
                : 'bg-surface-variant dark:bg-surface-variant-dark text-error hover:bg-red-50 dark:hover:bg-red-900/20'
            }`}
            onClick={handleResetToday}
            onBlur={() => setConfirmReset(false)}
          >
            <span>🗑️</span>
            <span>{confirmReset ? 'Tap again to confirm reset' : "Reset today's data"}</span>
          </button>
        </Card>

        {/* About */}
        <Card className="p-4">
          <p className="text-xs text-on-surface-muted text-center">
            Daily Me — v0.1.0
            <br />
            Personal hydration tracker. All data stays on your device.
          </p>
        </Card>
      </div>
    </div>
  )
}
