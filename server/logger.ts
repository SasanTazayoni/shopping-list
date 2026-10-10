const createLogger = () => ({
  error: (message: string) => console.error({ errorMessage: message, timestamp: new Date().toISOString(), logLevel: "error" }),
  warn: (message: string) => console.warn({ warningMessage: message, timestamp: new Date().toISOString(), logLevel: "warn" }),
  info: (message: string) => console.info({ infoMessage: message, timestamp: new Date().toISOString(), logLevel: "info" }),
});

export const logger = createLogger();