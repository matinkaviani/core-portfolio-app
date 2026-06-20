export interface VisitorLocation {
  label: string
  city?: string
  country?: string
  countryCode?: string
  timezone?: string
  approximate?: boolean
}

function countryName(code: string): string | undefined {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code.toUpperCase())
  } catch {
    return code.toUpperCase()
  }
}

export function formatVisitorLocation(input: {
  city?: string | null
  countryCode?: string | null
  timezone?: string | null
  approximate?: boolean
}): VisitorLocation | null {
  const city = input.city?.trim()
  const countryCode = input.countryCode?.trim().toUpperCase()
  const country = countryCode ? countryName(countryCode) : undefined

  if (city && country) {
    return {
      label: `${city}, ${country}`,
      city,
      country,
      countryCode,
      timezone: input.timezone ?? undefined,
      approximate: input.approximate,
    }
  }

  if (country) {
    return {
      label: country,
      country,
      countryCode,
      timezone: input.timezone ?? undefined,
      approximate: input.approximate,
    }
  }

  if (city) {
    return {
      label: city,
      city,
      timezone: input.timezone ?? undefined,
      approximate: input.approximate,
    }
  }

  return null
}

export function guessLocationFromTimezone(timezone: string): VisitorLocation {
  const city = timezone.split('/').pop()?.replace(/_/g, ' ') ?? timezone
  return {
    label: `${city} (approx.)`,
    timezone,
    approximate: true,
  }
}
