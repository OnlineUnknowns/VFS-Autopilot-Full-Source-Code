import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useOnboardingStore } from '../../store/onboardingStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';

interface NotificationSetupScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export const NotificationSetupScreen: React.FC<NotificationSetupScreenProps> = ({ onNext, onBack }) => {
  const { t, direction } = useTheme();
  const { notifications, updateNotificationToggle, updateTelegramCredentials } = useOnboardingStore();

  // Local state for Telegram inputs to keep editing fluid
  const [telegramToken, setTelegramToken] = useState(notifications.telegramToken);
  const [telegramChatId, setTelegramChatId] = useState(notifications.telegramChatId);

  // Connection testing state: 'idle' | 'testing' | 'success' | 'error'
  const [testState, setTestState] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [formError, setFormError] = useState<string | null>(null);

  const handleToggle = (key: 'desktop' | 'sound' | 'telegramEnabled') => {
    const nextVal = !notifications[key];
    updateNotificationToggle(key, nextVal);
    setFormError(null);
  };

  const handleTestConnection = async () => {
    if (!telegramToken.trim() || !telegramChatId.trim()) {
      setTestState('error');
      return;
    }

    setTestState('testing');
    
    // Simulate async connection testing (1.5 seconds delay)
    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // If token looks semi-valid (just mock validation for visual feedback), succeed
          if (telegramToken.length >= 8 && telegramChatId.length >= 3) {
            resolve(true);
          } else {
            reject(new Error('Invalid parameters'));
          }
        }, 1500);
      });
      setTestState('success');
      // Save current credentials to the store on successful test
      updateTelegramCredentials(telegramToken, telegramChatId);
    } catch (err) {
      setTestState('error');
    }
  };

  const handleNextStep = () => {
    setFormError(null);

    if (notifications.telegramEnabled) {
      if (!telegramToken.trim() || !telegramChatId.trim()) {
        setFormError(t('notifications.test_error'));
        return;
      }
      // Save details to store
      updateTelegramCredentials(telegramToken, telegramChatId);
    }

    onNext();
  };

  return (
    <div className="flex flex-col justify-between h-full max-w-2xl mx-auto py-4 px-2 select-none animate-[fadeIn_0.4s_ease-out_forwards]">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">
            {t('notifications.title')}
          </h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            {t('notifications.description')}
          </p>
        </div>

        {formError && (
          <div className="bg-danger-50 border border-danger-100 rounded-xl p-3 text-xs text-danger-700 text-start dark:bg-danger-950/20 dark:border-danger-900/30">
            {formError}
          </div>
        )}

        <div className="space-y-4">
          {/* Desktop Push Notification Toggle */}
          <Card className="border-border-default bg-canvas-secondary/20 shadow-none hover:bg-canvas-secondary/30 transition-all duration-200">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="text-start flex-1">
                <h4 className="text-sm font-bold text-text-primary">
                  {t('notifications.desktop_label')}
                </h4>
                <p className="text-xs text-text-muted mt-0.5">
                  {t('notifications.desktop_desc')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('desktop')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                  notifications.desktop ? 'bg-primary-500' : 'bg-canvas-tertiary'
                }`}
                role="switch"
                aria-checked={notifications.desktop}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    notifications.desktop
                      ? (direction === 'rtl' ? '-translate-x-5' : 'translate-x-5')
                      : 'translate-x-0'
                  }`}
                />
              </button>
            </CardContent>
          </Card>

          {/* Sound Alarm Toggle */}
          <Card className="border-border-default bg-canvas-secondary/20 shadow-none hover:bg-canvas-secondary/30 transition-all duration-200">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="text-start flex-1">
                <h4 className="text-sm font-bold text-text-primary">
                  {t('notifications.sound_label')}
                </h4>
                <p className="text-xs text-text-muted mt-0.5">
                  {t('notifications.sound_desc')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('sound')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                  notifications.sound ? 'bg-primary-500' : 'bg-canvas-tertiary'
                }`}
                role="switch"
                aria-checked={notifications.sound}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    notifications.sound
                      ? (direction === 'rtl' ? '-translate-x-5' : 'translate-x-5')
                      : 'translate-x-0'
                  }`}
                />
              </button>
            </CardContent>
          </Card>

          {/* Telegram Webhook Toggle */}
          <Card className={`transition-all duration-300 border-border-default shadow-none ${
            notifications.telegramEnabled 
              ? 'bg-canvas-secondary/40 border-primary-500/30' 
              : 'bg-canvas-secondary/20 hover:bg-canvas-secondary/30'
          }`}>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="text-start flex-1">
                  <h4 className="text-sm font-bold text-text-primary">
                    {t('notifications.telegram_label')}
                  </h4>
                  <p className="text-xs text-text-muted mt-0.5">
                    {t('notifications.telegram_desc')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('telegramEnabled')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                    notifications.telegramEnabled ? 'bg-primary-500' : 'bg-canvas-tertiary'
                  }`}
                  role="switch"
                  aria-checked={notifications.telegramEnabled}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      notifications.telegramEnabled
                        ? (direction === 'rtl' ? '-translate-x-5' : 'translate-x-5')
                        : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Collapsible Telegram credential inputs */}
              {notifications.telegramEnabled && (
                <div className="pt-4 border-t border-border-default/50 space-y-4 animate-[slideDown_0.2s_ease-out_forwards]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label={t('notifications.telegram_token')}
                      type="text"
                      value={telegramToken}
                      onChange={(e) => setTelegramToken(e.target.value)}
                      placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                      required
                    />
                    <Input
                      label={t('notifications.telegram_chatid')}
                      type="text"
                      value={telegramChatId}
                      onChange={(e) => setTelegramChatId(e.target.value)}
                      placeholder="-100123456789"
                      required
                    />
                  </div>

                  {/* Connection testing trigger */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleTestConnection}
                      isLoading={testState === 'testing'}
                      disabled={!telegramToken.trim() || !telegramChatId.trim()}
                      className="text-xs h-9 font-semibold w-full sm:w-auto"
                    >
                      {t('notifications.test_button')}
                    </Button>

                    <div className="text-xs text-start flex-1 sm:ps-3">
                      {testState === 'testing' && (
                        <span className="text-text-muted animate-pulse">
                          {t('notifications.test_sending')}
                        </span>
                      )}
                      {testState === 'success' && (
                        <span className="text-primary-600 dark:text-primary-400 font-medium">
                          ✓ {t('notifications.test_success')}
                        </span>
                      )}
                      {testState === 'error' && (
                        <span className="text-danger-500 font-medium">
                          ✕ {t('notifications.test_error')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex gap-4 mt-8 border-t border-border-default/50 pt-6">
        <Button
          variant="secondary"
          onClick={onBack}
          className="flex-1"
        >
          {t('common.back')}
        </Button>
        
        <Button
          variant="primary"
          onClick={handleNextStep}
          className="flex-1 bg-primary-500 hover:bg-primary-600"
        >
          {t('common.next')}
        </Button>
      </div>
    </div>
  );
};
