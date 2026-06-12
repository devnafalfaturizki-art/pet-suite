export class AppError extends Error {
  constructor(message: string, public code: string, public context?: unknown) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleSupabaseError(error: { code?: string; message: string }): never {
  const messages: Record<string, string> = {
    '23505': 'This record already exists.',
    '23503': 'Cannot complete: referenced record not found.',
    '42501': 'You do not have permission to perform this action.',
    'PGRST116': 'Record not found.'
  };
  throw new AppError(messages[error.code ?? ''] ?? error.message, error.code ?? 'UNKNOWN', error);
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError && String(error).includes('fetch');
}
