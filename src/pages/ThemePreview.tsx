import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { CountryCard, SupportedCountryCode } from '../components/ui/CountryCard';
import { cn } from '../lib/utils';

// Inline Lucide-style Icon Components to keep this file self-contained and compile-safe
const SunIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
);

const MoonIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
);

const GlobeIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20M2 12h20"/><path d="M12 2a14.5 14.5 0 0 1 0 20"/></svg>
);

const SearchIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);

const ShieldIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l7-2a1 1 0 0 1 .48 0l7 2A1 1 0 0 1 20 6Z"/></svg>
);

const ClockIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
);

const TerminalIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
);

const SettingsIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
);

const UserIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

const DashboardIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="10" rx="1"/><rect width="7" height="5" x="3" y="14" rx="1"/></svg>
);

const ChevronLeftIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
);

const ChevronRightIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
);

export const ThemePreview: React.FC = () => {
  const { theme, direction, toggleTheme, toggleDirection } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeCountry, setActiveCountry] = useState<SupportedCountryCode>('PK');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastId, setToastId] = useState<number>(0);
  const [inputVal, setInputVal] = useState('');
  const [inputErr, setInputErr] = useState('');

  // Auto-dismiss toast helper
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, toastId]);

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setToastId((prev) => prev + 1);
  };

  const handleValidateInput = (val: string) => {
    setInputVal(val);
    if (val.length > 0 && val.length < 5) {
      setInputErr(direction === 'rtl' ? 'يجب أن يكون الاسم ٥ أحرف على الأقل' : 'Username must be at least 5 characters');
    } else {
      setInputErr('');
    }
  };

  const countries: { code: SupportedCountryCode; nameEn: string; nameAr: string }[] = [
    { code: 'PK', nameEn: 'Pakistan', nameAr: 'باكستان' },
    { code: 'IN', nameEn: 'India', nameAr: 'الهند' },
    { code: 'AO', nameEn: 'Angola', nameAr: 'أنغولا' },
    { code: 'MA', nameEn: 'Morocco', nameAr: 'المغرب' },
    { code: 'DZ', nameEn: 'Algeria', nameAr: 'الجزائر' },
    { code: 'EG', nameEn: 'Egypt', nameAr: 'مصر' },
  ];

  const sidebarNavItems = [
    { icon: <DashboardIcon size={20} />, labelEn: 'Dashboard', labelAr: 'لوحة القيادة' },
    { icon: <TerminalIcon size={20} />, labelEn: 'Automation Logs', labelAr: 'سجلات الأتمتة' },
    { icon: <UserIcon size={20} />, labelEn: 'Profile Profiles', labelAr: 'ملفات المستخدمين' },
    { icon: <SettingsIcon size={20} />, labelEn: 'System Settings', labelAr: 'إعدادات النظام' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-canvas-base text-text-primary">
      {/* Dynamic Collapsible Sidebar Layout */}
      <aside
        className={cn(
          'flex flex-col justify-between border-e border-border-default bg-canvas-secondary transition-all duration-200 ease-out shrink-0 relative',
          sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'
        )}
      >
        <div>
          {/* Sidebar Header Brand Area */}
          <div className="h-16 flex items-center border-b border-border-default/50 px-4 justify-between">
            {!sidebarCollapsed ? (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary-500 flex items-center justify-center text-white font-bold text-base shadow-sm shadow-primary-500/30">
                  V
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm tracking-tight leading-none text-text-primary">Velix Bot</span>
                  <span className="text-[10px] text-text-muted mt-0.5 leading-none font-semibold">VFS Automator</span>
                </div>
              </div>
            ) : (
              <div className="h-8 w-8 mx-auto rounded-lg bg-primary-500 flex items-center justify-center text-white font-bold text-base shadow-sm shadow-primary-500/30 shrink-0">
                V
              </div>
            )}

            {/* Collapse Toggle Trigger button */}
            {!sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-canvas-tertiary transition-all"
                aria-label="Collapse Sidebar"
              >
                {direction === 'ltr' ? <ChevronLeftIcon size={18} /> : <ChevronRightIcon size={18} />}
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {sidebarNavItems.map((item, idx) => (
              <a
                key={idx}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  triggerToast(`${direction === 'rtl' ? 'تم النقر على ' : 'Clicked '}${direction === 'rtl' ? item.labelAr : item.labelEn}`);
                }}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all group duration-200',
                  idx === 0
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/20 dark:text-primary-500'
                    : 'text-text-secondary hover:text-text-primary hover:bg-canvas-tertiary'
                )}
              >
                <span className={cn('shrink-0 transition-transform duration-200 group-hover:scale-105', idx === 0 ? 'text-primary-500' : 'text-text-muted group-hover:text-text-primary')}>
                  {item.icon}
                </span>
                {!sidebarCollapsed && (
                  <span className="truncate">{direction === 'rtl' ? item.labelAr : item.labelEn}</span>
                )}
              </a>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer with expand button if collapsed */}
        <div className="p-3 border-t border-border-default/50">
          {sidebarCollapsed ? (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="w-full flex justify-center p-3 rounded-lg text-text-muted hover:text-text-primary hover:bg-canvas-tertiary transition-all"
              aria-label="Expand Sidebar"
            >
              {direction === 'ltr' ? <ChevronRightIcon size={18} /> : <ChevronLeftIcon size={18} />}
            </button>
          ) : (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-canvas-tertiary/50 border border-border-default/20">
              <div className="h-8 w-8 rounded-full bg-canvas-tertiary flex items-center justify-center font-bold text-xs text-text-secondary shrink-0">
                JD
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-text-primary truncate">John Doe</span>
                <span className="text-[10px] text-text-muted truncate">Admin Operator</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Panel Viewport */}
      <div className="flex flex-col flex-1 h-full min-w-0">
        
        {/* Top Header Layout */}
        <header className="h-16 border-b border-border-default flex items-center justify-between px-6 bg-canvas-base shrink-0 select-none">
          <div className="flex items-center gap-4">
            <h1 className="text-base font-bold tracking-tight text-text-primary">
              {direction === 'rtl' ? 'نظام التصميم ومعاينة المظهر' : 'Design System & Theme Preview'}
            </h1>
            
            {/* Enterprise License indicator */}
            <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
              <ShieldIcon size={12} />
              <span>{direction === 'rtl' ? 'رخصة تجارية' : 'ENTERPRISE LICENSE'}</span>
            </div>
          </div>

          {/* Interactive Global Toggles (Theme and Language) */}
          <div className="flex items-center gap-2">
            {/* LTR / RTL Direction Toggle */}
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<GlobeIcon size={16} />}
              onClick={toggleDirection}
              aria-label="Toggle Layout Direction"
            >
              {direction === 'ltr' ? 'العربية (RTL)' : 'English (LTR)'}
            </Button>

            {/* Dark / Light Theme Toggle */}
            <Button
              variant="secondary"
              size="sm"
              leftIcon={theme === 'dark' ? <SunIcon size={16} /> : <MoonIcon size={16} />}
              onClick={toggleTheme}
              aria-label="Toggle Theme Color"
            >
              {theme === 'dark' ? (direction === 'rtl' ? 'الوضع المضيء' : 'Light Mode') : (direction === 'rtl' ? 'الوضع المظلم' : 'Dark Mode')}
            </Button>
          </div>
        </header>

        {/* Scrollable Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-canvas-base p-6 md:p-8">
          <div className="max-w-[1400px] mx-auto space-y-8">
            
            {/* Visual QA Controls Callout */}
            <Card className="bg-canvas-secondary border-dashed border-2">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-text-primary tracking-tight">
                      {direction === 'rtl' ? 'لوحة تحكم معمل فحص واجهة المستخدم' : 'Interactive UI QA Laboratory'}
                    </h2>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">
                      {direction === 'rtl' 
                        ? 'اختبر بدقة الاستجابة الكاملة والتفاعلات، والمظهر الفاتح والداكن والاتجاهين LTR/RTL بشكل فوري.' 
                        : 'Simulate desktop environments. Switch theme contexts and RTL alignments instantly to verify visual parity, layout alignment and pixel-perfect transitions.'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <Button variant="primary" onClick={() => triggerToast(direction === 'rtl' ? 'تم إرسال إشعار تجريبي جديد!' : 'Test toast notification dispatched!')}>
                      {direction === 'rtl' ? 'إرسال إشعار عائم' : 'Trigger Toast Banner'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Grid Container for Components Sections */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              
              {/* SECTION A: Typography & Colors */}
              <Card>
                <CardHeader>
                  <CardTitle>{direction === 'rtl' ? 'أ. الطباعة ولوحة الألوان' : 'A. Typography & Color Tokens'}</CardTitle>
                  <CardDescription>{direction === 'rtl' ? 'نظام الأحجام وعينات الألوان المتوافقة مع العقد' : 'Scales and contrast checks for emerald and semantic themes.'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Typography Scales */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">{direction === 'rtl' ? 'مقياس الخطوط' : 'Typography Scale'}</h4>
                    <div className="border border-border-default rounded-lg p-4 space-y-4">
                      <div>
                        <span className="text-[10px] text-text-muted font-mono block">text-4xl (font-bold)</span>
                        <h1 className="text-4xl font-bold tracking-tight">
                          {direction === 'rtl' ? 'حجز المواعيد' : 'Visa Visa Booking'}
                        </h1>
                      </div>
                      <div>
                        <span className="text-[10px] text-text-muted font-mono block">text-2xl (font-bold)</span>
                        <h2 className="text-2xl font-bold tracking-tight">
                          {direction === 'rtl' ? 'المعلومات الشخصية' : 'Personal Information'}
                        </h2>
                      </div>
                      <div>
                        <span className="text-[10px] text-text-muted font-mono block">text-sm (font-medium)</span>
                        <p className="text-sm font-medium">
                          {direction === 'rtl' ? 'نظام أتمتة حجز المواعيد سهل وسريع.' : 'Visa booking automation process is running in the background.'}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-text-muted font-mono block">text-xs (font-normal)</span>
                        <p className="text-xs text-text-muted">
                          {direction === 'rtl' ? 'هذا النص مخصص للملاحظات الفرعية والهامشية.' : 'Subtext and secondary descriptive notes go here.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Theme Color Palette Indicators */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">{direction === 'rtl' ? 'لوحة الألوان المستخرجة' : 'Extracted Color Palettes'}</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="p-3 rounded-lg bg-primary-500 text-white flex flex-col justify-between h-20 shadow-sm shadow-primary-500/15">
                        <span className="text-xs font-bold">Primary Main</span>
                        <span className="text-[10px] font-mono opacity-90">{theme === 'dark' ? '#22c55e' : '#16a34a'}</span>
                      </div>
                      <div className="p-3 rounded-lg bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-500 border border-primary-100 dark:border-primary-900/30 flex flex-col justify-between h-20">
                        <span className="text-xs font-bold">Primary Tint</span>
                        <span className="text-[10px] font-mono opacity-90">{theme === 'dark' ? '#0d2a1a' : '#f0fdf4'}</span>
                      </div>
                      <div className="p-3 rounded-lg bg-danger-500 text-white flex flex-col justify-between h-20 shadow-sm shadow-danger-500/15">
                        <span className="text-xs font-bold">Danger Main</span>
                        <span className="text-[10px] font-mono opacity-90">{theme === 'dark' ? '#ef4444' : '#dc2626'}</span>
                      </div>
                      <div className="p-3 rounded-lg bg-canvas-secondary border border-border-default text-text-primary flex flex-col justify-between h-20">
                        <span className="text-xs font-bold">Canvas Sec</span>
                        <span className="text-[10px] font-mono opacity-90">{theme === 'dark' ? '#131a17' : '#f8fafc'}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* SECTION B: Buttons Library */}
              <Card>
                <CardHeader>
                  <CardTitle>{direction === 'rtl' ? 'ب. مكتبة الأزرار التفاعلية' : 'B. Interactive Buttons Library'}</CardTitle>
                  <CardDescription>{direction === 'rtl' ? 'الحالات التفاعلية، والأحجام والتحميل' : 'Testing disabled states, sizes, icons, and background loads.'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Standard Variants */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">{direction === 'rtl' ? 'الفئات الرئيسية' : 'Button Variants'}</h4>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="primary">{direction === 'rtl' ? 'زر رئيسي' : 'Primary Action'}</Button>
                      <Button variant="danger">{direction === 'rtl' ? 'زر خطر' : 'Danger Action'}</Button>
                      <Button variant="secondary">{direction === 'rtl' ? 'زر ثنائي' : 'Secondary Action'}</Button>
                      <Button variant="ghost">{direction === 'rtl' ? 'زر خفي' : 'Ghost Action'}</Button>
                    </div>
                  </div>

                  {/* Sizing & Icons */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">{direction === 'rtl' ? 'الأحجام والأيقونات' : 'Sizing & Icon Triggers'}</h4>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button variant="primary" size="sm" leftIcon={<SearchIcon size={14} />}>
                        {direction === 'rtl' ? 'صغير' : 'Small'}
                      </Button>
                      <Button variant="secondary" size="md" rightIcon={<TerminalIcon size={16} />}>
                        {direction === 'rtl' ? 'متوسط' : 'Medium'}
                      </Button>
                      <Button variant="primary" size="lg">
                        {direction === 'rtl' ? 'كبير' : 'Large'}
                      </Button>
                    </div>
                  </div>

                  {/* Asynchronous Loading States */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">{direction === 'rtl' ? 'حالة التحميل والأزرار المعطلة' : 'Loading & Disabled States'}</h4>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="primary" isLoading>
                        {direction === 'rtl' ? 'جار التحميل...' : 'Please Wait'}
                      </Button>
                      <Button variant="danger" isLoading>
                        {direction === 'rtl' ? 'حذف...' : 'Deleting'}
                      </Button>
                      <Button variant="secondary" disabled>
                        {direction === 'rtl' ? 'معطل' : 'Disabled Option'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* SECTION C: Status Badges */}
              <Card>
                <CardHeader>
                  <CardTitle>{direction === 'rtl' ? 'ج. شارات الحالة' : 'C. Status Indicators & Badges'}</CardTitle>
                  <CardDescription>{direction === 'rtl' ? 'تتبع فوري لحالات المهام في محرك الأتمتة' : 'Dynamic tags reflecting agent task loops.'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="border border-border-default rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2 bg-canvas-secondary/35">
                      <span className="text-[10px] text-text-muted font-bold tracking-wider uppercase">{direction === 'rtl' ? 'البحث عن موعد' : 'Searching Loop'}</span>
                      <Badge status="searching">{direction === 'rtl' ? 'بحث مستمر' : 'Searching'}</Badge>
                    </div>
                    <div className="border border-border-default rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2 bg-canvas-secondary/35">
                      <span className="text-[10px] text-text-muted font-bold tracking-wider uppercase">{direction === 'rtl' ? 'تم العثور' : 'Slot Secured'}</span>
                      <Badge status="found">{direction === 'rtl' ? 'تم العثور' : 'Found'}</Badge>
                    </div>
                    <div className="border border-border-default rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2 bg-canvas-secondary/35">
                      <span className="text-[10px] text-text-muted font-bold tracking-wider uppercase">{direction === 'rtl' ? 'خطأ محرك' : 'Critical Failure'}</span>
                      <Badge status="failed">{direction === 'rtl' ? 'فشل العملية' : 'Failed'}</Badge>
                    </div>
                    <div className="border border-border-default rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2 bg-canvas-secondary/35">
                      <span className="text-[10px] text-text-muted font-bold tracking-wider uppercase">{direction === 'rtl' ? 'في الانتظار' : 'Queue Position'}</span>
                      <Badge status="pending">{direction === 'rtl' ? 'قيد الانتظار' : 'Pending'}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* SECTION D: Form Fields & Inputs */}
              <Card>
                <CardHeader>
                  <CardTitle>{direction === 'rtl' ? 'د. عناصر الإدخال والنماذج' : 'D. Form Controls & Fields'}</CardTitle>
                  <CardDescription>{direction === 'rtl' ? 'حقول نصية سهلة الاستخدام مع إشارات التحقق والتركيز' : 'Accessible inputs with custom validation outlines.'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    label={direction === 'rtl' ? 'البريد الإلكتروني لنظام VFS' : 'VFS Portal Email'}
                    placeholder="operator@velix-automation.com"
                    helperText={direction === 'rtl' ? 'أدخل البريد المستخدم للدخول في بوابة حجز المواعيد' : 'Specify registered credentials used in scheduler.'}
                  />

                  <Input
                    label={direction === 'rtl' ? 'اسم المستخدم (للتحقق)' : 'Username (Validation Test)'}
                    placeholder="admin"
                    value={inputVal}
                    error={inputErr}
                    onChange={(e) => handleValidateInput(e.target.value)}
                    leftIcon={<SearchIcon size={16} />}
                  />

                  <Input
                    label={direction === 'rtl' ? 'كلمة المرور المشفرة' : 'Encrypted Password'}
                    type="password"
                    disabled
                    value="supersecretpassword"
                    helperText={direction === 'rtl' ? 'تم تشفير هذا الحقل من أجل الأمان.' : 'Inputs are masked for active sessions.'}
                  />
                </CardContent>
              </Card>

              {/* SECTION E: Visa Destinations CountryCards */}
              <Card className="xl:col-span-2">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle>{direction === 'rtl' ? 'هـ. بطاقات بلدان وجهات التأشيرة' : 'E. Visa Destination Flags'}</CardTitle>
                      <CardDescription>{direction === 'rtl' ? 'حدد وجهة للتحقق من المواعيد المتاحة وتتبع الحالات تفاعلياً' : 'Interactive cards with responsive glowing rings. Click to toggle selection.'}</CardDescription>
                    </div>
                    <div className="text-xs bg-canvas-tertiary px-3 py-1.5 rounded-lg border border-border-default/50">
                      {direction === 'rtl' ? 'الوجهة المحددة حالياً:' : 'Active Target:'}{' '}
                      <span className="font-bold text-primary-500">{activeCountry}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {countries.map((c) => (
                      <CountryCard
                        key={c.code}
                        countryCode={c.code}
                        countryName={direction === 'rtl' ? c.nameAr : c.nameEn}
                        active={activeCountry === c.code}
                        slotsAvailable={c.code === 'PK' ? 4 : c.code === 'MA' ? 12 : 0}
                        lastChecked={c.code === 'PK' ? (direction === 'rtl' ? 'منذ دقيقة' : '1m ago') : (direction === 'rtl' ? 'منذ ساعتين' : '2h ago')}
                        onClick={() => {
                          setActiveCountry(c.code);
                          triggerToast(
                            direction === 'rtl' 
                              ? `تم اختيار وجهة البحث: ${c.nameAr}` 
                              : `Destination target set to ${c.nameEn}`
                          );
                        }}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* SECTION F: Card Depths & Interaction */}
              <Card className="xl:col-span-2">
                <CardHeader>
                  <CardTitle>{direction === 'rtl' ? 'و. درجات عمق الحاويات' : 'F. Container Shadow Depths & Interaction'}</CardTitle>
                  <CardDescription>{direction === 'rtl' ? 'أنواع الهياكل المختلفة ومستويات الظلال والتركيز' : 'Comparison of container depth variants and click feedbacks.'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Standard Card */}
                    <Card>
                      <CardHeader className="p-5">
                        <CardTitle className="text-base">{direction === 'rtl' ? 'صندوق قياسي' : 'Standard Card'}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-5 pt-0">
                        <p className="text-xs text-text-secondary leading-relaxed">
                          {direction === 'rtl' 
                            ? 'هيكل أساسي بحدود رقيقة وثابتة. يستخدم بشكل افتراضي للمعلومات وعرض البيانات الثابتة.' 
                            : 'Baseline layout structure with standard border. Used typically for flat informational listings.'}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Hoverable Card */}
                    <Card hoverable>
                      <CardHeader className="p-5">
                        <CardTitle className="text-base">{direction === 'rtl' ? 'صندوق حركي' : 'Hoverable Card'}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-5 pt-0">
                        <p className="text-xs text-text-secondary leading-relaxed">
                          {direction === 'rtl' 
                            ? 'يرتفع ويزداد عمق الظل برفق عند تمرير مؤشر الفأرة للإشارة البصرية لقابلية القراءة.' 
                            : 'Elevates shadows and broadens borders on hover. Perfect for components that need simple readability enhancements.'}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Interactive Card */}
                    <Card interactive onClick={() => triggerToast(direction === 'rtl' ? 'تم تفعيل العنصر التفاعلي!' : 'Interactive card action triggered!')}>
                      <CardHeader className="p-5">
                        <CardTitle className="text-base">{direction === 'rtl' ? 'صندوق تفاعلي كامل' : 'Interactive Action Card'}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-5 pt-0">
                        <p className="text-xs text-text-secondary leading-relaxed">
                          {direction === 'rtl' 
                            ? 'عنصر نقر نشط يتميز بتغيير المقياس والارتفاع مع استجابة عند الضغط لتبدو حقيقية.' 
                            : 'Full hover transformations and click scaling. Perfect for buttons, items, list select actions.'}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              {/* SECTION G: Micro-interactions and Motion SandBox */}
              <Card className="xl:col-span-2">
                <CardHeader>
                  <CardTitle>{direction === 'rtl' ? 'ز. معمل حركات الرسوم الصغرى' : 'G. Micro-Interactions & Motion sandbox'}</CardTitle>
                  <CardDescription>{direction === 'rtl' ? 'محاكاة لحالات تحميل البيانات والبحث وحركة الشظايا' : 'Reviewing motion and feedback loops.'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Shimmer Skeleton Loading */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">{direction === 'rtl' ? 'مؤشر تحميل الهيكل المتوهج' : 'Shimmer Skeleton Loader'}</h4>
                      <div className="border border-border-default rounded-xl p-5 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full shimmer-bg shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3 w-1/3 rounded shimmer-bg" />
                            <div className="h-2 w-1/2 rounded shimmer-bg" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-2.5 w-full rounded shimmer-bg" />
                          <div className="h-2.5 w-full rounded shimmer-bg" />
                          <div className="h-2.5 w-4/5 rounded shimmer-bg" />
                        </div>
                      </div>
                    </div>

                    {/* Subtle Pulse Animation Indicator */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">{direction === 'rtl' ? 'نبض البحث النشط' : 'Subtle Pulse Status Indicator'}</h4>
                      <div className="border border-border-default rounded-xl p-5 flex flex-col items-center justify-center h-[142px] bg-canvas-secondary/20">
                        <div className="relative">
                          <div className="absolute inset-0 rounded-full bg-primary-500/25 animate-pulse-subtle scale-150" />
                          <div className="relative h-12 w-12 rounded-full bg-primary-500 flex items-center justify-center text-white shadow-md shadow-primary-500/30">
                            <SearchIcon size={24} />
                          </div>
                        </div>
                        <span className="text-xs font-bold text-text-primary mt-4">
                          {direction === 'rtl' ? 'جار فحص المواعيد...' : 'Scanning Portal Registry...'}
                        </span>
                      </div>
                    </div>

                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </main>
      </div>

      {/* Dynamic Toast Notifications (Bidirectional sliding) */}
      {toastMessage && (
        <div
          key={toastId}
          className={cn(
            'fixed top-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border bg-canvas-secondary text-text-primary shadow-xl border-border-default max-w-sm animate-toast-slide',
            direction === 'rtl' ? 'left-6' : 'right-6'
          )}
        >
          <div className="h-6 w-6 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <p className="text-xs font-bold truncate pr-2">{toastMessage}</p>
          <button
            onClick={() => setToastMessage(null)}
            className="text-text-muted hover:text-text-primary transition-all p-1"
            aria-label="Dismiss Toast"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      )}
    </div>
  );
};
