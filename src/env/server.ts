import { z } from 'zod'

const serverEnvSchema = z.object({
  NEXT_PUBLIC_GOVBR_URL: z.string(),
  NEXT_PUBLIC_GOVBR_CLIENT_ID: z.string(),
  NEXT_PUBLIC_GOVBR_REDIRECT_URI: z.string(),
})

export async function getEnv() {
  const _env = serverEnvSchema.safeParse(process.env)

  if (_env.success === false) {
    console.error('❌ Invalid environment variables!', _env.error.format())

    throw new Error('Invalid environment variables!')
  }

  return _env.data
}
