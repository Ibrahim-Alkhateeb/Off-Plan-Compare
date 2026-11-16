import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useI18n } from '@/i18n'
import type { Lang } from '@/types'

export function LanguageSwitch() {
  const { lang, setLang, t } = useI18n()
  const itemClasses =
    'px-3 text-muted-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-primary'

  return (
    <ToggleGroup
      type="single"
      size="sm"
      variant="outline"
      spacing={0}
      value={lang}
      // Radix sends an empty value when the active item is pressed again; one language is always on.
      onValueChange={(value) => {
        if (value) setLang(value as Lang)
      }}
      aria-label={t.app.language.label}
    >
      <ToggleGroupItem value="en" lang="en" aria-label={t.app.language.enName} className={itemClasses}>
        {t.app.language.en}
      </ToggleGroupItem>
      <ToggleGroupItem
        value="ar"
        lang="ar"
        aria-label={t.app.language.arName}
        className={itemClasses}
        // The Arabic name keeps the Arabic typeface even while the interface is in English.
        style={{ fontFamily: '"IBM Plex Sans Arabic", var(--font-sans)' }}
      >
        {t.app.language.ar}
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
