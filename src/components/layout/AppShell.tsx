import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { CommandPalette } from '@/components/common/CommandPalette';
import { PageTransition } from '@/components/common/PageTransition';
import { useUIStore } from '@/stores/ui.store';
import { useModuleStore } from '@/stores/module.store';
import { useAuthStore } from '@/stores/auth.store';
import { getCommandRoutes } from '@/router/routes';
import { useGlobalShortcuts } from '@/shared/hooks/useKeyboardShortcuts';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

const breadcrumbLabelMap: Record<string, string> = {
  dashboard: 'Dashboard',
  staff: 'Staff',
  doctor: 'Doctor',
  customers: 'Customers',
  pets: 'Pets',
  appointments: 'Appointments',
  monitoring: 'Monitoring',
  vaccinations: 'Vaccinations',
  inventory: 'Inventory',
  invoices: 'Invoices',
  'medical-records': 'Medical Records',
  profile: 'Profile',
  pos: 'POS',
  accounting: 'Accounting',
  petshop: 'Pet Shop',
  grooming: 'Grooming',
  inpatient: 'Inpatient',
  reports: 'Reports',
  financial: 'Financial',
  clinical: 'Clinical',
  doctors: 'Doctors',
  products: 'Products',
  settings: 'Settings',
  clinic: 'Clinic',
  invoice: 'Invoice',
  hours: 'Business Hours',
  audit: 'Audit Log',
  whatsapp: 'WhatsApp',
  email: 'Email',
  modules: 'Modules',
  notifications: 'Notifications',
  templates: 'Templates',
  broadcast: 'Broadcast',
  calendar: 'Calendar',
  create: 'Create',
  transactions: 'Transactions',
};

export function AppShell({ children }: { children?: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const setCommandPaletteOpen = useUIStore((state) => state.setCommandPaletteOpen);
  const isPaletteOpen = useUIStore((state) => state.isCommandPaletteOpen);
  const activeTheme = useUIStore((state) => state.activeTheme);
  const isSidebarCollapsed = useUIStore((state) => state.isSidebarCollapsed);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const role = useAuthStore((state) => state.role);
  const fetchModuleStatus = useModuleStore((state) => state.fetchModuleStatus);
  const modules = useModuleStore((state) => state.modules);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Initialize global keyboard shortcuts
  useGlobalShortcuts();

  const path = location.pathname;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', activeTheme === 'dark');
  }, [activeTheme]);

  useEffect(() => {
    fetchModuleStatus().catch(() => {
      console.warn('[AppShell] Failed to fetch module status, using defaults');
    });
  }, [fetchModuleStatus]);

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [path]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setCommandPaletteOpen]);

  const breadcrumbSegments = path
    .split('/')
    .filter(Boolean)
    .map((segment, index, segments) => ({
      label: breadcrumbLabelMap[segment] ?? segment.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
      path: `/${segments.slice(0, index + 1).join('/')}`
    }));

  return (
    <div className={cn(
      'min-h-screen',
      activeTheme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    )}>
      <div className="lg:flex">
        <Sidebar
          activePath={path}
          onNavigate={(route) => {
            navigate(route);
            setIsMobileSidebarOpen(false);
          }}
          isMobileOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />
        <div className={cn(
          'flex min-h-screen flex-1 flex-col transition-all duration-300',
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        )}>
          <Navbar
            onOpenCommand={() => setCommandPaletteOpen(true)}
            onToggleSidebar={() => setIsMobileSidebarOpen((open) => !open)}
          />
          {/* Breadcrumb */}
          <div className="border-b border-slate-200/60 bg-white/80 px-4 py-2.5 text-sm text-slate-500 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-950/80 dark:text-slate-400 lg:px-6">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2">
              {breadcrumbSegments.length ? (
                breadcrumbSegments.map((segment, index) => (
                  <span key={segment.path} className="inline-flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(segment.path)}
                      className="transition-colors hover:text-slate-900 dark:hover:text-slate-100"
                    >
                      {segment.label}
                    </button>
                    {index < breadcrumbSegments.length - 1 && (
                      <ChevronRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" />
                    )}
                  </span>
                ))
              ) : (
                <span>Dashboard</span>
              )}
            </nav>
          </div>
          <main
            data-main-content
            className="flex-1 px-4 py-6 sm:px-6 lg:px-8"
          >
            <PageTransition>
              {children ?? <Outlet />}
            </PageTransition>
          </main>
        </div>
      </div>
      <CommandPalette
        open={isPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        routes={getCommandRoutes(role, modules)}
      />
    </div>
  );
}