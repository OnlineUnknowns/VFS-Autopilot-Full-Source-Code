import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useOnboardingStore } from '../../store/onboardingStore';
import { countries } from '../../data/countries';
import { Button } from '../../components/ui/Button';
import { CountryCard } from '../../components/ui/CountryCard';

interface CountrySelectionScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export const CountrySelectionScreen: React.FC<CountrySelectionScreenProps> = ({ onNext, onBack }) => {
  const { t, direction } = useTheme();
  const { selectedCountries, toggleCountry } = useOnboardingStore();

  const isNextDisabled = selectedCountries.length === 0;

  return (
    <div className="flex flex-col justify-between h-full max-w-4xl mx-auto py-4 px-2 select-none">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">
            {t('country_select.title')}
          </h2>
          <p className="text-xs text-text-secondary max-w-xl mx-auto leading-relaxed">
            {t('country_select.description')}
          </p>
        </div>

        {/* Dynamic target country selection grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
          {countries.map((c) => {
            const isSelected = selectedCountries.includes(c.id);
            return (
              <CountryCard
                key={c.id}
                countryCode={c.code}
                countryName={t(c.nameKey)}
                active={isSelected}
                // CountryCards are clickable toggles in the wizard selection view
                onClick={() => toggleCountry(c.id)}
                slotsAvailable={0}
                lastChecked="-"
                className="transform transition-all active:scale-[0.98] hover:scale-[1.01]"
              />
            );
          })}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex gap-4 mt-10 border-t border-border-default/50 pt-6">
        <Button
          variant="secondary"
          onClick={onBack}
          className="flex-1"
        >
          {t('common.back')}
        </Button>
        
        <Button
          variant="primary"
          onClick={onNext}
          disabled={isNextDisabled}
          className="flex-1 bg-primary-500 hover:bg-primary-600"
        >
          {t('common.next')}
        </Button>
      </div>
    </div>
  );
};
