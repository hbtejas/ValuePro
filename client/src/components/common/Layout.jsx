import { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import MobileNav from './MobileNav';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem('valuepro_sidebar') === 'collapsed'
  );
  const mainRef = useRef(null);
  const { pathname } = useLocation();
  const { mode } = useSelector((s) => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }, [mode]);

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false);
        document.activeElement?.blur();
      }
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        e.preventDefault();
        const selector = pathname === '/dashboard' ? '[data-search="calculators"]' : '[data-search="stocks"]';
        document.querySelector(selector)?.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [pathname]);

  const toggleCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('valuepro_sidebar', next ? 'collapsed' : 'expanded');
      return next;
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60]
                   focus:bg-accent focus:text-onaccent focus:px-sp-5 focus:py-sp-3 focus:rounded-sm
                   focus:font-mono focus:text-sm"
      >
        Skip to content
      </a>

      <Sidebar
        isOpen={sidebarOpen}
        collapsed={sidebarCollapsed}
        onToggleMobile={() => setSidebarOpen(!sidebarOpen)}
        onToggleCollapse={toggleCollapse}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <main id="main-content" ref={mainRef} tabIndex={-1} className="flex-1 overflow-y-auto outline-none">
          <div className="max-w-7xl mx-auto px-sp-6 lg:px-sp-8 py-sp-8 pb-sp-9 lg:pb-sp-8">
            <Outlet />
          </div>
        </main>

        <MobileNav />
      </div>
    </div>
  );
}
