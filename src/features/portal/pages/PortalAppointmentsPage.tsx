import { useState } from 'react';
import { Card, Button } from '@/components/ui';
import { PageHeader } from '@/components/common/PageHeader';
import { useAuthStore } from '@/stores/auth.store';
import { usePortalAppointments, usePortalCustomerId, useCancelAppointment } from '../portal.hooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import AppointmentStatusBadge from '@/features/appointments/components/AppointmentStatusBadge';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

export default function PortalAppointmentsPage() {
  const user = useAuthStore((state) => state.user);
  const customerIdQuery = usePortalCustomerId(user?.id);
  const appointmentsQuery = usePortalAppointments(customerIdQuery.data ?? undefined);
  const cancelMutation = useCancelAppointment();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useDocumentTitle('My Appointments');

  const handleCancel = (id: string) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };

  const doConfirmCancel = async () => {
    if (!selectedId) return;
    try {
      await cancelMutation.mutateAsync(selectedId);
    } finally {
      setConfirmOpen(false);
      setSelectedId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="My Appointments" description="Review upcoming appointments and visit details." />

      <div className="flex justify-end">
        <Button asChild>
          <a href="/portal/appointments/new">New Appointment</a>
        </Button>
      </div>

      <div className="grid gap-4">
        {appointmentsQuery.data?.length ? (
          appointmentsQuery.data.map((appointment) => (
            <Card key={appointment.id} className="p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm text-slate-500">{new Date(appointment.appointmentDate).toLocaleDateString()}</div>
                  <h2 className="text-lg font-semibold">{appointment.service}</h2>
                  <p className="text-sm text-slate-500">{appointment.startTime} - {appointment.endTime}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-slate-600">{appointment.doctorName ? `Doctor: ${appointment.doctorName}` : 'Doctor not assigned yet'}</div>
                  <AppointmentStatusBadge status={appointment.status as any} />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div />
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => window.location.assign(`/portal/appointments/${appointment.id}`)}>Details</Button>
                  {appointment.status !== 'cancelled' && (
                    <Button variant="destructive" onClick={() => handleCancel(appointment.id)}>Cancel</Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-6 text-slate-600">No upcoming appointments found. Check back later or contact the clinic to book a visit.</Card>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Cancel appointment"
        description="Are you sure you want to cancel this appointment? This action cannot be undone."
        onConfirm={doConfirmCancel}
        isLoading={cancelMutation.isLoading}
        variant="destructive"
      />
    </div>
  );
}
