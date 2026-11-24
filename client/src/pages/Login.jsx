import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { loginStart, loginSuccess, loginFailure, clearError } from '../features/authSlice';
import { authAPI } from '../api';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);

  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart());

    try {
      const res = isRegister
        ? await authAPI.register(form)
        : await authAPI.login({ email: form.email, password: form.password });

      dispatch(loginSuccess(res.data.data));
      navigate('/dashboard');
    } catch (err) {
      dispatch(loginFailure(err.response?.data?.message || 'Something went wrong'));
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-sp-9">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        className="w-full max-w-md"
      >
        <div className="panel">
          <div className="flex items-center justify-between px-sp-6 py-sp-3 bg-surface-secondary border-b border-surface-border">
            <span className="font-mono text-xs text-muted">valuepro / auth</span>
            <span className="font-mono text-xs text-accent">{isRegister ? 'REGISTER' : 'LOGIN'}</span>
          </div>

          <div className="p-sp-8 space-y-sp-8">
            <div>
              <span className="mono-label !text-accent">// ACCOUNT ACCESS</span>
              <h1 className="text-2xl font-display font-semibold mt-sp-3">
                {isRegister ? 'Create account' : 'Welcome back'}
              </h1>
              <p className="text-sm text-muted mt-sp-3">
                {isRegister
                  ? 'Start your investment analysis journey.'
                  : 'Login to save and track your calculations.'}
              </p>
            </div>

            {error && (
              <div role="alert" className="border-l-2 border-accent bg-accent/10 px-sp-5 py-sp-3 font-mono text-sm text-accent">
                ! {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-sp-6">
              {isRegister && (
                <div className="relative">
                  <User size={15} className="absolute left-sp-5 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    name="name"
                    type="text"
                    placeholder="Full name"
                    value={form.name}
                    onChange={handleChange}
                    className="input-field pl-sp-9 font-mono"
                    required
                    disabled={loading}
                  />
                </div>
              )}

              <div className="relative">
                <Mail size={15} className="absolute left-sp-5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  name="email"
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={handleChange}
                  className="input-field pl-sp-9 font-mono"
                  required
                  disabled={loading}
                />
              </div>

              <div className="relative">
                <Lock size={15} className="absolute left-sp-5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  className="input-field pl-sp-9 pr-sp-9 font-mono"
                  required
                  minLength={6}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-sp-5 top-1/2 -translate-y-1/2 text-muted hover:text-accent transition-colors duration-150"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full h-11">
                {loading ? (
                  <span className="w-sp-5 h-sp-5 border-2 border-onaccent/30 border-t-onaccent rounded-full animate-spin" />
                ) : (
                  <>
                    {isRegister ? 'Create account' : 'Login'}
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            <div className="hairline pt-sp-6">
              <p className="text-sm text-muted">
                {isRegister ? 'Already have an account?' : "Don't have an account?"}
                <button
                  onClick={() => {
                    setIsRegister(!isRegister);
                    dispatch(clearError());
                  }}
                  className="ml-sp-3 text-accent font-semibold hover:underline transition-colors duration-150"
                >
                  {isRegister ? 'Login' : 'Register'}
                </button>
              </p>
            </div>

            <div className="bg-surface-secondary border border-surface-border rounded-sm p-sp-5 font-mono text-xs text-muted space-y-sp-1">
              <p className="text-ink">// demo credentials</p>
              <p>email &nbsp; demo@valuepro.in</p>
              <p>password &nbsp; demo123456</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
