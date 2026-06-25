import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useOnboardingStore } from '../../store/onboardingStore';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { setOnboardingComplete } from '../../lib/secureStorage';
import { countries } from '../../data/countries';

interface CompletionScreenProps {
  onFinish: () => void;
  onBack: () => void;
}

export const CompletionScreen: React.FC<CompletionScreenProps> = ({ onFinish, onBack }) => {
  const { t } = useTheme();
  const { selectedCountries, vfsAccounts, notifications } = useOnboardingStore();
  const [isCompleting, setIsCompleting] = useState(false);

  // Compute stats
  const totalCountriesCount = selectedCountries.length;
  
  const totalAccountsCount = Object.values(vfsAccounts).reduce((sum, list) => {
    return sum + (list?.length || 0);
  }, 0);

  const totalCandidatesCount = Object.values(vfsAccounts).reduce((sum, list) => {
    return sum + list.reduce((accSum, acc) => accSum + (acc.applicants?.length || 0), 0);
  }, 0);

  // Active notification channels count
  const activeChannels = [
    notifications.desktop,
    notifications.sound,
    notifications.telegramEnabled
  ].filter(Boolean).length;

  const handleFinish = async () => {
    setIsCompleting(true);
    try {
      await setOnboardingComplete();
      onFinish();
    } catch (e) {
      console.error('[CompletionScreen] Failed to save onboarding complete status.', e);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="flex flex-col justify-between h-full max-w-2xl mx-auto py-6 px-4 select-none animate-[fadeIn_0.5s_ease-out_forwards]">
      
      {/* Success Logo & Header */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-6 my-auto text-center">
        {/* Animated Checkmark Circle */}
        <div className="relative flex items-center justify-center">
          {/* Pulsing ring backdrop */}
          <div className="absolute h-24 w-24 rounded-full bg-primary-500/10 animate-ping" />
          <div className="absolute h-20 w-20 rounded-full bg-primary-500/20 animate-pulse" />
          
          {/* Main green circle */}
          <div className="relative h-16 w-16 rounded-full bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/20">
            <svg
              className="h-9 w-9 text-white animate-[drawCheck_0.4s_ease-out_forwards]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">
            {t('completion.title')}
          </h2>
          <p className="text-xs text-text-secondary leading-relaxed max-w-md mx-auto">
            {t('completion.description')}
          </p>
        </div>

        {/* Configuration Summary Card */}
        <Card className="w-full max-w-md border-border-default bg-canvas-secondary/20 shadow-none text-start mt-4">
          <CardContent className="p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
              {t('completion.summary_title')}
            </h3>

            <div className="space-y-3.5 pt-2">
              {/* Selected Countries count */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-text-secondary">
                  {t('completion.summary_countries')}
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1.5 overflow-hidden">
                    {selectedCountries.map((id) => {
                      const countryData = countries.find((c) => c.id === id);
                      return (
                        <span key={id} className="inline-block text-sm bg-canvas-base border border-border-default rounded-full p-0.5" title={countryData ? t(countryData.nameKey) : ''}>
                          {countryData?.flag}
                        </span>
                      );
                    })}
                  </div>
                  <span className="font-bold text-text-primary bg-canvas-tertiary px-2 py-0.5 rounded-md text-[10px]">
                    {totalCountriesCount}
                  </span>
                </div>
              </div>

              {/* Accounts & Candidates count */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-text-secondary">
                  {t('completion.summary_accounts')}
                </span>
                <span className="font-bold text-text-primary bg-canvas-tertiary px-2 py-0.5 rounded-md text-[10px]">
                  {totalCandidatesCount} {t('accounts.add_applicant').split('/')[1]?.trim() || 'Profiles'} ({totalAccountsCount} {t('welcome.title').includes('Velix') ? 'Accounts' : ''})
                </span>
              </div>

              {/* Alert notification status */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-text-secondary">
                  {t('completion.summary_notifications')}
                </span>
                <span className="font-bold text-text-primary bg-canvas-tertiary px-2 py-0.5 rounded-md text-[10px]">
                  {activeChannels} Channels Active
                </span>
              </div>

              {/* Telegram Integration detail indicator */}
              <div className="pt-3 border-t border-border-default/50 flex items-center justify-between text-[11px] text-text-muted">
                <span>Telegram Webhook Status</span>
                <span className={`font-semibold flex items-center gap-1.5 ${
                  notifications.telegramEnabled ? 'text-primary-600 dark:text-primary-400' : 'text-text-muted'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    notifications.telegramEnabled ? 'bg-primary-500' : 'bg-canvas-tertiary'
                  }`} />
                  {notifications.telegramEnabled ? t('completion.telegram') : t('completion.no_telegram')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Footer */}
      <div className="flex gap-4 mt-8 border-t border-border-default/50 pt-6">
        <Button
          variant="secondary"
          onClick={onBack}
          disabled={isCompleting}
          className="flex-1"
        >
          {t('common.back')}
        </Button>
        
        <Button
          variant="primary"
          onClick={handleFinish}
          isLoading={isCompleting}
          className="flex-1 bg-primary-500 hover:bg-primary-600 font-bold"
        >
          {t('completion.finish')}
        </Button>
      </div>
    </div>
  );
};
