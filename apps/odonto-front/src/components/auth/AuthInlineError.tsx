import { AlertCircle } from 'lucide-react';

interface AuthInlineErrorProps {
  message: string | null;
}

export function AuthInlineError({ message }: AuthInlineErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <div className="animate-in fade-in slide-in-from-top-2 mb-6 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-red-600 shadow-sm duration-300">
      <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
      <p className="text-sm leading-normal font-medium">{message}</p>
    </div>
  );
}
