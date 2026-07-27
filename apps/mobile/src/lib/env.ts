declare const process: { env: Record<string, string | undefined> };

export const getEnvVar = (key: string): string | undefined => {
  try {
    return process.env[key];
  } catch {
    return undefined;
  }
};

export const hasEnvVar = (key: string): boolean => {
  const value = getEnvVar(key);
  return typeof value === 'string' && value.length > 0;
};
