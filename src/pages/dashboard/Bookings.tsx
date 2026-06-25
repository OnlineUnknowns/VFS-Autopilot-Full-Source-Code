import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { countries } from '../../data/countries';

export interface BookingRecord {
  id: string;
  countryId: string;
  countryName: string;
  flag: string;
  email: string;
  vac: string;
  category: string;
  status: 'Searching' | 'Found' | 'Booked' | 'Failed';
  dateFound: string;
  bookingDate: string;
}

const mockBookings: BookingRecord[] = [
  {
    id: 'b_1',
    countryId: 'pakistan',
    countryName: 'Pakistan',
    flag: '🇵🇰',
    email: 'mustafa_vfs@gmail.com',
    vac: 'Islamabad VAC',
    category: 'tourist',
    status: 'Booked',
    dateFound: '2026-06-20 11:34 AM',
    bookingDate: '2026-07-04 09:00 AM'
  },
  {
    id: 'b_2',
    countryId: 'india',
    countryName: 'India',
    flag: '🇮🇳',
    email: 'kumar_vfs@yahoo.com',
    vac: 'Delhi VAC',
    category: 'student',
    status: 'Found',
    dateFound: '2026-06-20 09:12 AM',
    bookingDate: '2026-07-10 11:30 AM'
  },
  {
    id: 'b_3',
    countryId: 'egypt',
    countryName: 'Egypt',
    flag: '🇪🇬',
    email: 'hassan_vfs@gmail.com',
    vac: 'Cairo VAC',
    category: 'family',
    status: 'Failed',
    dateFound: '2026-06-19 02:45 PM',
    bookingDate: '-'
  },
  {
    id: 'b_4',
    countryId: 'morocco',
    countryName: 'Morocco',
    flag: '🇲🇦',
    email: 'amine_vfs@outlook.com',
    vac: 'Rabat VAC',
    category: 'business',
    status: 'Searching',
    dateFound: '-',
    bookingDate: '-'
  },
  {
    id: 'b_5',
    countryId: 'angola',
    countryName: 'Angola',
    flag: '🇦🇴',
    email: 'silva_vfs@gmail.com',
    vac: 'Luanda VAC',
    category: 'tourist',
    status: 'Booked',
    dateFound: '2026-06-15 10:15 AM',
    bookingDate: '2026-06-28 08:30 AM'
  }
];

export const Bookings: React.FC = () => {
  const { t, direction } = useTheme();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Filter bookings list
  const filteredBookings = mockBookings.filter((b) => {
    const matchesSearch = b.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.vac.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = filterCountry === 'all' || b.countryId === filterCountry;
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
    return matchesSearch && matchesCountry && matchesStatus;
  });

  // Full CSV Export Logic
  const handleExportCSV = () => {
    const headers = 'ID,Country,Email,VAC,Category,Status,Date Found,Booking Date\n';
    const rows = filteredBookings.map((b) => 
      `"${b.id}","${b.countryName}","${b.email}","${b.vac}","${b.category}","${b.status}","${b.dateFound}","${b.bookingDate}"`
    ).join('\n');

    const csvContent = headers + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `velix_booking_history_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.4s_ease-out_forwards]">
      
      {/* Intro Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-start">
          <h2 className="text-xl font-bold tracking-tight text-text-primary">
            {t('bookings_page.title') || 'Queue & Booking Log'}
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Browse and query historical slots found, appointments secured, and active automation records.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleExportCSV}
          disabled={filteredBookings.length === 0}
          className="text-xs h-9 font-semibold border-border-default hover:border-text-muted flex items-center gap-1.5 self-start sm:self-auto"
        >
          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>{t('bookings_page.export') || 'Export CSV'}</span>
        </Button>
      </div>

      {/* FILTER CONTROLS BAR */}
      <Card className="border-border-default/60 shadow-sm text-start bg-canvas-secondary/15">
        <CardContent className="p-5 flex flex-col md:flex-row gap-4 items-end">
          {/* Email Search */}
          <div className="flex-1 w-full">
            <Input
              label="Query Email or VAC"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search booking records..."
              className="h-9.5 text-xs py-1.5"
            />
          </div>

          {/* Country Filter */}
          <div className="flex flex-col space-y-1.5 text-start w-full md:w-48 shrink-0">
            <label className="text-xs font-semibold text-text-secondary">
              Country Destination
            </label>
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="bg-canvas-secondary border border-border-default rounded-lg text-xs font-semibold text-text-primary px-3 py-2.5 focus:outline-none"
            >
              <option value="all">All Countries</option>
              {countries.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.flag} {t(c.nameKey)}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex flex-col space-y-1.5 text-start w-full md:w-48 shrink-0">
            <label className="text-xs font-semibold text-text-secondary">
              Process Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-canvas-secondary border border-border-default rounded-lg text-xs font-semibold text-text-primary px-3 py-2.5 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="Searching">Searching</option>
              <option value="Found">Found</option>
              <option value="Booked">Booked</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* HISTORICAL TABLE CONTAINER */}
      <Card className="border-border-default/60 shadow-sm overflow-hidden text-start">
        <CardContent className="p-0">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12 text-text-muted text-xs font-medium">
              No booking records match your query filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border-default/50 bg-canvas-secondary/20 text-text-muted text-[10px] uppercase font-bold tracking-wider">
                    <th className="py-3.5 px-5 text-start">Country</th>
                    <th className="py-3.5 px-5 text-start">portal login</th>
                    <th className="py-3.5 px-5 text-start">Center Destination (VAC)</th>
                    <th className="py-3.5 px-5 text-start">Category</th>
                    <th className="py-3.5 px-5 text-start">Record Status</th>
                    <th className="py-3.5 px-5 text-start">Date Found</th>
                    <th className="py-3.5 px-5 text-start">Appointment Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="border-b border-border-default/30 hover:bg-canvas-secondary/15 transition-colors">
                      <td className="py-3.5 px-5 font-semibold text-text-primary">
                        <span className="me-2">{b.flag}</span>
                        <span>{b.countryName}</span>
                      </td>
                      <td className="py-3.5 px-5 text-text-secondary font-medium">{b.email}</td>
                      <td className="py-3.5 px-5 text-text-secondary">{b.vac}</td>
                      <td className="py-3.5 px-5 text-text-secondary capitalize">{t(`categories.${b.category}`)}</td>
                      <td className="py-3.5 px-5">
                        <Badge status={
                          b.status === 'Searching' ? 'searching' :
                          b.status === 'Found' ? 'found' :
                          b.status === 'Booked' ? 'found' : 'failed'
                        }>
                          {b.status === 'Booked' ? 'Booked' : b.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-5 text-text-muted font-semibold">{b.dateFound}</td>
                      <td className="py-3.5 px-5 text-text-secondary font-bold">{b.bookingDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
