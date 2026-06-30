import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Search, Sun, Moon, Menu, User, LogOut } from 'lucide-react';
import { toggleTheme } from '../../features/themeSlice';
import { logout } from '../../features/authSlice';
import { stockAPI } from '../../api';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ onMenuToggle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { mode } = useSelector((s) => s.theme);
  const { isAuthenticated, user } = useSelector((s) => s.auth);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const searchRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 1) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const { data } = await stockAPI.search(searchQuery);
        setSearchResults(data.data || []);
        setShowSearch(true);
      } catch {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setShowProfile(false);
  };

  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-surface-dark-primary/80 backdrop-blur-xl border-b border-surface-border dark:border-surface-dark-border">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        {/* Left: Menu toggle + Search */}
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-xl hover:bg-surface-tertiary dark:hover:bg-surface-dark-tertiary transition-colors lg:hidden"
          >
            <Menu size={20} />
          </button>

          {/* Global Search */}
          <div className="relative flex-1 max-w-md" ref={searchRef}>
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search NSE/BSE stocks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowSearch(true)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-tertiary dark:bg-surface-dark-tertiary 
                           text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-accent/40
                           transition-all duration-200"
              />
            </div>

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {showSearch && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full mt-2 w-full glass-card p-2 max-h-64 overflow-y-auto z-50"
                >
                  {searchResults.map((stock) => (
                    <button
                      key={stock.ticker}
                      onClick={() => {
                        setSearchQuery('');
                        setShowSearch(false);
                        navigate(`/calculator/intrinsic-value?ticker=${stock.ticker}`);
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-surface-tertiary 
                                 dark:hover:bg-surface-dark-tertiary transition-colors flex justify-between items-center"
                    >
                      <div>
                        <span className="font-semibold text-sm">{stock.ticker}</span>
                        <span className="text-xs text-gray-500 ml-2">{stock.name}</span>
                      </div>
                      <span className="text-[10px] font-medium text-gray-400 uppercase">{stock.exchange}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Theme toggle + Auth */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2.5 rounded-xl hover:bg-surface-tertiary dark:hover:bg-surface-dark-tertiary transition-colors"
            aria-label="Toggle theme"
          >
            {mode === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
          </button>

          {isAuthenticated ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-2 pl-3 pr-2 py-2 rounded-xl hover:bg-surface-tertiary 
                           dark:hover:bg-surface-dark-tertiary transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-accent to-brand-teal flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium hidden sm:block">{user?.name?.split(' ')[0]}</span>
              </button>

              <AnimatePresence>
                {showProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute right-0 top-full mt-2 w-48 glass-card p-2"
                  >
                    <div className="px-3 py-2 border-b border-surface-border dark:border-surface-dark-border mb-1">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-tertiary 
                                 dark:hover:bg-surface-dark-tertiary transition-colors text-sm flex items-center gap-2 text-loss"
                    >
                      <LogOut size={14} />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-accent text-white text-sm font-medium 
                         hover:bg-brand-accent-hover transition-colors"
            >
              <User size={14} />
              <span className="hidden sm:block">Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
