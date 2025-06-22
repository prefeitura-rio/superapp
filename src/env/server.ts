import { z } from 'zod'

const serverEnvSchema = z.object({
  NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL: z.string(),
  NEXT_PUBLIC_IDENTIDADE_CARIOCA_CLIENT_ID: z.string(),
  NEXT_PUBLIC_IDENTIDADE_CARIOCA_REDIRECT_URI: z.string(),
  NEXT_PUBLIC_BASE_API_URL: z.string(),
  GOOGLE_MAPS_API_KEY: z.string(),
  NEXT_PUBLIC_API_BUSCA_ROOT_URL: z.string(),
  IDENTIDADE_CARIOCA_CLIENT_SECRET: z.string(),
  HOTJAR_ID: z.string(),
  GOOGLE_ANALYTICS_ID: z.string(),
  GOOGLE_TAG_MANAGER_ID: z.string(),
})

export async function getEnv() {
  const _env = serverEnvSchema.safeParse(process.env)

  if (_env.success === false) {
    console.error('❌ Invalid environment variables!', _env.error.format())

    throw new Error('Invalid environment variables!')
  }

  return _env.data
}
