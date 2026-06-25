import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { OnboardingWizard } from './pages/onboarding/OnboardingWizard';
import { AppShell } from './components/layout/AppShell';
import { DashboardHome } from './pages/dashboard/DashboardHome';
import { Countries } from './pages/dashboard/Countries';
import { Bookings } from './pages/dashboard/Bookings';
import { Notifications } from './pages/dashboard/Notifications';
import { Settings } from './pages/dashboard/Settings';
import { isOnboardingComplete, setOnboardingComplete } from './lib/secureStorage';

export default function App() {
  const [onboardingComplete, setOnboardingCompleteState] = useState<boolean | null>(null);

  useEffect(() => {
    isOnboardingComplete().then((val) => {
      setOnboardingCompleteState(val);
    });
  }, []);

  if (onboardingComplete === null) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-canvas-base text-text-primary flex-col space-y-4">
        <svg
          className="animate-spin h-10 w-10 text-primary-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span className="text-sm font-semibold tracking-wide text-text-secondary animate-pulse">
          Loading application state...
        </span>
      </div>
    );
  }

  const handleFinishOnboarding = async () => {
    await setOnboardingComplete();
    setOnboardingCompleteState(true);
  };

  return (
    <HashRouter>
      <Routes>
        {/* Onboarding Flow */}
        <Route
          path="/onboarding"
          element={
            onboardingComplete ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <OnboardingWizard onFinish={handleFinishOnboarding} />
            )
          }
        />

        {/* Dashboard Pages */}
        <Route
          path="/dashboard"
          element={
            onboardingComplete ? (
              <AppShell />
            ) : (
              <Navigate to="/onboarding" replace />
            )
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="countries" element={<Countries />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Catch-all Redirect */}
        <Route
          path="*"
          element={<Navigate to={onboardingComplete ? "/dashboard" : "/onboarding"} replace />}
        />
      </Routes>
    </HashRouter>
  );
}
