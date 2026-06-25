import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme, Language } from '../../context/ThemeContext';
import { useSettingsStore, ProxyTestResult } from '../../store/settingsStore';
import { useOnboardingStore } from '../../store/onboardingStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { setOnboardingComplete } from '../../lib/secureStorage';

export const Settings: React.FC = () => {
  const { t, theme, setTheme, language, setLanguage, direction } = useTheme();
  const navigate = useNavigate();

  const {
    pollingInterval,
    proxiesEnabled,
    proxies,
    proxyTestResults,
    captchaKey,
    captchaBalance,
    isTestingProxies,
    updateSettings,
    testProxies
  } = useSettingsStore();

  const { resetStore } = useOnboardingStore();

  const [formSaved, setFormSaved] = useState(false);

  const handleToggleProxies = () => {
    updateSettings({ proxiesEnabled: !proxiesEnabled });
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSaved(true);
    setTimeout(() => setFormSaved(false), 3000);
  };

  // Full purge: clear all local storage, reset stores, redirect to onboarding step 1
  const handleClearAllData = async () => {
    if (window.confirm('Are you absolutely sure you want to delete all credentials, accounts, and application data? This action is irreversible.')) {
      localStorage.clear();
      resetStore();
      
      // Clear obfuscated fallback flags
      localStorage.removeItem('onboardingComplete');

      // Force route to onboarding welcome screen
      navigate('/');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto text-start animate-[fadeIn_0.4s_ease-out_forwards]">
      
      {/* Page Header */}
      <div className="text-start">
        <h2 className="text-xl font-bold tracking-tight text-text-primary">
          {t('settings_page.title') || 'System & Automation Settings'}
        </h2>
        <p className="text-xs text-text-secondary mt-1">
          Adjust scheduler speeds, credentials bypass keys, routing tunnels, and visual interface preferences.
        </p>
      </div>

      {formSaved && (
        <div className="bg-primary-50 border border-primary-100 rounded-xl p-3 text-xs text-primary-700 dark:bg-primary-950/20 dark:border-primary-900/30">
          ✓ Configuration settings successfully saved and applied.
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        {/* SECTION 1: SCANNER SPEED & POLLING FREQUENCY */}
        <Card className="border-border-default/60 shadow-sm">
          <CardHeader className="p-5 border-b border-border-default/50 bg-canvas-secondary/10">
            <CardTitle className="text-sm font-bold text-text-primary uppercase tracking-wider">
              1. Scheduler Polling Frequency
            </CardTitle>
            <CardDescription className="text-xs">
              Determine how frequently the scanning engine queries slot availabilities.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-text-secondary font-semibold">
                Query interval threshold
              </span>
              <span className="text-sm font-bold text-primary-500">
                {pollingInterval} seconds
              </span>
            </div>

            <input
              type="range"
              min="30"
              max="600"
              step="10"
              value={pollingInterval}
              onChange={(e) => updateSettings({ pollingInterval: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-canvas-tertiary rounded-lg appearance-none cursor-pointer accent-primary-500"
            />

            {/* Amber warning tags for rate limit threats */}
            {pollingInterval < 90 && (
              <div className="bg-danger-500/10 border border-danger-500/20 rounded-lg p-3 text-[11px] text-danger-700 dark:text-danger-500 leading-relaxed">
                ⚠️ <strong>Warning:</strong> Query intervals under 90s dramatically increase risks of portal IP rate-limiting blocks or Cloudflare challenge gates.
              </div>
            )}
          </CardContent>
        </Card>

        {/* SECTION 2: PROXY DEVIATION TUNNELS */}
        <Card className="border-border-default/60 shadow-sm">
          <CardHeader className="p-5 border-b border-border-default/50 bg-canvas-secondary/10 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-text-primary uppercase tracking-wider">
                2. Proxy Network Tunnels
              </CardTitle>
              <CardDescription className="text-xs">
                Route scheduler requests through rotating proxies to evade bot detectors.
              </CardDescription>
            </div>
            <button
              type="button"
              onClick={handleToggleProxies}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                proxiesEnabled ? 'bg-primary-500' : 'bg-canvas-tertiary'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  proxiesEnabled
                    ? (direction === 'rtl' ? '-translate-x-4' : 'translate-x-4')
                    : 'translate-x-0'
                }`}
              />
            </button>
          </CardHeader>
          {proxiesEnabled && (
            <CardContent className="p-5 space-y-4 animate-[slideDown_0.2s_ease-out_forwards]">
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary select-none">
                  Proxy List (One per line, IP:PORT or IP:PORT:USER:PASS)
                </label>
                <textarea
                  value={proxies}
                  onChange={(e) => updateSettings({ proxies: e.target.value })}
                  placeholder="185.110.12.33:8080&#10;192.168.1.100:3128:socks_user:secure_pass"
                  rows={4}
                  className="w-full bg-canvas-secondary border border-border-default rounded-lg text-xs font-semibold font-mono text-text-primary p-3 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 leading-relaxed resize-none"
                />
              </div>

              {/* Action and test visual status */}
              <div className="flex flex-col gap-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={testProxies}
                  isLoading={isTestingProxies}
                  type="button"
                  className="text-xs font-semibold h-9 self-start"
                >
                  Test Connection Latency
                </Button>

                {proxyTestResults.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2">
                    {proxyTestResults.map((res, i) => (
                      <div
                        key={i}
                        className={`border rounded-lg p-2.5 flex items-center justify-between text-[10px] ${
                          res.status === 'success'
                            ? 'bg-primary-50/20 border-primary-500/20'
                            : res.status === 'failed'
                            ? 'bg-danger-500/5 border-danger-500/10'
                            : 'bg-canvas-secondary border-border-default/40'
                        }`}
                      >
                        <span className="font-mono text-text-secondary truncate pr-2" title={res.proxy}>
                          {res.proxy.split(':')[0]}
                        </span>
                        
                        {res.status === 'testing' && (
                          <span className="text-text-muted animate-pulse font-semibold">Testing...</span>
                        )}
                        {res.status === 'success' && (
                          <span className="text-primary-600 dark:text-primary-400 font-bold shrink-0">
                            ✓ {res.speed}ms
                          </span>
                        )}
                        {res.status === 'failed' && (
                          <span className="text-danger-500 font-bold shrink-0">✕ Failed</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        {/* SECTION 3: CAPTCHA BYPASS CONFIGS */}
        <Card className="border-border-default/60 shadow-sm">
          <CardHeader className="p-5 border-b border-border-default/50 bg-canvas-secondary/10">
            <CardTitle className="text-sm font-bold text-text-primary uppercase tracking-wider">
              3. Captcha Solver API integration
            </CardTitle>
            <CardDescription className="text-xs">
              Integrate third-party API keys to auto-solve portal sign-in challenge widgets.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Solver Account Token / API Key"
                type="text"
                value={captchaKey}
                onChange={(e) => updateSettings({ captchaKey: e.target.value })}
                placeholder="2c9e7829ac..."
                className="font-mono"
              />

              <div className="flex flex-col space-y-1.5 text-start bg-canvas-secondary/20 p-3 rounded-lg border border-border-default/40">
                <span className="text-xs font-semibold text-text-secondary">
                  API Key Available Balance
                </span>
                <span className="text-lg font-bold text-primary-500 mt-1">
                  ${captchaBalance.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 4: INTERFACE ACCESSIBILITY PREFERENCES */}
        <Card className="border-border-default/60 shadow-sm">
          <CardHeader className="p-5 border-b border-border-default/50 bg-canvas-secondary/10">
            <CardTitle className="text-sm font-bold text-text-primary uppercase tracking-wider">
              4. UI Theme & Language Settings
            </CardTitle>
            <CardDescription className="text-xs">
              Adjust layout orientation and visual system coloring.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Color Mode Select */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">
                Visual Palette Mode
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as any)}
                className="bg-canvas-secondary border border-border-default rounded-lg text-xs font-semibold text-text-primary px-3 py-2.5 focus:outline-none"
              >
                <option value="light">Light Emerald Mode</option>
                <option value="dark">Dark Charcoal Mode</option>
              </select>
            </div>

            {/* Direction/Lang Select */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">
                Localization & Direction
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-canvas-secondary border border-border-default rounded-lg text-xs font-semibold text-text-primary px-3 py-2.5 focus:outline-none"
              >
                <option value="en">English (US)</option>
                <option value="fr">Français (FR)</option>
                <option value="ar">العربية (RTL)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 5: RED ZONE CRITICAL ACCORDIANS */}
        <Card className="border-danger-500/30 bg-danger-500/5 shadow-none">
          <CardHeader className="p-5 border-b border-danger-500/10">
            <CardTitle className="text-sm font-bold text-danger-700 dark:text-danger-500 uppercase tracking-wider">
              ⚠️ DANGER ZONE
            </CardTitle>
            <CardDescription className="text-xs text-danger-600/80 dark:text-danger-500/70">
              Irreversible node operations. Exercise high caution.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 flex flex-wrap gap-4">
            <Button
              variant="danger"
              size="sm"
              onClick={handleClearAllData}
              type="button"
              className="text-xs font-semibold bg-transparent border-danger-500/20 text-danger-700 hover:bg-danger-500/10"
            >
              Purge Database & Log Cache
            </Button>
          </CardContent>
        </Card>

        {/* Form Submission actions */}
        <div className="pt-2 flex justify-end">
          <Button
            variant="primary"
            size="lg"
            type="submit"
            className="w-full sm:w-auto font-bold bg-primary-500 hover:bg-primary-600 shadow-md shadow-primary-500/10"
          >
            Apply Configurations
          </Button>
        </div>
      </form>
    </div>
  );
};
