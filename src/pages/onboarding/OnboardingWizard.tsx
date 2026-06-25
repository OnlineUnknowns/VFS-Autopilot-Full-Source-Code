import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useOnboardingStore } from '../../store/onboardingStore';
import { WelcomeScreen } from './WelcomeScreen';
import { CountrySelectionScreen } from './CountrySelectionScreen';
import { AccountSetupScreen } from './AccountSetupScreen';
import { NotificationSetupScreen } from './NotificationSetupScreen';
import { CompletionScreen } from './CompletionScreen';
import { Card, CardContent } from '../../components/ui/Card';

interface OnboardingWizardProps {
  onFinish?: () => void;
}

const stepTitles: Record<'en' | 'fr' | 'ar', string[]> = {
  en: ['Welcome', 'Countries', 'Accounts', 'Alerts', 'Complete'],
  fr: ['Bienvenue', 'Pays', 'Comptes', 'Alertes', 'Terminé'],
  ar: ['الترحيب', 'الدول', 'الحسابات', 'التنبيهات', 'الانتهاء'],
};

const getStepCounterText = (step: number, lang: 'en' | 'fr' | 'ar'): string => {
  if (lang === 'ar') return `الخطوة ${step} من 5`;
  if (lang === 'fr') return `Étape ${step} sur 5`;
  return `Step ${step} of 5`;
};

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onFinish = () => {} }) => {
  const { language, direction } = useTheme();
  const { currentStep, setStep } = useOnboardingStore();

  const handleNext = () => {
    if (currentStep < 5) {
      setStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setStep(currentStep - 1);
    }
  };

  // Select titles based on language
  const titles = stepTitles[language] || stepTitles.en;

  const renderActiveStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeScreen onNext={handleNext} />;
      case 2:
        return <CountrySelectionScreen onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <AccountSetupScreen onNext={handleNext} onBack={handleBack} />;
      case 4:
        return <NotificationSetupScreen onNext={handleNext} onBack={handleBack} />;
      case 5:
        return <CompletionScreen onFinish={onFinish} onBack={handleBack} />;
      default:
        return <WelcomeScreen onNext={handleNext} />;
    }
  };

  return (
    <div className="min-h-screen bg-canvas-base text-text-primary flex flex-col justify-between p-4 sm:p-6 md:p-8 overflow-hidden select-none">
      {/* Top Brand Banner Header */}
      <div className="w-full flex items-center justify-between max-w-3xl mx-auto mb-6">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary-500 text-white font-bold text-lg flex items-center justify-center shadow-md shadow-primary-500/10">
            V
          </div>
          <span className="font-bold text-sm tracking-tight text-text-primary">
            Velix VFS Global Automator
          </span>
        </div>
        <span className="text-xs font-semibold text-text-muted">
          {getStepCounterText(currentStep, language)}
        </span>
      </div>

      {/* Main Wizard Flow Card Container */}
      <div className="flex-1 flex items-center justify-center max-w-3xl w-full mx-auto my-auto py-2">
        <Card className="w-full min-h-[600px] h-[640px] max-h-[85vh] flex flex-col border-border-default/60 shadow-xl overflow-hidden bg-canvas-base">
          <CardContent className="flex-1 overflow-hidden p-6 md:p-8 min-h-0 flex flex-col justify-between">
            {/* Horizontal Stepper Progress Indicator Node Bar */}
            <div className="relative flex items-center justify-between w-full max-w-xl mx-auto mb-8 select-none">
              {/* Connected Background Track Line */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px] bg-canvas-tertiary -z-10 rounded-full" />
              
              {/* Colored active fill indicator line (bidirectionally scaled) */}
              <div
                className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px] bg-primary-500 transition-all duration-300 -z-10 rounded-full"
                style={{
                  transform: `scaleX(${(currentStep - 1) / 4})`,
                  transformOrigin: direction === 'rtl' ? 'right' : 'left',
                }}
              />

              {/* Step indicator node layout loops */}
              {Array.from({ length: 5 }).map((_, index) => {
                const stepNum = index + 1;
                const isCompleted = stepNum < currentStep;
                const isActive = stepNum === currentStep;
                const isUpcoming = stepNum > currentStep;
                const label = titles[index];

                return (
                  <div key={stepNum} className="flex flex-col items-center relative group">
                    {/* Node Circle */}
                    <button
                      type="button"
                      onClick={() => {
                        // Allow skipping back to already completed steps
                        if (stepNum < currentStep) {
                          setStep(stepNum);
                        }
                      }}
                      disabled={isUpcoming}
                      className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200 border-2 font-bold text-xs select-none ${
                        isCompleted
                          ? 'bg-primary-500 border-primary-500 text-white cursor-pointer hover:bg-primary-600 active:scale-95'
                          : isActive
                          ? 'bg-canvas-base border-primary-500 text-primary-500 ring-4 ring-primary-500/10 cursor-default shadow-sm'
                          : 'bg-canvas-base border-border-default text-text-muted cursor-not-allowed'
                      }`}
                    >
                      {isCompleted ? (
                        <svg
                          className="h-4.5 w-4.5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <span>{stepNum}</span>
                      )}
                    </button>

                    {/* Desktop Floating Labels */}
                    <span
                      className={`absolute -bottom-6 text-[10px] whitespace-nowrap font-bold transition-colors ${
                        isActive
                          ? 'text-primary-600 dark:text-primary-400'
                          : isCompleted
                          ? 'text-text-primary'
                          : 'text-text-muted'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Step Content Render Area */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {renderActiveStep()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Footer Credits */}
      <div className="w-full text-center max-w-3xl mx-auto mt-4 text-[10px] text-text-muted">
        © 2026 Velix. Open-source educational portfolio. All portal integrations are simulated in developer environments.
      </div>
    </div>
  );
};
