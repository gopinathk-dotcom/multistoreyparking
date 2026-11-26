import React, { useState, useEffect } from 'react';
import { ParkingProvider } from './context/ParkingContext';
import { Header } from './components/Header';
import { Sidebar, NavPage } from './components/Sidebar';
import { ToastContainer } from './components/ToastContainer';
import { ConfirmModal } from './components/ConfirmModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { ParkingLayoutPage } from './pages/ParkingLayoutPage';
import { VehicleEntryPage } from './pages/VehicleEntryPage';
import { VehicleExitPage } from './pages/VehicleExitPage';
import { ActiveVehiclesPage } from './pages/ActiveVehiclesPage';
import { ParkingHistoryPage } from './pages/ParkingHistoryPage';
import { WaitingQueuePage } from './pages/WaitingQueuePage';
import { RecentExitsPage } from './pages/RecentExitsPage';
import { ReservedSlotsPage } from './pages/ReservedSlotsPage';
import { ParkingAnalysisPage } from './pages/ParkingAnalysisPage';
import { DataStructuresLabPage } from './pages/DataStructuresLabPage';
import { SettingsPage } from './pages/SettingsPage';
import { useParking } from './context/ParkingContext';

function MainApp() {
  const { theme } = useParking();
  const [currentPage, setCurrentPage] = useState<NavPage>('dashboard');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [exitInitialPlate, setExitInitialPlate] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Keyboard shortcut Ctrl+K / Cmd+K for global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = (page: NavPage, params?: any) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (page === 'exit' && params?.regNo) {
      setExitInitialPlate(params.regNo);
    }
  };

  const handleNavigateToExitFromSearch = (regNo: string) => {
    setExitInitialPlate(regNo);
    setCurrentPage('exit');
  };

  // Dynamic attractive background theme classes
  const getThemeBackgroundClass = () => {
    switch (theme) {
      case 'modern-light':
        return 'bg-gradient-to-br from-[#edf2f7] via-[#f1f5f9] to-[#e2e8f0] text-slate-800';
      case 'emerald-dark':
        return 'bg-gradient-to-br from-[#02181d] via-[#062c33] to-[#0a383d] text-slate-100';
      case 'twilight-violet':
        return 'bg-gradient-to-br from-[#120a2e] via-[#1f1047] to-[#16124f] text-slate-100';
      case 'royal-slate':
      default:
        return 'bg-gradient-to-br from-[#0a1535] via-[#0f2454] to-[#1a1e5c] text-slate-100';
    }
  };

  return (
    <div className={`min-h-screen ${getThemeBackgroundClass()} flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white relative transition-colors duration-300`}>
      {/* Radiant ambient glow effect for attractive visual depth */}
      <div className="fixed inset-0 pointer-events-none opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent z-0" />

      {/* Top Header */}
      <Header onOpenSearch={() => setIsSearchOpen(true)} />

      {/* Mobile Menu Toggle Bar */}
      <div className="md:hidden bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-800">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Module: {currentPage.toUpperCase()}
        </span>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-xs font-bold px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
        >
          {mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Desktop & Mobile Drawer) */}
        <div
          className={`${
            mobileMenuOpen ? 'block' : 'hidden'
          } md:block shrink-0 z-20 md:z-auto`}
        >
          <Sidebar currentPage={currentPage} onSelectPage={handleNavigate} />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-65px)]">
          {currentPage === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
          {currentPage === 'layout' && <ParkingLayoutPage onNavigate={handleNavigate} />}
          {currentPage === 'entry' && <VehicleEntryPage onNavigate={handleNavigate} />}
          {currentPage === 'exit' && (
            <VehicleExitPage onNavigate={handleNavigate} initialRegNo={exitInitialPlate} />
          )}
          {currentPage === 'active' && <ActiveVehiclesPage onNavigate={handleNavigate} />}
          {currentPage === 'history' && <ParkingHistoryPage />}
          {currentPage === 'queue' && <WaitingQueuePage />}
          {currentPage === 'stack' && <RecentExitsPage />}
          {currentPage === 'reserved' && <ReservedSlotsPage />}
          {currentPage === 'analysis' && <ParkingAnalysisPage />}
          {currentPage === 'dslab' && <DataStructuresLabPage />}
          {currentPage === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Global Overlays */}
      <ToastContainer />
      <ConfirmModal />
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigateToExit={handleNavigateToExitFromSearch}
      />
    </div>
  );
}

export default function App() {
  return (
    <ParkingProvider>
      <MainApp />
    </ParkingProvider>
  );
}
