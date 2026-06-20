import { z } from 'zod'

export const contactFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  email: z.string().trim().email('Enter a valid email').max(254),
  message: z.string().trim().min(1, 'Message is required').max(5000),
  website: z.string().max(0).optional(),
  turnstileToken: z.string().trim().optional(),
})

export type ContactFormInput = z.infer<typeof contactFormSchema>
