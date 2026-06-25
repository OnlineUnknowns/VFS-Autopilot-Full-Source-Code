import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useSearchesStore, SearchItem } from '../../store/searchesStore';
import { useAccountsStore } from '../../store/accountsStore';
import { useNotificationsStore } from '../../store/notificationsStore';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { countries } from '../../data/countries';

// Self-contained high-fidelity icons
const SearchIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const CalendarIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const UserIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const TrendingIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

export const DashboardHome: React.FC = () => {
  const { t, direction } = useTheme();
  const navigate = useNavigate();

  const { searches, toggleSearch, pauseAll, resumeAll, removeSearch, addSearch } = useSearchesStore();
  const { vfsAccounts } = useAccountsStore();
  const { logs } = useNotificationsStore();

  // Dialog state for adding a search
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newCountryId, setNewCountryId] = useState('pakistan');
  const [newVac, setNewVac] = useState('');
  const [newCategory, setNewCategory] = useState('tourist');

  const activeSearchesCount = searches.filter((s) => s.status === 'Searching').length;
  const totalFound = searches.reduce((sum, s) => sum + s.slotsFound, 0);
  
  // Total accounts count
  const totalAccounts = Object.values(vfsAccounts).reduce((sum, list) => sum + list.length, 0);

  // Are all searches paused?
  const allPaused = searches.every((s) => s.status === 'Paused');

  const handleToggleAll = () => {
    if (allPaused) {
      resumeAll();
    } else {
      pauseAll();
    }
  };

  const handleOpenAddModal = () => {
    // Seed default fields from selected country
    const firstCountry = countries.find((c) => c.id === newCountryId) || countries[0];
    setNewVac(firstCountry.vacs[0]);
    setShowAddModal(true);
  };

  const handleCountryChange = (cId: string) => {
    setNewCountryId(cId);
    const countryDef = countries.find((c) => c.id === cId);
    if (countryDef) {
      setNewVac(countryDef.vacs[0]);
    }
  };

  const handleSaveSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@') || !newVac) return;

    const countryDef = countries.find((c) => c.id === newCountryId);
    if (!countryDef) return;

    addSearch({
      email: newEmail,
      countryId: newCountryId,
      countryCode: countryDef.code,
      vac: newVac,
      category: newCategory
    });

    // Reset Form
    setNewEmail('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.4s_ease-out_forwards]">
      
      {/* HEADER SECTION: WELCOME & QUICK ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-start">
          <h2 className="text-xl font-bold tracking-tight text-text-primary">
            {t('dashboard.welcome_msg') || 'System Overview'}
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Real-time visual monitoring dashboard for background booking logs.
          </p>
        </div>

        {/* Action Toggles */}
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleToggleAll}
            className="text-xs h-9 font-semibold"
          >
            {allPaused ? t('dashboard.resume_all') || 'Resume All' : t('dashboard.pause_all') || 'Pause All'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAddModal}
            className="text-xs h-9 font-semibold bg-primary-500 hover:bg-primary-600 shadow-sm"
          >
            + {t('dashboard.add_account') || 'Add Account'}
          </Button>
        </div>
      </div>

      {/* TOP STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Searches */}
        <Card className="border-border-default/60 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center shrink-0">
              <SearchIcon className="h-5 w-5" />
            </div>
            <div className="text-start">
              <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted">
                {t('dashboard.active_searches') || 'Active Searches'}
              </span>
              <h3 className="text-2xl font-bold text-text-primary tracking-tight mt-0.5">
                {activeSearchesCount}
              </h3>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Appointments Found */}
        <Card className="border-border-default/60 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
              totalFound > 0 ? 'bg-primary-500 text-white animate-pulse' : 'bg-canvas-tertiary text-text-secondary'
            }`}>
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div className="text-start">
              <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted">
                {t('dashboard.appointments_found') || 'Appointments Found'}
              </span>
              <h3 className="text-2xl font-bold text-text-primary tracking-tight mt-0.5">
                {totalFound}
              </h3>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Total Accounts */}
        <Card className="border-border-default/60 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-canvas-tertiary text-text-secondary flex items-center justify-center shrink-0">
              <UserIcon className="h-5 w-5" />
            </div>
            <div className="text-start">
              <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted">
                {t('dashboard.total_accounts') || 'Total Accounts'}
              </span>
              <h3 className="text-2xl font-bold text-text-primary tracking-tight mt-0.5">
                {totalAccounts}
              </h3>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Success Rate */}
        <Card className="border-border-default/60 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center shrink-0">
              <TrendingIcon className="h-5 w-5" />
            </div>
            <div className="text-start">
              <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted">
                {t('dashboard.success_rate') || 'Success Rate (30d)'}
              </span>
              <h3 className="text-2xl font-bold text-text-primary tracking-tight mt-0.5">
                94.6%
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DASHBOARD MIDDLE SECTION: MONITORED GRID & TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Monitored Accounts Search Logs Grid */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-text-primary text-start uppercase tracking-wider">
            {t('dashboard.active_monitors') || 'Monitored Account Queries'}
          </h3>

          {searches.length === 0 ? (
            <Card className="border-dashed border-2 py-12 flex flex-col items-center justify-center bg-canvas-secondary/10">
              <div className="h-14 w-14 rounded-full bg-canvas-tertiary flex items-center justify-center text-text-muted mb-4">
                <SearchIcon className="h-7 w-7" />
              </div>
              <h4 className="text-sm font-bold text-text-primary">
                {t('dashboard.empty_title') || 'No Monitored Queries Active'}
              </h4>
              <p className="text-xs text-text-secondary mt-1 max-w-xs text-center leading-relaxed">
                Add an applicant account profile to begin automated portal checking.
              </p>
              <Button
                variant="primary"
                onClick={handleOpenAddModal}
                className="mt-5 text-xs font-semibold bg-primary-500 hover:bg-primary-600 shadow-sm"
              >
                + Add Account
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searches.map((search) => {
                const countryDef = countries.find((c) => c.id === search.countryId);
                return (
                  <Card 
                    key={search.id} 
                    className={`border-border-default/60 shadow-sm hover:border-text-muted/20 transition-all ${
                      search.status === 'Found' ? 'ring-2 ring-primary-500 bg-primary-50/5 dark:bg-primary-950/5' : ''
                    }`}
                  >
                    <CardContent className="p-4 flex flex-col justify-between h-full space-y-4">
                      {/* Flag + Email header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xl shrink-0" title={countryDef ? t(countryDef.nameKey) : ''}>
                            {countryDef?.flag || '🏳️'}
                          </span>
                          <div className="flex flex-col min-w-0 text-start">
                            <span className="text-xs font-bold text-text-primary truncate">
                              {search.email}
                            </span>
                            <span className="text-[10px] text-text-muted font-medium mt-0.5 truncate">
                              {search.vac}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <Badge status={
                          search.status === 'Searching' ? 'searching' :
                          search.status === 'Found' ? 'found' :
                          search.status === 'Failed' ? 'failed' : 'pending'
                        }>
                          {search.status === 'Searching' ? t('dashboard.searching') || 'Searching' :
                           search.status === 'Found' ? t('dashboard.found') || 'Found' :
                           search.status === 'Failed' ? t('dashboard.failed') || 'Failed' :
                           t('dashboard.paused') || 'Paused'}
                        </Badge>
                      </div>

                      {/* Info & Footer Stats */}
                      <div className="flex items-center justify-between text-[11px] text-text-muted pt-2 border-t border-border-default/50">
                        <div className="text-start">
                          <span>Checked: <strong className="text-text-secondary">{search.lastChecked}</strong></span>
                        </div>
                        {search.slotsFound > 0 && (
                          <div className="text-end">
                            <span className="text-primary-600 dark:text-primary-400 font-bold">
                              ✓ {search.slotsFound} Slots
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Interactive Operations Buttons */}
                      <div className="flex gap-2 pt-1.5 justify-end">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => toggleSearch(search.id)}
                          className="h-8 py-1 px-2.5 text-[11px] font-semibold flex-1"
                        >
                          {search.status === 'Paused' ? 'Resume' : 'Pause'}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => removeSearch(search.id)}
                          className="h-8 py-1 px-2.5 text-[11px] font-semibold border-transparent"
                        >
                          Remove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Timeline Recent Activity log feed */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-text-primary text-start uppercase tracking-wider">
            {t('dashboard.recent_activity') || 'Recent Action Feed'}
          </h3>

          <Card className="border-border-default/60 shadow-sm h-[400px] overflow-hidden flex flex-col">
            <CardContent className="p-4 overflow-y-auto flex-1 scrollbar-thin">
              {logs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-text-muted text-xs">
                  No activities recorded yet.
                </div>
              ) : (
                <div className="relative border-s border-border-default ml-2.5 pl-4 py-2 space-y-5 text-start">
                  {logs.slice(0, 5).map((log) => (
                    <div key={log.id} className="relative group">
                      {/* Timeline dot */}
                      <div className={`absolute -left-[21px] mt-1 h-2.5 w-2.5 rounded-full border-2 border-canvas-base shadow-sm ${
                        log.type === 'success' ? 'bg-primary-500' :
                        log.type === 'error' ? 'bg-danger-500' : 'bg-text-muted'
                      }`} />
                      <div className="flex flex-col">
                        <p className="text-[11px] leading-relaxed text-text-primary font-medium">
                          {log.message}
                        </p>
                        <span className="text-[9px] text-text-muted mt-1 font-semibold">
                          {log.timestamp} • {log.channel.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* QUICK INLINE ADD MONITOR MODAL DIALOG */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs select-none">
          <Card className="w-full max-w-md bg-canvas-base border border-border-default/60 shadow-xl overflow-hidden m-4">
            <CardHeader className="p-5 border-b border-border-default/50">
              <CardTitle className="text-base font-bold text-text-primary">
                Add New Search Query Monitor
              </CardTitle>
              <CardDescription>
                Configure credentials and VAC locations to begin monitoring.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSaveSearch}>
              <CardContent className="p-5 space-y-4">
                <Input
                  label="VFS Account Email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="operator_login@vfs-portal.com"
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1.5 text-start">
                    <label className="text-xs font-semibold text-text-secondary select-none">
                      Target Country
                    </label>
                    <select
                      value={newCountryId}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      className="bg-canvas-secondary border border-border-default rounded-lg text-xs font-semibold text-text-primary px-3 py-2.5 focus:outline-none"
                    >
                      {countries.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.flag} {t(c.nameKey)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col space-y-1.5 text-start">
                    <label className="text-xs font-semibold text-text-secondary select-none">
                      Visa Category
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="bg-canvas-secondary border border-border-default rounded-lg text-xs font-semibold text-text-primary px-3 py-2.5 focus:outline-none"
                    >
                      <option value="tourist">Tourist Visa</option>
                      <option value="business">Business Visa</option>
                      <option value="student">Student Visa</option>
                      <option value="family">Family Visit Visa</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col space-y-1.5 text-start">
                  <label className="text-xs font-semibold text-text-secondary select-none">
                    Visa Application Center (VAC)
                  </label>
                  <select
                    value={newVac}
                    onChange={(e) => setNewVac(e.target.value)}
                    className="bg-canvas-secondary border border-border-default rounded-lg text-xs font-semibold text-text-primary px-3 py-2.5 focus:outline-none"
                  >
                    {(countries.find((c) => c.id === newCountryId) || countries[0]).vacs.map((vac) => (
                      <option key={vac} value={vac}>
                        {vac}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
              
              <div className="flex items-center gap-3 p-5 border-t border-border-default/50 bg-canvas-secondary/20 justify-end">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                  type="button"
                  className="h-9 px-4 text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={!newEmail.includes('@')}
                  className="h-9 px-4 text-xs font-semibold bg-primary-500 hover:bg-primary-600 shadow-sm"
                >
                  Start Search
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
