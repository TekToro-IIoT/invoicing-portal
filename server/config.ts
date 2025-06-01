import { logError } from "./logger";

interface Config {
  port: number;
  databaseUrl: string;
  sessionSecret: string;
  nodeEnv: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

function validateEnvironment(): Config {
  const requiredEnvVars = [
    'DATABASE_URL',
    'SESSION_SECRET'
  ];

  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    const errorMessage = `Missing required environment variables: ${missing.join(', ')}`;
    logError(errorMessage);
    throw new Error(errorMessage);
  }

  const nodeEnv = process.env.NODE_ENV || 'development';
  const port = parseInt(process.env.PORT || '5000', 10);
  
  if (isNaN(port)) {
    throw new Error('PORT must be a valid number');
  }

  return {
    port,
    databaseUrl: process.env.DATABASE_URL!,
    sessionSecret: process.env.SESSION_SECRET!,
    nodeEnv,
    isDevelopment: nodeEnv === 'development',
    isProduction: nodeEnv === 'production'
  };
}

export const config = validateEnvironment();