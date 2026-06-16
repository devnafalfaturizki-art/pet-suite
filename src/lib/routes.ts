import type { ModuleKey, UserRole } from '@/types';
import { protectedRoutes } from '@/routes/protected';
import { publicRoutes } from '@/routes/public';
import type { LucideIcon } from 'lucide-react';
import {
  Home,
  Users,
  PawPrint,
  CalendarDays,
  Stethoscope,
  ShieldCheck,
  HeartPulse,
  Box,
  Scissors,
  Package,
  ShoppingCart,
  Wallet,
  DollarSign,
  FileText,
  Settings,
  Bell
} from 'lucide-react';

export interface AppRouteItem {
  label: string;
  path: string;
  icon: LucideIcon;
  section: 'operations' | 'commerce' | 'crm' | 'management';
  roles: UserRole[];
  moduleKey?: ModuleKey;
}

const routeMeta: Record<string, { label: string; icon: LucideIcon; section: AppRouteItem['section'] }> = {
  'dashboard': { label: 'Dashboard', icon: Home, section: 'operations' },
  'staff/appointments': { label: 'Appointments', icon: CalendarDays, section: 'operations' },
  'staff/vaccinations': { label: 'Vaccinations', icon: ShieldCheck, section: 'operations' },
  'staff/monitoring': { label: 'Monitoring', icon: HeartPulse, section: 'operations' },
  'staff/inpatient': { label: 'Inpatient', icon: HeartPulse, section: 'operations' },
  'staff/grooming': { label: 'Grooming', icon: Scissors, section: 'operations' },
  'doctor/medical-records': { label: 'Medical Records', icon: Stethoscope, section: 'operations' },
  'staff/pos': { label: 'POS', icon: ShoppingCart, section: 'commerce' },
  'staff/invoices': { label: 'Invoices', icon: Wallet, section: 'commerce' },
  'staff/inventory': { label: 'Inventory', icon: Box, section: 'commerce' },
  'staff/petshop': { label: 'Pet Shop', icon: Package, section: 'commerce' },
  'staff/accounting': { label: 'Accounting', icon: DollarSign, section: 'commerce' },
  'staff/customers': { label: 'Customers', icon: Users, section: 'crm' },
  'staff/pets': { label: 'Pets', icon: PawPrint, section: 'crm' },
  'staff/reports/financial': { label: 'Reports', icon: FileText, section: 'management' },
  'staff/reports/clinical': { label: 'Clinical Reports', icon: FileText, section: 'management' },
  'staff/reports/doctors': { label: 'Doctor Reports', icon: FileText, section: 'management' },
  'staff/reports/inventory': { label: 'Inventory Reports', icon: FileText, section: 'management' },
  'staff/reports/products': { label: 'Product Reports', icon: FileText, section: 'management' },
  'staff/settings/clinic': { label: 'Clinic Settings', icon: Settings, section: 'management' },
  'staff/settings/invoice': { label: 'Invoice Settings', icon: FileText, section: 'management' },
  'staff/settings/hours': { label: 'Business Hours', icon: CalendarDays, section: 'management' },
  'staff/settings/whatsapp': { label: 'WhatsApp', icon: ShieldCheck, section: 'management' },
  'staff/settings/email': { label: 'Email', icon: Wallet, section: 'management' },
  'staff/settings/modules': { label: 'Modules', icon: Box, section: 'management' },
  'staff/settings/audit': { label: 'Audit Log', icon: FileText, section: 'management' },
  'staff/notifications': { label: 'Notifications', icon: Bell, section: 'management' },
  'staff/notifications/templates': { label: 'Templates', icon: FileText, section: 'management' },
  'staff/notifications/broadcast': { label: 'Broadcast', icon: FileText, section: 'management' },
  'profile': { label: 'Profile', icon: Users, section: 'management' },
  'home': { label: 'Home', icon: Home, section: 'crm' },
  'articles': { label: 'Articles', icon: FileText, section: 'crm' },
  'articles/:slug': { label: 'Article', icon: FileText, section: 'crm' },
  'services': { label: 'Services', icon: Stethoscope, section: 'crm' },
  'contact': { label: 'Contact', icon: Users, section: 'crm' },
};

const buildFromRoutes = (items: { path?: string; index?: boolean; roles?: UserRole[]; moduleKey?: ModuleKey }[]) =>
  items
    .filter((p) => p.path)
    .map((p) => {
      const rawKey = p.path!.replace(/^\//, '');
      const meta = routeMeta[rawKey];
      if (!meta) return null;
      const pathWithSlash = p.path!.startsWith('/') ? p.path! : `/${p.path!}`;
      return {
        label: meta.label,
        path: pathWithSlash,
        icon: meta.icon,
        section: meta.section,
        roles: p.roles ?? ['customer'],
        moduleKey: p.moduleKey
      } as AppRouteItem;
    })
    .filter(Boolean) as AppRouteItem[];

const navigationRoutes: AppRouteItem[] = [
  ...buildFromRoutes(protectedRoutes),
  ...buildFromRoutes(publicRoutes as any)
];

export function getNavigationRoutes(role: UserRole | null, modules: Record<ModuleKey, boolean>) {
  return navigationRoutes.filter((route) => {
    const hasRole = route.roles.includes(role ?? 'customer');
    const moduleEnabled = route.moduleKey ? Boolean(modules[route.moduleKey]) : true;
    return hasRole && moduleEnabled;
  });
}

export function getCommandRoutes(role: UserRole | null, modules: Record<ModuleKey, boolean>) {
  return getNavigationRoutes(role, modules);
}