import { formatVisitorLocation } from '@/lib/os/visitor-location'

export async function GET(req: Request) {
  const city = req.headers.get('cf-ipcity')
  const countryCode = req.headers.get('cf-ipcountry')
  const timezone = req.headers.get('cf-timezone')

  const location = formatVisitorLocation({
    city,
    countryCode,
    timezone,
    approximate: false,
  })

  return Response.json({
    location,
    timezone: timezone ?? null,
  })
}
