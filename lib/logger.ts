export function logError(context: string, error: unknown, metadata?: Record<string, any>) {
  console.error({
    context,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
    ...metadata,
  })
}
