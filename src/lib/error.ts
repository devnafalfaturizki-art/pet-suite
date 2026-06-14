export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

const SUPABASE_ERROR_MESSAGES: Record<string, string> = {
  '23505': 'This record already exists.',
  '23503': 'Cannot complete: referenced record not found.',
  '42501': 'You do not have permission to perform this action.',
  'PGRST116': 'Record not found.',
  '23514': 'Invalid data: check constraint violation.',
  '22P02': 'Invalid input format.',
  '42P01': 'Database table not found.',
  '42703': 'Database column not found.',
  '57014': 'Request cancelled due to timeout.',
  'PGRST301': 'Row-level security policy violation.',
};

export function handleSupabaseError(error: { code?: string; message: string }): never {
  const message = SUPABASE_ERROR_MESSAGES[error.code ?? ''] ?? error.message;
  throw new AppError(message, error.code ?? 'UNKNOWN', error);
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes('fetch') ||
      msg.includes('network') ||
      msg.includes('failed to fetch') ||
      msg.includes('abort') ||
      msg.includes('timeout')
    );
  }
  return false;
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) return error.message;
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred.';
}
