import { useState } from 'react';
import { useAuth } from '@/shared/auth/use-auth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { PawPrint, ShieldCheck, Stethoscope, ShoppingCart, Users, Heart, LogIn } from 'lucide-react';
import type { UserRole } from '@/types';

interface RoleOption {
  role: UserRole;
  label: string;
  description: string;
  icon: typeof ShieldCheck;
  color: string;
}

const ROLES: RoleOption[] = [
  {
    role: 'owner',
    label: 'Owner',
    description: 'Full access — revenue, reports, settings',
    icon: ShieldCheck,
    color: 'from-indigo-500 to-indigo-600',
  },
  {
    role: 'doctor',
    label: 'Doctor',
    description: 'Medical records, examinations, vaccinations',
    icon: Stethoscope,
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    role: 'staff',
    label: 'Receptionist',
    description: 'Appointments, customers, scheduling',
    icon: Users,
    color: 'from-blue-500 to-blue-600',
  },
  {
    role: 'cashier',
    label: 'Cashier',
    description: 'POS, invoices, payments',
    icon: ShoppingCart,
    color: 'from-amber-500 to-amber-600',
  },
  {
    role: 'customer',
    label: 'Customer',
    description: 'Portal — appointments, invoices, pets',
    icon: Heart,
    color: 'from-rose-500 to-rose-600',
  },
];

export function LoginPage() {
  const { demoSignIn, isDemoMode } = useAuth();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useDocumentTitle('Login');

  const handleRoleSelect = async (role: UserRole) => {
    setIsLoading(role);
    setError(null);
    try {
      await demoSignIn({ role });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg mb-4">
            <PawPrint className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            PetCare Suite
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {isDemoMode
              ? 'Select a role to explore the platform'
              : 'Sign in to your account'}
          </p>
        </div>

        {/* Role Cards */}
        <div className="space-y-3">
          {ROLES.map((roleOption) => {
            const Icon = roleOption.icon;
            const isActive = isLoading === roleOption.role;

            return (
              <button
                key={roleOption.role}
                onClick={() => handleRoleSelect(roleOption.role)}
                disabled={isLoading !== null}
                className="w-full flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition-all duration-200 hover:border-indigo-200 hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700"
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${roleOption.color} shadow-sm`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {roleOption.label}
                    </span>
                    {isActive && (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                    )}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    {roleOption.description}
                  </p>
                </div>
                <LogIn className="h-5 w-5 text-slate-300 dark:text-slate-600 shrink-0" />
              </button>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900/30 dark:bg-rose-900/20 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
          {isDemoMode
            ? 'Demo mode — no login required. All data is local.'
            : 'PetCare Suite — Veterinary Clinic Management Platform'}
        </p>
      </div>
    </div>
  );
}