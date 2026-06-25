import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAccountsStore } from '../../store/accountsStore';
import { countries } from '../../data/countries';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { CountryCard, SupportedCountryCode } from '../../components/ui/CountryCard';

// Self-contained Icon SVGs
const EditIcon = () => (
  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export const Countries: React.FC = () => {
  const { t, direction } = useTheme();
  const { vfsAccounts, activeAccounts, toggleAccountActive, addAccount, editAccount, deleteAccount } = useAccountsStore();

  const [expandedCountryId, setExpandedCountryId] = useState<string | null>('pakistan');

  // Modal State for adding/editing account
  const [showFormModal, setShowFormModal] = useState(false);
  const [currentCountryId, setCurrentCountryId] = useState('');
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [vac, setVac] = useState('');
  const [category, setCategory] = useState('tourist');

  // Sub-applicant form rows
  const [applicants, setApplicants] = useState<{ id: string; firstName: string; lastName: string; passportNumber: string }[]>([
    { id: '1', firstName: '', lastName: '', passportNumber: '' }
  ]);

  const handleToggleCountryExpand = (countryId: string) => {
    setExpandedCountryId(expandedCountryId === countryId ? null : countryId);
  };

  const handleOpenAdd = (countryId: string) => {
    setCurrentCountryId(countryId);
    setEditingAccountId(null);
    setEmail('');
    setPassword('');
    const countryDef = countries.find((c) => c.id === countryId);
    setVac(countryDef?.vacs[0] || '');
    setCategory('tourist');
    setApplicants([{ id: '1', firstName: '', lastName: '', passportNumber: '' }]);
    setShowFormModal(true);
  };

  const handleOpenEdit = (countryId: string, accId: string) => {
    const list = vfsAccounts[countryId] || [];
    const acc = list.find((a) => a.id === accId);
    if (!acc) return;

    setCurrentCountryId(countryId);
    setEditingAccountId(accId);
    setEmail(acc.email);
    setPassword(acc.password || '');
    setVac(acc.vac);
    setCategory(acc.category);
    setApplicants(acc.applicants.length > 0 ? acc.applicants : [{ id: '1', firstName: '', lastName: '', passportNumber: '' }]);
    setShowFormModal(true);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@') || !vac) return;

    // Filter out invalid applicants
    const validApplicants = applicants.filter(
      (ap) => ap.firstName.trim() && ap.lastName.trim() && ap.passportNumber.trim()
    );

    if (validApplicants.length === 0) return;

    const payload = {
      email,
      password,
      vac,
      category,
      applicants: validApplicants
    };

    if (editingAccountId) {
      editAccount(currentCountryId, editingAccountId, payload);
    } else {
      addAccount(currentCountryId, payload);
    }

    setShowFormModal(false);
  };

  const handleAddApplicantRow = () => {
    setApplicants((prev) => [
      ...prev,
      { id: `ap_${Math.random().toString(36).substr(2, 9)}`, firstName: '', lastName: '', passportNumber: '' }
    ]);
  };

  const handleRemoveApplicantRow = (id: string) => {
    if (applicants.length <= 1) return;
    setApplicants((prev) => prev.filter((a) => a.id !== id));
  };

  const handleUpdateApplicantField = (id: string, field: 'firstName' | 'lastName' | 'passportNumber', value: string) => {
    setApplicants((prev) =>
      prev.map((ap) => (ap.id === id ? { ...ap, [field]: value } : ap))
    );
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.4s_ease-out_forwards]">
      
      {/* Intro Header */}
      <div className="text-start">
        <h2 className="text-xl font-bold tracking-tight text-text-primary">
          {t('countries_page.title') || 'Monitored Country Nodes'}
        </h2>
        <p className="text-xs text-text-secondary mt-1">
          Click any country node card to manage configured visa application credentials and candidate profiles.
        </p>
      </div>

      {/* 6 Country Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {countries.map((c) => {
          const list = vfsAccounts[c.id] || [];
          const totalApplicants = list.reduce((sum, item) => sum + item.applicants.length, 0);

          return (
            <CountryCard
              key={c.id}
              countryCode={c.code}
              countryName={t(c.nameKey)}
              active={expandedCountryId === c.id}
              slotsAvailable={totalApplicants}
              lastChecked={list.length > 0 ? `${list.length} Configured` : 'Not Setup'}
              onClick={() => handleToggleCountryExpand(c.id)}
              className={`transform transition-all active:scale-[0.98] ${
                expandedCountryId === c.id 
                  ? 'ring-2 ring-primary-500 border-primary-500 bg-primary-50/10 dark:bg-primary-950/10' 
                  : 'bg-canvas-secondary/20 hover:scale-[1.01]'
              }`}
            />
          );
        })}
      </div>

      {/* Expanded Country Account Configuration Manager */}
      {expandedCountryId && (
        <Card className="border-border-default/60 shadow-lg animate-[fadeIn_0.3s_ease-out_forwards] text-start">
          <CardHeader className="p-6 border-b border-border-default/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-canvas-secondary/20">
            <div>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-text-primary">
                Credentials Setup: {t(countries.find((c) => c.id === expandedCountryId)?.nameKey || '')}
              </CardTitle>
              <CardDescription className="text-xs">
                Portal logins and candidate profile configurations.
              </CardDescription>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenAdd(expandedCountryId)}
              className="text-xs font-semibold bg-primary-500 hover:bg-primary-600 shadow-sm self-start sm:self-auto"
            >
              + {t('accounts.add_account') || 'Add Account'}
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            {(!vfsAccounts[expandedCountryId] || vfsAccounts[expandedCountryId].length === 0) ? (
              <div className="text-center py-10 text-text-muted text-xs font-medium">
                No accounts set up for this destination yet. Click "+ Add Account" to start.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border-default/50 text-text-muted text-[10px] uppercase font-bold tracking-wider text-start">
                      <th className="py-3 px-4 text-start">Portal Username</th>
                      <th className="py-3 px-4 text-start">Visa Center (VAC)</th>
                      <th className="py-3 px-4 text-start">Category</th>
                      <th className="py-3 px-4 text-start">Applicants</th>
                      <th className="py-3 px-4 text-center">Monitoring Status</th>
                      <th className="py-3 px-4 text-end">Operations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vfsAccounts[expandedCountryId].map((acc) => {
                      const isActive = activeAccounts[acc.id] !== false;
                      return (
                        <tr key={acc.id} className="border-b border-border-default/30 hover:bg-canvas-secondary/20 transition-colors">
                          <td className="py-3 px-4 font-semibold text-text-primary">{acc.email}</td>
                          <td className="py-3 px-4 text-text-secondary">{acc.vac}</td>
                          <td className="py-3 px-4 text-text-secondary capitalize">{t(`categories.${acc.category}`)}</td>
                          <td className="py-3 px-4 text-text-secondary font-medium">
                            {acc.applicants.length} Candidates
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => toggleAccountActive(acc.id)}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                isActive ? 'bg-primary-500' : 'bg-canvas-tertiary'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  isActive
                                    ? (direction === 'rtl' ? '-translate-x-4' : 'translate-x-4')
                                    : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </td>
                          <td className="py-3 px-4 text-end">
                            <div className={`flex gap-2.5 justify-end ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                              <button
                                onClick={() => handleOpenEdit(expandedCountryId, acc.id)}
                                className="text-text-muted hover:text-primary-600 transition-colors p-1"
                                title="Edit Credentials"
                              >
                                <EditIcon />
                              </button>
                              <button
                                onClick={() => deleteAccount(expandedCountryId, acc.id)}
                                className="text-text-muted hover:text-danger-500 transition-colors p-1"
                                title="Remove Account"
                              >
                                <TrashIcon />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* FULL COMPONENT ADD / EDIT ACCOUNT MODAL DIALOG */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs select-none">
          <Card className="w-full max-w-xl bg-canvas-base border border-border-default/60 shadow-xl overflow-hidden m-4 flex flex-col max-h-[85vh]">
            <CardHeader className="p-5 border-b border-border-default/50">
              <CardTitle className="text-base font-bold text-text-primary">
                {editingAccountId ? 'Edit Portal Credentials' : 'Add New Country Account Profile'}
              </CardTitle>
              <CardDescription>
                Configure credentials, center destinations, and applicant list details.
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSaveAccount} className="flex-1 flex flex-col min-h-0">
              <div className="p-5 space-y-4 overflow-y-auto flex-1 text-start">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="VFS Account Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@vfs-portal.com"
                    required
                  />

                  <Input
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required={!editingAccountId}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1.5 text-start">
                    <label className="text-xs font-semibold text-text-secondary">
                      Visa Application Center
                    </label>
                    <select
                      value={vac}
                      onChange={(e) => setVac(e.target.value)}
                      className="bg-canvas-secondary border border-border-default rounded-lg text-xs font-semibold text-text-primary px-3 py-2.5 focus:outline-none"
                    >
                      {(countries.find((c) => c.id === currentCountryId) || countries[0]).vacs.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col space-y-1.5 text-start">
                    <label className="text-xs font-semibold text-text-secondary">
                      Visa Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="bg-canvas-secondary border border-border-default rounded-lg text-xs font-semibold text-text-primary px-3 py-2.5 focus:outline-none"
                    >
                      <option value="tourist">Tourist Visa</option>
                      <option value="business">Business Visa</option>
                      <option value="student">Student Visa</option>
                      <option value="family">Family Visit Visa</option>
                    </select>
                  </div>
                </div>

                {/* Sub-Applicants Forms */}
                <div className="pt-3 border-t border-border-default/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-secondary">
                      Applicant Candidate Roster
                    </span>
                    <button
                      type="button"
                      onClick={handleAddApplicantRow}
                      className="text-[10px] font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      + Add Candidate
                    </button>
                  </div>

                  <div className="space-y-2">
                    {applicants.map((ap) => (
                      <div key={ap.id} className="flex gap-2 items-center">
                        <Input
                          placeholder="First Name"
                          value={ap.firstName}
                          onChange={(e) => handleUpdateApplicantField(ap.id, 'firstName', e.target.value)}
                          className="h-8.5 text-xs py-1.5"
                          required
                        />
                        <Input
                          placeholder="Last Name"
                          value={ap.lastName}
                          onChange={(e) => handleUpdateApplicantField(ap.id, 'lastName', e.target.value)}
                          className="h-8.5 text-xs py-1.5"
                          required
                        />
                        <Input
                          placeholder="Passport Number"
                          value={ap.passportNumber}
                          onChange={(e) => handleUpdateApplicantField(ap.id, 'passportNumber', e.target.value)}
                          className="h-8.5 text-xs py-1.5 font-mono uppercase"
                          required
                        />
                        {applicants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveApplicantRow(ap.id)}
                            className="text-[10px] text-danger-500 hover:text-danger-600 p-1.5 shrink-0"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-5 border-t border-border-default/50 bg-canvas-secondary/20 justify-end shrink-0">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowFormModal(false)}
                  type="button"
                  className="h-9 px-4 text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={!email.includes('@')}
                  className="h-9 px-4 text-xs font-semibold bg-primary-500 hover:bg-primary-600 shadow-sm"
                >
                  {editingAccountId ? 'Save Changes' : 'Create Profile'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
