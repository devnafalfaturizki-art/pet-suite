import React, { useMemo, useState } from 'react';
import { Search, CalendarDays, Plus, Filter } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { DataTable } from '@/components/common/DataTable';
import { PageHeader } from '@/components/common/PageHeader';
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { useAppointments, useDoctors } from '../appointments.hooks';
import AppointmentStatusBadge from '../components/AppointmentStatusBadge';
import { usePagination } from '@/hooks/usePagination';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'checked_in', label: 'Checked In' },
  { value: 'in_consultation', label: 'In Consultation' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
];

export default function AppointmentsPage() {
  useDocumentTitle('Appointments');
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const { page, pageSize, onPageChange, setPage } = usePagination({ initialPage: 1, initialPageSize: 20, filterDependencies: [search, status, from, to, doctorId] });

  const { data, isLoading } = useAppointments({
    page,
    pageSize,
    search,
    status: status === 'all' ? undefined : status,
    from: from || undefined,
    to: to || undefined,
    doctorId: doctorId || undefined
  });
  const doctorsQuery = useDoctors('');

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const columns = useMemo(
    () => [
      { key: 'queueNumber', header: 'Queue', width: '120px' },
      { key: 'customerName', header: 'Patient' },
      { key: 'petName', header: 'Pet' },
      { key: 'service', header: 'Service' },
      { key: 'doctorName', header: 'Doctor' },
      {
        key: 'date',
        header: 'Date',
        render: (record: any) => new Date(record.appointmentDate).toLocaleDateString()
      },
      {
        key: 'time',
        header: 'Time',
        render: (record: any) => record.startTime ? record.startTime.replace(':00', '') : ''
      },
      {
        key: 'status',
        header: 'Status',
        render: (record: any) => <AppointmentStatusBadge status={record.status} />
      }
    ],
    []
  );

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Appointments"
        description="Manage patient appointments, filter by doctor, status, and date range."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/staff/appointments/calendar')}>
              <CalendarDays className="w-4 h-4 mr-2" /> Calendar View
            </Button>
            <Button onClick={() => navigate('/staff/appointments/create')}>
              <Plus className="w-4 h-4 mr-2" /> New Appointment
            </Button>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={items}
        isLoading={isLoading}
        pagination={{ page, pageSize, total }}
        onPageChange={onPageChange}
        onRowClick={(record) => navigate(`/staff/appointments/${record.id}`)}
        filtersSlot={
          <div className="grid gap-3 md:grid-cols-5">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <Search className="w-4 h-4 text-slate-500" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search patient or pet"
                className="border-0 px-0 ring-0 focus:ring-0"
              />
            </div>

            <div>
              <label className="sr-only" htmlFor="from-date">From</label>
              <Input id="from-date" type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
            </div>
            <div>
              <label className="sr-only" htmlFor="to-date">To</label>
              <Input id="to-date" type="date" value={to} onChange={(event) => setTo(event.target.value)} />
            </div>

            <Select value={status} onValueChange={(value) => setStatus(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={doctorId} onValueChange={(value) => setDoctorId(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Doctor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Doctors</SelectItem>
                {(doctorsQuery.data || []).map((doctor: any) => (
                  <SelectItem key={doctor.id} value={doctor.id}>{doctor.fullName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
        emptyTitle="No appointments found"
        emptyDescription="Try another date range or filter by doctor or status."
      />
    </div>
  );
}
