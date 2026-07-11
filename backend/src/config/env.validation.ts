import { Logger } from '@nestjs/common';

/**
 * Fail-fast environment validation. Runs once at startup via ConfigModule's
 * `validate` hook. In production, missing JWT secrets or a missing database
 * URL abort the boot; in development we warn but allow sensible fallbacks so
 * the app is easy to run locally.
 */
export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  const logger = new Logger('EnvValidation');
  const isProd = (config.NODE_ENV ?? 'development') === 'production';

  const required = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
  const missing = required.filter((key) => !config[key]);

  if (missing.length > 0) {
    const message = `Missing required env vars: ${missing.join(', ')}`;
    if (isProd) {
      throw new Error(message);
    }
    logger.warn(
      `${message} — using insecure development fallbacks. Do NOT run this in production.`,
    );
  }

  const insecureSecrets = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'].filter(
    (key) => typeof config[key] === 'string' && (config[key] as string).length < 16,
  );
  if (isProd && insecureSecrets.length > 0) {
    throw new Error(`Weak secrets (min 16 chars) in production: ${insecureSecrets.join(', ')}`);
  }

  return config;
}
