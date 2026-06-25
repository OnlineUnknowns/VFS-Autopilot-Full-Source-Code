import React, { useState } from 'react';
import { useTheme, Language } from '../../context/ThemeContext';
import { Button } from '../../components/ui/Button';

interface WelcomeScreenProps {
  onNext: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNext }) => {
  const { language, setLanguage, t, direction } = useTheme();
  
  // Local state to support "editable tagline paragraph" preview interaction
  const [taglineText, setTaglineText] = useState(() => t('welcome.tagline'));
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="flex flex-col items-center justify-between h-full max-w-2xl mx-auto py-8 px-4 text-center select-none animate-[fadeIn_0.6s_ease-out_forwards]">
      {/* Upper header section for Language Switch */}
      <div className="w-full flex justify-end items-center gap-2 mb-6">
        <label htmlFor="lang-select" className="text-xs font-semibold text-text-secondary">
          {t('welcome.language')}:
        </label>
        <select
          id="lang-select"
          value={language}
          onChange={(e) => {
            const nextLang = e.target.value as Language;
            setLanguage(nextLang);
            // Re-sync editable tagline context when language shifts
            // We use a small timeout to let the state update
            setTimeout(() => {
              setTaglineText(t('welcome.tagline'));
            }, 0);
          }}
          className="bg-canvas-secondary border border-border-default rounded-lg text-xs font-semibold text-text-primary px-3 py-1.5 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
        >
          <option value="en">English (US)</option>
          <option value="fr">Français (FR)</option>
          <option value="ar">العربية (AR)</option>
        </select>
      </div>

      {/* Main splash branding */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-6 my-auto">
        <div className="relative group">
          {/* Subtle logo pulse backdrop */}
          <div className="absolute inset-0 bg-primary-500/20 rounded-2xl blur-xl group-hover:scale-110 transition-transform duration-300" />
          
          <div className="relative h-20 w-20 rounded-2xl bg-primary-500 text-white font-bold text-4xl flex items-center justify-center shadow-lg shadow-primary-500/20">
            V
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-text-primary">
            {t('welcome.title')}
          </h2>
          
          {/* Editable tagline paragraph sandbox */}
          <div className="relative max-w-lg mx-auto py-2 group">
            {isEditing ? (
              <textarea
                value={taglineText}
                onChange={(e) => setTaglineText(e.target.value)}
                onBlur={() => setIsEditing(false)}
                className="w-full min-h-[80px] bg-canvas-secondary border border-primary-500 text-xs rounded-lg p-3 text-text-secondary focus:outline-none focus:ring-1 focus:ring-primary-500/20 leading-relaxed text-center resize-none"
                autoFocus
              />
            ) : (
              <p
                onClick={() => setIsEditing(true)}
                className="text-xs text-text-secondary leading-relaxed cursor-edit hover:bg-canvas-secondary/80 hover:ring-1 hover:ring-border-default px-4 py-2 rounded-lg transition-all duration-200"
                title={direction === 'rtl' ? 'انقر لتعديل نص الوصف' : 'Click to edit tagline description'}
              >
                {taglineText}
              </p>
            )}
            
            {!isEditing && (
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[9px] text-text-muted opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                {direction === 'rtl' ? 'انقر للتعديل' : 'Double click / Click to edit'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Central primary green CTA button */}
      <div className="w-full max-w-sm mt-8">
        <Button
          variant="primary"
          size="lg"
          className="w-full font-bold text-sm tracking-wide bg-primary-500 hover:bg-primary-600 active:scale-[0.98] shadow-md shadow-primary-500/10"
          onClick={onNext}
        >
          {t('welcome.cta')}
        </Button>
      </div>
    </div>
  );
};
