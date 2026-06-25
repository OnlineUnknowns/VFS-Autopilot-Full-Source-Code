import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useOnboardingStore, AccountDetails, Applicant } from '../../store/onboardingStore';
import { countries } from '../../data/countries';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

interface AccountSetupScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export const AccountSetupScreen: React.FC<AccountSetupScreenProps> = ({ onNext, onBack }) => {
  const { t, direction } = useTheme();
  const { selectedCountries, vfsAccounts, saveAccountsForCountry } = useOnboardingStore();
  
  // Keep track of the active target country configuration tab
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const activeCountryId = selectedCountries[activeTabIdx];
  const activeCountryData = countries.find((c) => c.id === activeCountryId);

  // Local state copy of accounts configuration for the active country
  const [localAccounts, setLocalAccounts] = useState<AccountDetails[]>([]);
  // Tracking visible passwords in map: { [accountId]: boolean }
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [formError, setFormError] = useState<string | null>(null);

  // Sync local editor state when shifting tabs or initializing
  useEffect(() => {
    if (activeCountryId) {
      const stored = vfsAccounts[activeCountryId] || [];
      if (stored.length === 0) {
        // Seed initial default account form if empty
        setLocalAccounts([createNewAccount()]);
      } else {
        setLocalAccounts(stored);
      }
      setFormError(null);
    }
  }, [activeCountryId, vfsAccounts]);

  const createNewAccount = (): AccountDetails => ({
    id: `acc_${Math.random().toString(36).substr(2, 9)}`,
    email: '',
    password: '',
    vac: activeCountryData?.vacs[0] || '',
    category: activeCountryData?.visaCategories[0] || 'tourist',
    applicants: [createNewApplicant()],
  });

  const createNewApplicant = (): Applicant => ({
    id: `app_${Math.random().toString(36).substr(2, 9)}`,
    firstName: '',
    lastName: '',
    passportNumber: '',
  });

  // Action: Add account card
  const handleAddAccount = () => {
    setLocalAccounts((prev) => [...prev, createNewAccount()]);
  };

  // Action: Delete account card
  const handleRemoveAccount = (accId: string) => {
    if (localAccounts.length <= 1) {
      setFormError(t('accounts.no_applicants'));
      return;
    }
    setLocalAccounts((prev) => prev.filter((acc) => acc.id !== accId));
    setFormError(null);
  };

  // Action: Update single account property
  const handleUpdateAccount = (accId: string, updates: Partial<AccountDetails>) => {
    setLocalAccounts((prev) =>
      prev.map((acc) => (acc.id === accId ? { ...acc, ...updates } : acc))
    );
  };

  // Action: Add candidate applicant row inside account card
  const handleAddApplicant = (accId: string) => {
    setLocalAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === accId) {
          return {
            ...acc,
            applicants: [...acc.applicants, createNewApplicant()],
          };
        }
        return acc;
      })
    );
  };

  // Action: Remove candidate applicant row inside account card
  const handleRemoveApplicant = (accId: string, appId: string) => {
    setLocalAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === accId) {
          if (acc.applicants.length <= 1) {
            return acc; // Enforce at least one applicant
          }
          return {
            ...acc,
            applicants: acc.applicants.filter((ap) => ap.id !== appId),
          };
        }
        return acc;
      })
    );
  };

  // Action: Update candidate applicant row fields
  const handleUpdateApplicant = (
    accId: string,
    appId: string,
    field: keyof Omit<Applicant, 'id'>,
    value: string
  ) => {
    setLocalAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === accId) {
          return {
            ...acc,
            applicants: acc.applicants.map((ap) =>
              ap.id === appId ? { ...ap, [field]: value } : ap
            ),
          };
        }
        return acc;
      })
    );
  };

  const togglePasswordVisibility = (accId: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [accId]: !prev[accId] }));
  };

  // Validates current local account definitions
  const validateForm = (): boolean => {
    for (const acc of localAccounts) {
      if (!acc.email || !acc.email.includes('@')) return false;
      if (!acc.password || acc.password.length < 4) return false;
      if (!acc.vac || !acc.category) return false;
      if (acc.applicants.length === 0) return false;
      for (const ap of acc.applicants) {
        if (!ap.firstName || !ap.lastName || !ap.passportNumber) return false;
      }
    }
    return true;
  };

  const handleNextTabOrStep = () => {
    setFormError(null);
    if (!validateForm()) {
      setFormError(t('accounts.validation_error'));
      return;
    }

    // Persist current editor tab configurations to global Zustand store
    saveAccountsForCountry(activeCountryId, localAccounts);

    if (activeTabIdx < selectedCountries.length - 1) {
      // Advance to next target country configuration tab
      setActiveTabIdx((prev) => prev + 1);
    } else {
      // All selected countries configured, proceed to Step 5
      onNext();
    }
  };

  const handlePreviousTabOrStep = () => {
    if (activeTabIdx > 0) {
      setActiveTabIdx((prev) => prev - 1);
    } else {
      onBack();
    }
  };

  if (!activeCountryData) return null;

  return (
    <div className="flex flex-col justify-between h-full max-w-4xl mx-auto py-4 px-2">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">
            {t('accounts.title')}
          </h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            {t('accounts.description')}
          </p>
        </div>

        {/* Selected target countries tab headers */}
        <div className="flex border-b border-border-default overflow-x-auto gap-2 pb-px scrollbar-thin">
          {selectedCountries.map((id, index) => {
            const countryDef = countries.find((c) => c.id === id);
            const isActive = index === activeTabIdx;
            const hasData = vfsAccounts[id] && vfsAccounts[id].length > 0;
            return (
              <button
                key={id}
                onClick={() => {
                  if (validateForm()) {
                    saveAccountsForCountry(activeCountryId, localAccounts);
                    setActiveTabIdx(index);
                  } else {
                    setFormError(t('accounts.validation_error'));
                  }
                }}
                className={`py-2.5 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-text-muted hover:text-text-primary'
                }`}
              >
                <span className="me-1.5">{countryDef?.flag}</span>
                <span>{countryDef ? t(countryDef.nameKey) : ''}</span>
                {hasData && (
                  <span className="ms-1.5 h-1.5 w-1.5 rounded-full bg-primary-500 inline-block align-middle" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab configuration header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-text-primary">
            {t('accounts.country_setup', { country: t(activeCountryData.nameKey) })}
          </h3>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleAddAccount}
            className="text-xs py-1.5 h-8 font-semibold border-primary-500/20 text-primary-600 dark:text-primary-400 hover:bg-primary-500/5 hover:border-primary-500"
          >
            + {t('accounts.add_account')}
          </Button>
        </div>

        {formError && (
          <div className="bg-danger-50 border border-danger-100 rounded-xl p-3 text-xs text-danger-700 text-start dark:bg-danger-950/20 dark:border-danger-900/30">
            {formError}
          </div>
        )}

        {/* Accounts Form Loop */}
        <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-1">
          {localAccounts.map((acc, accIndex) => (
            <Card key={acc.id} className="relative border-border-default bg-canvas-secondary/20 shadow-none">
              
              {/* Card close action */}
              {localAccounts.length > 1 && (
                <button
                  onClick={() => handleRemoveAccount(acc.id)}
                  className={`absolute top-4 ${direction === 'rtl' ? 'left-4' : 'right-4'} text-text-muted hover:text-danger-500 transition-colors`}
                  title={direction === 'rtl' ? 'حذف الحساب' : 'Remove account profile'}
                >
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}

              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Email Credentials */}
                  <Input
                    label={t('common.email')}
                    type="email"
                    value={acc.email}
                    onChange={(e) => handleUpdateAccount(acc.id, { email: e.target.value })}
                    placeholder="example@vfs-portal.com"
                    required
                  />

                  {/* Password Credentials */}
                  <Input
                    label={t('common.password')}
                    type={visiblePasswords[acc.id] ? 'text' : 'password'}
                    value={acc.password}
                    onChange={(e) => handleUpdateAccount(acc.id, { password: e.target.value })}
                    placeholder="••••••••"
                    required
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(acc.id)}
                        className="text-text-muted hover:text-text-primary focus:outline-none transition-colors"
                      >
                        {visiblePasswords[acc.id] ? (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Center Selector */}
                  <div className="flex flex-col space-y-1.5 text-start">
                    <label className="text-xs font-semibold text-text-secondary select-none">
                      {t('accounts.vac_label')}
                    </label>
                    <select
                      value={acc.vac}
                      onChange={(e) => handleUpdateAccount(acc.id, { vac: e.target.value })}
                      className="w-full bg-canvas-secondary border border-border-default rounded-lg text-sm text-text-primary px-3.5 py-2.5 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                    >
                      {activeCountryData.vacs.map((vac) => (
                        <option key={vac} value={vac}>
                          {vac}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Visa Category selector */}
                  <div className="flex flex-col space-y-1.5 text-start">
                    <label className="text-xs font-semibold text-text-secondary select-none">
                      {t('accounts.category_label')}
                    </label>
                    <select
                      value={acc.category}
                      onChange={(e) => handleUpdateAccount(acc.id, { category: e.target.value })}
                      className="w-full bg-canvas-secondary border border-border-default rounded-lg text-sm text-text-primary px-3.5 py-2.5 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                    >
                      {activeCountryData.visaCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {t(`categories.${cat}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Sub-Applicants candidate form rows */}
                <div className="pt-3 border-t border-border-default/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-secondary">
                      {t('accounts.add_applicant')}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddApplicant(acc.id)}
                      className="text-[10px] font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      + {t('accounts.add_applicant')}
                    </button>
                  </div>

                  <div className="space-y-2">
                    {acc.applicants.map((ap, apIdx) => (
                      <div key={ap.id} className="flex gap-2 items-center">
                        <Input
                          placeholder={t('accounts.firstname')}
                          value={ap.firstName}
                          onChange={(e) =>
                            handleUpdateApplicant(acc.id, ap.id, 'firstName', e.target.value)
                          }
                          className="h-8.5 text-xs py-1.5"
                          required
                        />
                        <Input
                          placeholder={t('accounts.lastname')}
                          value={ap.lastName}
                          onChange={(e) =>
                            handleUpdateApplicant(acc.id, ap.id, 'lastName', e.target.value)
                          }
                          className="h-8.5 text-xs py-1.5"
                          required
                        />
                        <Input
                          placeholder={t('accounts.passport')}
                          value={ap.passportNumber}
                          onChange={(e) =>
                            handleUpdateApplicant(acc.id, ap.id, 'passportNumber', e.target.value)
                          }
                          className="h-8.5 text-xs py-1.5 font-mono uppercase"
                          required
                        />
                        {acc.applicants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveApplicant(acc.id, ap.id)}
                            className="text-[10px] font-semibold text-danger-500 hover:text-danger-600 p-1 shrink-0"
                            title={t('accounts.remove_applicant')}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex gap-4 mt-8 border-t border-border-default/50 pt-6">
        <Button
          variant="secondary"
          onClick={handlePreviousTabOrStep}
          className="flex-1"
        >
          {t('common.back')}
        </Button>
        
        <Button
          variant="primary"
          onClick={handleNextTabOrStep}
          className="flex-1 bg-primary-500 hover:bg-primary-600"
        >
          {activeTabIdx < selectedCountries.length - 1 ? t('common.next') : t('common.next')}
        </Button>
      </div>
    </div>
  );
};
