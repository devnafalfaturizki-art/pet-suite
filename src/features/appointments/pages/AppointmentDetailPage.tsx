import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock3, Activity, XCircle, FileText, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui';
import { PageHeader } from '@/components/common/PageHeader';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useAppointment, useUpdateAppointmentStatus } from '../appointments.hooks';
import AppointmentStatusBadge from '../components/AppointmentStatusBadge';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useToast } from '@/hooks/useToast';

const actionMap = {
  scheduled: [
    { status: 'confirmed', label: 'Confirm appointment', description: 'Mark this appointment as confirmed and ready for check-in.', variant: 'default' },
    { status: 'cancelled', label: 'Cancel appointment', description: 'Cancel the appointment and notify the patient.', variant: 'danger' }
  ],
  confirmed: [
    { status: 'checked_in', label: 'Check in patient', description: 'Record that the patient has checked in for their appointment.', variant: 'default' },
    { status: 'cancelled', label: 'Cancel appointment', description: 'Cancel the appointment and remove it from the schedule.', variant: 'danger' }
  ],
  checked_in: [
    { status: 'in_consultation', label: 'Start consultation', description: 'Move the appointment into consultation status.', variant: 'default' },
    { status: 'cancelled', label: 'Cancel appointment', description: 'Cancel the appointment before consultation.', variant: 'danger' }
  ],
  in_consultation: [
    { status: 'completed', label: 'Complete appointment', description: 'Complete the appointment and generate a draft invoice if needed.', variant: 'default' }
  ],
  completed: [],
  cancelled: []
};

export default function AppointmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data, isLoading } = useAppointment(id);
  const mutation = useUpdateAppointmentStatus();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [dialogText, setDialogText] = useState({ title: '', description: '' });

  useDocumentTitle(data ? `Appointment • ${data.service}` : 'Appointment');

  const availableActions = useMemo(() => {
    if (!data) return [];
    return actionMap[data.status] ?? [];
  }, [data]);

  const scheduledDate = useMemo(() => {
    if (!data) return '';
    const date = new Date(`${data.appointmentDate}T${data.startTime}`);
    const endDate = new Date(`${data.appointmentDate}T${data.endTime}`);
    return `${date.toLocaleString()} – ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }, [data]);

  if (isLoading) {
    return <div className="p-6">Loading appointment...</div>;
  }

  if (!data) {
    return <div className="p-6">Appointment not found.</div>;
  }

  function openConfirmation(status: string, title: string, description: string) {
    setPendingStatus(status);
    setDialogText({ title, description });
    setConfirmOpen(true);
  }

  async function handleConfirm() {
    if (!id || !pendingStatus) return;
    setConfirmOpen(false);

    try {
      await mutation.mutateAsync({ id, status: pendingStatus });
      toast.success(`Appointment updated to ${pendingStatus.replace('_', ' ')}`);
    } catch (error: any) {
      toast.error(error?.message ?? 'Failed to update appointment status');
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="text-sm text-slate-500">Appointment details</div>
          <h1 className="text-3xl font-semibold text-slate-900">{data.service}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <AppointmentStatusBadge status={data.status} />
            {data.queueNumber && <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">Queue {data.queueNumber}</span>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate('/staff/appointments')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to appointments
          </Button>
          <Button variant="outline" onClick={() => navigate(`/staff/appointments/${id}/edit`)} disabled>
            <ClipboardList className="w-4 h-4 mr-2" /> Edit
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.85fr]">
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">Patient</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{data.customerName || data.customerId}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Pet</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{data.petName || data.petId}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Doctor</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{data.doctorName || 'Unassigned'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Schedule</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{scheduledDate}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Clock3 className="w-4 h-4" />
                <span>Appointment details</span>
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div>
                  <p className="text-slate-500">Status</p>
                  <p className="font-medium text-slate-900 capitalize">{data.status.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-slate-500">Service</p>
                  <p className="font-medium text-slate-900">{data.service}</p>
                </div>
                <div>
                  <p className="text-slate-500">Notes</p>
                  <p className="font-medium text-slate-900">{data.notes || 'No notes added'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <FileText className="w-4 h-4" />
                <span>Appointment workflow</span>
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p>
                  {data.status === 'completed'
                    ? 'A draft invoice will be created automatically when this appointment is completed.'
                    : 'Use the buttons below to move the appointment through check-in, consultation, and completion.'}
                </p>
                {data.status === 'completed' && (
                  <p className="rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-700">
                    Completed appointments are ready for medical record creation and billing.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Appointment notes</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{data.notes || 'No additional notes have been provided for this appointment.'}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Actions</h2>
                <p className="text-sm text-slate-500">Update appointment status safely.</p>
              </div>
            </div>
            <div className="mt-4 grid gap-3">
              {availableActions.length === 0 ? (
                <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">No actions available for the current status.</div>
              ) : (
                availableActions.map((action) => (
                  <Button
                    key={action.status}
                    onClick={() => openConfirmation(action.status, action.label, action.description)}
                    variant={action.variant === 'danger' ? 'destructive' : 'default'}
                    disabled={mutation.isLoading}
                  >
                    {action.label}
                  </Button>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600 shadow-sm">
            <div className="flex items-center gap-2 text-slate-700">
              <Activity className="w-4 h-4" />
              <span>Quick summary</span>
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl bg-white p-4 text-sm text-slate-700">
                <p className="text-slate-500">Patient</p>
                <p className="font-medium text-slate-900">{data.customerName || data.customerId}</p>
              </div>
              <div className="rounded-2xl bg-white p-4 text-sm text-slate-700">
                <p className="text-slate-500">Pet</p>
                <p className="font-medium text-slate-900">{data.petName || data.petId}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={dialogText.title}
        description={dialogText.description}
        onConfirm={handleConfirm}
        isLoading={mutation.isLoading}
        variant={pendingStatus === 'cancelled' ? 'danger' : 'default'}
      />
    </div>
  );
}
