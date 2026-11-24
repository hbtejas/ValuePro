import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Sun, Moon, Menu, LogOut, ArrowRight } from 'lucide-react';
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
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setShowSearch(false);
        setShowProfile(false);
        setActiveIndex(-1);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    setActiveIndex(-1);
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

  const selectStock = (stock) => {
    setSearchQuery('');
    setShowSearch(false);
    setActiveIndex(-1);
    inputRef.current?.blur();
    navigate(`/calculator/intrinsic-value?ticker=${stock.ticker}`);
  };

  const handleSearchKeys = (e) => {
    if (e.key === 'ArrowDown' && searchResults.length > 0) {
      e.preventDefault();
      setShowSearch(true);
      setActiveIndex((i) => Math.min(i + 1, searchResults.length - 1));
    } else if (e.key === 'ArrowUp' && searchResults.length > 0) {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0 && searchResults[activeIndex]) {
      e.preventDefault();
      selectStock(searchResults[activeIndex]);
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-canvas/95 backdrop-blur border-b border-surface-border">
      <div className="flex items-center justify-between px-sp-6 lg:px-sp-8 h-16 gap-sp-6">
        <div className="flex items-center gap-sp-5 flex-1 min-w-0">
          <Link
            to="/"
            className="w-8 h-8 rounded-sm bg-accent flex items-center justify-center shrink-0"
            aria-label="ValuePro home"
          >
            <span className="text-onaccent font-mono font-semibold text-base leading-none">V</span>
          </Link>

          <button onClick={onMenuToggle} className="btn-ghost !px-2 lg:hidden" aria-label="Open navigation">
            <Menu size={18} />
          </button>

          <div className="relative flex-1 max-w-md" ref={searchRef}>
            <div className="relative">
              <Search size={15} className="absolute left-sp-5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search NSE / BSE stocks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowSearch(true)}
                onKeyDown={handleSearchKeys}
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={showSearch}
                aria-controls="stock-search-results"
                aria-label="Search stocks"
                data-search="stocks"
                className="w-full pl-sp-9 pr-sp-9 py-sp-3 rounded-sm bg-surface border border-surface-border
                           text-sm placeholder:text-muted
                           hover:border-muted/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40
                           transition-colors duration-150"
              />
              {!searchQuery && (
                <kbd className="absolute right-sp-5 top-1/2 -translate-y-1/2 font-mono text-xs text-muted border border-surface-border rounded-sm px-sp-2 py-0.5">
                  /
                </kbd>
              )}
            </div>

            <AnimatePresence>
              {showSearch && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  id="stock-search-results"
                  role="listbox"
                  className="absolute top-full mt-sp-3 w-full panel p-sp-2 max-h-64 overflow-y-auto z-50 shadow-xl"
                >
                  {searchResults.map((stock, index) => (
                    <button
                      key={stock.ticker}
                      role="option"
                      aria-selected={activeIndex === index}
                      onClick={() => selectStock(stock)}
                      className={`w-full text-left px-sp-5 py-sp-3 rounded-sm transition-colors duration-150 flex justify-between items-center gap-sp-5
                        ${activeIndex === index ? 'bg-surface-secondary text-accent' : 'hover:bg-surface-secondary'}`}
                    >
                      <div className="min-w-0">
                        <span className="font-mono text-accent font-semibold">{stock.ticker}</span>
                        <span className="text-sm text-muted ml-sp-3 truncate">{stock.name}</span>
                      </div>
                      <span className="font-mono text-xs uppercase text-muted shrink-0">{stock.exchange}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-sp-3">
          <button
            onClick={() => dispatch(toggleTheme())}
            className="btn-ghost !px-3"
            aria-label="Toggle theme"
          >
            {mode === 'dark' ? <Sun size={16} className="text-warning" /> : <Moon size={16} />}
          </button>

          {isAuthenticated ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfile(!showProfile)}
                aria-expanded={showProfile}
                className="flex items-center gap-sp-3 pl-sp-3 pr-sp-2 py-sp-2 rounded-sm hover:bg-surface-secondary transition-colors"
              >
                <div className="w-7 h-7 rounded-sm border border-accent/50 bg-accent/10 flex items-center justify-center">
                  <span className="text-accent font-mono text-sm font-semibold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium hidden sm:block">{user?.name?.split(' ')[0]}</span>
              </button>

              <AnimatePresence>
                {showProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute right-0 top-full mt-sp-3 w-48 panel p-sp-2 z-50 shadow-xl"
                  >
                    <div className="px-sp-5 py-sp-3 hairline mb-sp-2">
                      <p className="text-sm font-semibold truncate">{user?.name}</p>
                      <p className="font-mono text-xs text-muted truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-sp-5 py-sp-3 rounded-sm hover:bg-surface-secondary transition-colors text-sm flex items-center gap-sp-3 text-accent"
                    >
                      <LogOut size={14} />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button onClick={() => navigate('/login')} className="btn-primary !px-sp-5 !py-sp-3">
              <ArrowRight size={14} />
              <span className="hidden sm:inline">Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
