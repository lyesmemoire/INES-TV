import { z } from "zod"

export const ChannelSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  logo: z.string().url().nullable(),
  category: z.string().min(1),
  live: z.boolean(),
  stream_url: z.string().url(),
  description: z.string().nullable(),
  created_at: z.string().datetime(),
})

export type SupabaseChannel = z.infer<typeof ChannelSchema>
