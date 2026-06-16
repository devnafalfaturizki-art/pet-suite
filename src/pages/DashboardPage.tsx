import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Card, Badge, Button, Skeleton } from '@/components/ui';
import { useAuthStore } from '@/stores/auth.store';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { useOwnerStats, useWeeklyRevenue, useAppointmentBreakdown, useRecentTransactions, useLowStockItems, useDoctorStats, useStaffStats } from '@/features/dashboard/dashboard.hooks';
import { usePortalCustomer, usePortalCustomerId, usePortalInvoices, usePortalAppointments, usePortalSummary } from '@/features/portal/portal.hooks';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { TrendingUp, CalendarDays, HeartPulse, ShieldCheck, AlertTriangle, Stethoscope, Users, Clock, ArrowRight, Syringe, ClipboardList, Plus, Search, ShoppingCart, Wallet } from 'lucide-react';

function SectionSkeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, idx) => (
        <Skeleton key={idx} width="100%" height="1.25rem" />
      ))}
    </div>
  );
}

function StatCard({ title, value, description, icon: Icon, gradient, glowClass, isLoading, onClick }: {
  title: string;
  value: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  gradient?: string;
  glowClass?: string;
  isLoading?: boolean;
  onClick?: () => void;
}) {
  return (
    <Card
      className={cn(
        'relative overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg animate-slide-up',
        glowClass,
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      {Icon && (
        <div className={cn('relative mb-4 flex h-11 w-11 items-center justify-center rounded-xl shadow-lg', gradient ?? 'bg-gradient-to-br from-blue-500 to-blue-600')}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      )}
      <div className="relative">
        <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</div>
        {isLoading
          ? <Skeleton className="mt-2 h-9 w-24" />
          : <div className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{value}</div>
        }
        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">{description}</p>
      </div>
    </Card>
  );
}

function StatusPill({ status }: { status: string }) {
  const variantMap: Record<string, 'emerald' | 'amber' | 'rose' | 'slate' | 'blue'> = {
    paid: 'emerald',
    completed: 'emerald',
    scheduled: 'blue',
    confirmed: 'blue',
    pending: 'amber',
    cancelled: 'rose',
    'no-show': 'rose',
    'in-progress': 'amber',
    admitted: 'blue',
    discharged: 'emerald'
  };
  const variant = variantMap[status] ?? 'slate';
  return <Badge variant={variant}>{status}</Badge>;
}

function QuickActionButton({ icon: Icon, label, onClick, variant = 'default' }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'primary';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200',
        variant === 'primary'
          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const statsQuery = useOwnerStats();
  const revenueQuery = useWeeklyRevenue();
  const breakdownQuery = useAppointmentBreakdown(new Date().getMonth() + 1, new Date().getFullYear());
  const transactionQuery = useRecentTransactions();
  const lowStockQuery = useLowStockItems();

  const stats = statsQuery.data;
  const weeklyRevenue = revenueQuery.data || [];
  const recentInvoices = transactionQuery.data || [];
  const lowStockItems = lowStockQuery.data || [];
  const breakdown = breakdownQuery.data || [];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <QuickActionButton icon={Plus} label="New Appointment" onClick={() => navigate('/staff/appointments/create')} variant="primary" />
        <QuickActionButton icon={Users} label="Add Customer" onClick={() => navigate('/staff/customers/create')} />
        <QuickActionButton icon={ClipboardList} label="View Reports" onClick={() => navigate('/staff/reports/financial')} />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Revenue today" value={formatCurrency(stats?.revenueToday ?? 0)} description="Paid invoice revenue captured so far today." icon={TrendingUp} gradient="bg-gradient-to-br from-blue-500 to-blue-600" glowClass="glow" isLoading={statsQuery.isLoading} />
        <StatCard title="Appointments today" value={String(stats?.appointmentsToday ?? 0)} description="Scheduled patient visits for today." icon={CalendarDays} gradient="bg-gradient-to-br from-violet-500 to-violet-600" glowClass="glow-violet" isLoading={statsQuery.isLoading} />
        <StatCard title="Active inpatients" value={String(stats?.activeInpatients ?? 0)} description="Pets currently admitted in inpatient care." icon={HeartPulse} gradient="bg-gradient-to-br from-amber-500 to-amber-600" glowClass="glow-amber" isLoading={statsQuery.isLoading} />
        <StatCard title="Pending vaccinations" value={String(stats?.pendingVaccinations ?? 0)} description="Vaccination reminders due soon." icon={ShieldCheck} gradient="bg-gradient-to-br from-emerald-500 to-emerald-600" glowClass="glow-emerald" isLoading={statsQuery.isLoading} />
        <StatCard title="Low stock alerts" value={String(stats?.lowStockCount ?? 0)} description="Items at or below minimum stock levels." icon={AlertTriangle} gradient="bg-gradient-to-br from-rose-500 to-rose-600" glowClass="glow-rose" isLoading={statsQuery.isLoading} />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card className="p-6 glass-card">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Weekly revenue</p>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Last 7 days</h2>
            </div>
            <Badge variant="blue">Revenue</Badge>
          </div>
          <div className="mt-6 h-72">
            {revenueQuery.isLoading ? (
              <SectionSkeleton lines={6} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyRevenue} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(value) => formatCurrency(Number(value))} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #1e293b',
                      borderRadius: '0.75rem',
                      color: '#f1f5f9',
                      fontSize: '0.875rem',
                      boxShadow: '0 10px 40px -10px rgba(0,0,0,0.3)'
                    }}
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Line type="monotone" dataKey="amount" stroke="url(#revenueGradient)" strokeWidth={3} dot={false} fill="url(#revenueGradient)" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="space-y-4 p-6 glass-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Appointment status</p>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">This month</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => breakdownQuery.refetch()}>
              Refresh
            </Button>
          </div>
          {breakdownQuery.isLoading ? (
            <SectionSkeleton />
          ) : (
            <div className="space-y-2">
              {breakdown.map((item) => (
                <div key={item.status} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-slate-700 transition-colors hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                  <span className="font-medium capitalize">{item.status}</span>
                  <span className="font-semibold">{item.count}</span>
                </div>
              ))}
              {!breakdown.length && <p className="text-sm text-slate-500 dark:text-slate-400">No appointment activity recorded yet.</p>}
            </div>
          )}
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Recent invoices</p>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Latest transactions</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/staff/invoices')}>
              <ArrowRight className="mr-1 h-3 w-3" />
              View all
            </Button>
          </div>
          <div className="mt-6">
            <DataTable
              columns={[
                { key: 'invoiceNumber', header: 'Invoice' },
                { key: 'customerName', header: 'Customer' },
                { key: 'total', header: 'Total', render: (row: any) => formatCurrency(row.total) },
                { key: 'status', header: 'Status', render: (row: any) => <StatusPill status={row.status} /> },
                { key: 'createdAt', header: 'Date', render: (row: any) => formatDate(row.createdAt, { day: 'numeric', month: 'short' }) }
              ]}
              data={recentInvoices}
              isLoading={transactionQuery.isLoading}
              emptyTitle="No invoice history"
              emptyDescription="Recent transactions will appear here once invoices are created."
            />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Low stock</p>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Inventory alerts</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/staff/inventory')}>
              <ArrowRight className="mr-1 h-3 w-3" />
              View all
            </Button>
          </div>
          {lowStockQuery.isLoading ? (
            <div className="mt-6">
              <SectionSkeleton />
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {lowStockItems.length ? (
                lowStockItems.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Minimum {item.minStock} / available {item.currentStock}</p>
                      </div>
                      <Badge variant={item.currentStock <= item.minStock ? 'rose' : 'amber'}>{item.currentStock <= item.minStock ? 'Critical' : 'Low'}</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">All tracked inventory levels are healthy.</p>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function DoctorDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const doctorQuery = useDoctorStats(user?.id);
  const doctorStats = doctorQuery.data;
  const appointmentRows = doctorStats?.todayAppointments || [];
  const recordRows = doctorStats?.recentMedicalRecords || [];

  // Separate waiting vs scheduled
  const waitingPatients = appointmentRows.filter((a) => a.status === 'confirmed' || a.status === 'scheduled');
  const inProgressPatients = appointmentRows.filter((a) => a.status === 'in-progress');
  const completedToday = appointmentRows.filter((a) => a.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <QuickActionButton icon={Stethoscope} label="Start Examination" onClick={() => navigate('/doctor/medical-records/create')} variant="primary" />
        <QuickActionButton icon={CalendarDays} label="View Schedule" onClick={() => navigate('/staff/appointments')} />
        <QuickActionButton icon={Syringe} label="Record Vaccination" onClick={() => navigate('/staff/vaccinations/create')} />
        <QuickActionButton icon={Search} label="Find Patient" onClick={() => navigate('/staff/pets')} />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Waiting patients"
          value={String(waitingPatients.length)}
          description="Patients checked in and waiting for you."
          icon={Users}
          gradient="bg-gradient-to-br from-amber-500 to-amber-600"
          glowClass="glow-amber"
          isLoading={doctorQuery.isLoading}
        />
        <StatCard
          title="In consultation"
          value={String(inProgressPatients.length)}
          description="Currently being examined."
          icon={Stethoscope}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          glowClass="glow"
          isLoading={doctorQuery.isLoading}
        />
        <StatCard
          title="Active inpatients"
          value={String(doctorStats?.activeInpatients ?? 0)}
          description="Patients currently in inpatient care."
          icon={HeartPulse}
          gradient="bg-gradient-to-br from-violet-500 to-violet-600"
          glowClass="glow-violet"
          isLoading={doctorQuery.isLoading}
        />
        <StatCard
          title="Completed today"
          value={String(completedToday.length)}
          description="Appointments completed so far."
          icon={ClipboardList}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
          glowClass="glow-emerald"
          isLoading={doctorQuery.isLoading}
        />
      </div>

      {/* Waiting Queue + Today's Schedule */}
      <div className="grid gap-6 xl:grid-cols-[1fr_1.5fr]">
        {/* Waiting Queue */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Patient queue</p>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Waiting patients</h2>
            </div>
            <Badge variant="amber" className="text-xs">{waitingPatients.length} waiting</Badge>
          </div>
          {doctorQuery.isLoading ? (
            <SectionSkeleton />
          ) : waitingPatients.length ? (
            <div className="space-y-2">
              {waitingPatients.map((patient, index) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 transition-all hover:border-blue-200 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{patient.petName ?? 'Unknown pet'}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{patient.service ?? 'General checkup'} · {patient.customerName ?? 'Unknown owner'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-xs text-slate-500">{patient.startTime ?? '--:--'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="mb-2 h-8 w-8 text-slate-300 dark:text-slate-600" />
              <p className="text-sm text-slate-500 dark:text-slate-400">No patients waiting</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Your queue will appear here when patients check in.</p>
            </div>
          )}
        </Card>

        {/* Today's Schedule */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Today's appointments</p>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Appointment schedule</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/staff/appointments')}>
              <ArrowRight className="mr-1 h-3 w-3" />
              View all
            </Button>
          </div>
          <div className="mt-6">
            <DataTable
              columns={[
                { key: 'startTime', header: 'Time', render: (row: any) => row.startTime ?? '--:--' },
                { key: 'service', header: 'Service' },
                { key: 'petName', header: 'Pet' },
                { key: 'customerName', header: 'Owner' },
                { key: 'status', header: 'Status', render: (row: any) => <StatusPill status={row.status} /> }
              ]}
              data={appointmentRows}
              isLoading={doctorQuery.isLoading}
              emptyTitle="No appointments today"
              emptyDescription="Your schedule will appear once appointments are assigned."
            />
          </div>
        </Card>
      </div>

      {/* Recent Medical Records */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Recent medical records</p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Recent notes</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/doctor/medical-records')}>
            <ArrowRight className="mr-1 h-3 w-3" />
            View all
          </Button>
        </div>
        <div className="mt-6 space-y-3">
          {doctorQuery.isLoading ? (
            <SectionSkeleton />
          ) : recordRows.length ? (
            recordRows.map((record) => (
              <div
                key={record.id}
                className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
                onClick={() => navigate(`/doctor/medical-records/${record.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <ClipboardList className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{record.recordType}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{record.petName ?? 'Unknown pet'}</p>
                  </div>
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">{formatDate(record.createdAt, { day: 'numeric', month: 'short' })}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">No recent medical records available.</p>
          )}
        </div>
      </Card>
    </div>
  );
}

function StaffDashboard() {
  const navigate = useNavigate();
  const staffQuery = useStaffStats();
  const stats = staffQuery.data;
  const appointments = stats?.todayAppointments ?? [];
  const lowStock = stats?.lowStockAlerts ?? [];
  const grooming = stats?.todayGrooming ?? [];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <QuickActionButton icon={Plus} label="New Appointment" onClick={() => navigate('/staff/appointments/create')} variant="primary" />
        <QuickActionButton icon={Users} label="Add Customer" onClick={() => navigate('/staff/customers/create')} />
        <QuickActionButton icon={ShoppingCart} label="Open POS" onClick={() => navigate('/staff/pos')} />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Today appointments" value={String(appointments.length)} description="Tasks scheduled for your team today." icon={CalendarDays} isLoading={staffQuery.isLoading} />
        <StatCard title="Grooming today" value={String(grooming.length)} description="Grooming services set for today." icon={HeartPulse} isLoading={staffQuery.isLoading} />
        <StatCard title="Low stock alerts" value={String(lowStock.length)} description="Needed inventory restocks." icon={AlertTriangle} isLoading={staffQuery.isLoading} />
        <Card className="space-y-3 p-6">
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Operational overview</div>
          <p className="text-slate-600 dark:text-slate-300">Keep track of service delivery, stock, and customer appointments.</p>
        </Card>
      </div>

      {/* Schedule + Inventory */}
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Today's schedule</p>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Appointment list</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/staff/appointments')}>
              <ArrowRight className="mr-1 h-3 w-3" />
              View all
            </Button>
          </div>
          <div className="mt-6">
            <DataTable
              columns={[
                { key: 'startTime', header: 'Time', render: (row: any) => row.startTime ?? '-' },
                { key: 'service', header: 'Service' },
                { key: 'petName', header: 'Pet' },
                { key: 'status', header: 'Status', render: (row: any) => <StatusPill status={row.status} /> }
              ]}
              data={appointments}
              isLoading={staffQuery.isLoading}
              emptyTitle="No staff appointments"
              emptyDescription="Your team schedule will populate once appointments are created."
            />
          </div>
        </Card>

        <Card className="p-6">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Inventory alerts</p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Low stock items</h2>
          </div>
          <div className="mt-6 space-y-3">
            {staffQuery.isLoading ? (
              <SectionSkeleton />
            ) : lowStock.length ? (
              lowStock.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{item.currentStock} remaining · min {item.minStock}</p>
                    </div>
                    <Badge variant="amber">Restock</Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Inventory levels look healthy today.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Grooming Schedule */}
      <Card className="p-6">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Grooming schedule</p>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Today's services</h2>
        </div>
        <div className="mt-6 space-y-3">
          {staffQuery.isLoading ? (
            <SectionSkeleton />
          ) : grooming.length ? (
            grooming.map((entry) => (
              <div key={entry.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{entry.service ?? 'Service'}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{entry.petName ?? 'Pet not assigned'}</p>
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{formatDate(entry.scheduledAt, { day: 'numeric', month: 'short' })}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">No grooming appointments scheduled for today.</p>
          )}
        </div>
      </Card>
    </div>
  );
}

function CustomerDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const customerIdQuery = usePortalCustomerId(user?.id);
  const summaryQuery = usePortalSummary(customerIdQuery.data ?? undefined);
  const customerQuery = usePortalCustomer(user?.id);
  const appointmentsQuery = usePortalAppointments(customerIdQuery.data ?? undefined);
  const invoicesQuery = usePortalInvoices(customerIdQuery.data ?? undefined);

  const summary = summaryQuery.data;
  const appointments = appointmentsQuery.data || [];
  const invoices = invoicesQuery.data || [];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Your pets" value={String(summary?.petCount ?? 0)} description="Pets currently registered in your account." icon={HeartPulse} isLoading={summaryQuery.isLoading} />
        <StatCard title="Upcoming visits" value={String(summary?.appointmentCount ?? 0)} description="Future appointments scheduled for you." icon={CalendarDays} isLoading={summaryQuery.isLoading} />
        <StatCard title="Invoices" value={String(summary?.invoiceCount ?? 0)} description="Recent billing records on file." icon={TrendingUp} isLoading={summaryQuery.isLoading} />
        <Card className="space-y-3 p-6">
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Account</div>
          <p className="text-slate-600 dark:text-slate-300">Manage bookings, payment history, and pet records in one place.</p>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Your profile</p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Account details</h2>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Name</p>
              <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{customerQuery.data?.fullName ?? user?.fullName ?? '—'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
              <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{customerQuery.data?.email ?? '—'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">WhatsApp</p>
              <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{customerQuery.data?.whatsapp ?? '—'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
              <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{customerQuery.data?.status ?? '—'}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Upcoming appointments</p>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Your next visits</h2>
            </div>
          </div>
          <div className="mt-6">
            <DataTable
              columns={[
                { key: 'appointmentDate', header: 'Date', render: (row: any) => formatDate(row.appointmentDate, { day: 'numeric', month: 'short' }) },
                { key: 'startTime', header: 'Start', render: (row: any) => row.startTime ?? '-' },
                { key: 'service', header: 'Service' },
                { key: 'status', header: 'Status', render: (row: any) => <StatusPill status={row.status} /> }
              ]}
              data={appointments}
              isLoading={appointmentsQuery.isLoading}
              emptyTitle="No upcoming appointments"
              emptyDescription="Book a visit to see it appear in your dashboard."
            />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Recent invoices</p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Billing history</h2>
          </div>
        </div>
        <div className="mt-6">
          <DataTable
            columns={[
              { key: 'id', header: 'Invoice ID' },
              { key: 'total', header: 'Total', render: (row: any) => formatCurrency(row.total) },
              { key: 'status', header: 'Status', render: (row: any) => <StatusPill status={row.status} /> },
              { key: 'createdAt', header: 'Date', render: (row: any) => formatDate(row.createdAt, { day: 'numeric', month: 'short' }) }
            ]}
            data={invoices}
            isLoading={invoicesQuery.isLoading}
            emptyTitle="No billing records"
            emptyDescription="Invoices will appear here after checkout or service completion."
          />
        </div>
      </Card>
    </div>
  );
}

export function DashboardPage() {
  useDocumentTitle('Dashboard');
  const role = useAuthStore((state) => state.role);

  const dashboardContent = useMemo(() => {
    switch (role) {
      case 'admin':
        return <AdminDashboard />;
      case 'staff':
        return <StaffDashboard />;
      case 'customer':
      default:
        return <CustomerDashboard />;
    }
  }, [role]);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Dashboard" description="Quick access to your PetCare Suite workspace and role-specific insights." />
      {dashboardContent}
    </div>
  );
}