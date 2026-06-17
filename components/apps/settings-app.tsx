'use client'

import { useSettings } from '../os/settings-context'
import { useSession } from '../os/session-context'
import { AchievementsList } from '../os/achievements-context'
import { WALLPAPER_OPTIONS } from '@/lib/os/settings'
import { useAchievements } from '../os/achievements-context'

export function SettingsApp() {
  const { settings, updateSettings, resetSettings } = useSettings()
  const { unlock } = useAchievements()
  const { visitorName, logout } = useSession()

  const change = <K extends keyof typeof settings>(
    key: K,
    value: (typeof settings)[K],
  ) => {
    updateSettings({ [key]: value })
    unlock('settings_tinkerer')
  }

  return (
    <div className="nexus-scrollbar h-full overflow-auto bg-[oklch(0.155_0.004_270)] p-4 sm:p-6">
      <p className="text-[11px] uppercase tracking-wider text-primary">System</p>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
        Settings
      </h2>
      <p className="mt-2 max-w-prose text-sm text-muted-foreground">
        Customize the NEXUS desktop environment.
      </p>

      <section className="mt-6 space-y-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Session
          </p>
          <p className="mt-2 text-sm text-foreground">
            Signed in as <span className="font-medium">{visitorName}</span>
          </p>
          <button
            type="button"
            onClick={logout}
            className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20"
          >
            Log out
          </button>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-foreground">
            Wallpaper
          </label>
          <div className="grid grid-cols-2 gap-2">
            {WALLPAPER_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => change('wallpaper', opt.id)}
                className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  settings.wallpaper === opt.id
                    ? 'border-primary/50 bg-primary/10 text-foreground'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 flex items-center justify-between text-xs font-medium text-foreground">
            <span>Accent hue</span>
            <span className="font-mono text-muted-foreground">
              {settings.accentHue}°
            </span>
          </label>
          <input
            type="range"
            min={180}
            max={280}
            value={settings.accentHue}
            onChange={(e) => change('accentHue', Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>

        <ToggleRow
          label="Show desktop grid"
          checked={settings.showGrid}
          onChange={(v) => change('showGrid', v)}
        />
        <ToggleRow
          label="Reduced motion"
          checked={settings.reducedMotion}
          onChange={(v) => change('reducedMotion', v)}
        />
        <ToggleRow
          label="Skip boot animation"
          checked={settings.skipBoot}
          onChange={(v) => change('skipBoot', v)}
        />

        <button
          type="button"
          onClick={resetSettings}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Reset to defaults
        </button>
      </section>

      <section className="mt-8">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Achievements
        </p>
        <AchievementsList />
      </section>
    </div>
  )
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5">
      <span className="text-sm text-foreground">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          checked ? 'bg-primary' : 'bg-secondary'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  )
}
