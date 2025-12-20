type ProcessEnvRecord = Record<string, string | undefined>;

type MaybeProcess = {
  env?: ProcessEnvRecord;
} | undefined;

const readProcessEnv = (): ProcessEnvRecord | undefined => {
  if (typeof globalThis === 'undefined') {
    return undefined;
  }

  const maybeProcess = (globalThis as Record<string, unknown>).process as MaybeProcess;
  return maybeProcess?.env;
};

export const getEnvVar = (key: string): string | undefined => {
  try {
    return readProcessEnv()?.[key];
  } catch {
    return undefined;
  }
};

export const hasEnvVar = (key: string): boolean => {
  const value = getEnvVar(key);
  return typeof value === 'string' && value.length > 0;
};
