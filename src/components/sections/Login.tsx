import { useState } from 'react';
import { BookOpen, Lock, Mail, Eye, EyeOff, UserPlus, User, GraduationCap, Shield, Clock } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; role?: 'student' | 'teacher' | 'admin'; error?: string; pending?: boolean }>;
  onRegister: (name: string, email: string, password: string, role: 'student' | 'teacher' | 'admin', grade?: string) => Promise<{ success: boolean; error: string | null; pending?: boolean }>;
}

export function Login({ onLogin, onRegister }: LoginProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [grade, setGrade] = useState('Grade 7');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingMessage, setPendingMessage] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPendingMessage('');
    setIsLoading(true);
    
    const result = await onLogin(email, password);
    if (!result.success) {
      if (result.pending) {
        setPendingMessage(result.error || 'Your account is pending approval.');
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    }
    setIsLoading(false);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPendingMessage('');
    setIsLoading(true);
    
    const result = await onRegister(name, email, password, role, grade);
    if (!result.success) {
      setError(result.error || 'Registration failed');
    } else if (result.pending) {
      setPendingMessage('Your teacher account has been created and is pending admin approval. You will receive an email once approved.');
      setIsRegistering(false);
      resetForm();
    }
    setIsLoading(false);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setRole('student');
    setGrade('Grade 7');
    setError('');
    setPendingMessage('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 lg:py-20">
      {/* Dot Grid Background */}
      <div className="absolute inset-0 dot-grid pointer-events-none" />
      
      <div className="relative w-full max-w-md">
        {/* Main Card */}
        <div className="card p-5 sm:p-8 lg:p-10">
          {/* Header */}
          <div className="text-center mb-5 sm:mb-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto mb-3 sm:mb-4 lg:mb-6 rounded-full bg-[var(--accent)] border-[3px] border-[rgba(26,26,26,0.85)] flex items-center justify-center">
              {isRegistering ? <UserPlus size={24} className="sm:w-7 sm:h-7 lg:w-9 lg:h-9" /> : <BookOpen size={24} className="sm:w-7 sm:h-7 lg:w-9 lg:h-9" />}
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black mb-1 sm:mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              {isRegistering ? 'Create Account' : 'Welcome Back!'}
            </h2>
            <p className="text-[var(--text-secondary)] text-xs sm:text-sm lg:text-base">
              {isRegistering ? 'Sign up to get started' : 'Sign in to access your school portal'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-100 border-[2px] border-red-300 text-red-700 text-xs sm:text-sm">
              {error}
            </div>
          )}

          {/* Pending Message */}
          {pendingMessage && (
            <div className="mb-4 p-3 rounded-xl bg-yellow-100 border-[2px] border-yellow-300 text-yellow-800 text-xs sm:text-sm flex items-start gap-2">
              <Clock size={16} className="flex-shrink-0 mt-0.5" />
              <span>{pendingMessage}</span>
            </div>
          )}

          {/* Login Form */}
          {!isRegistering && (
            <form onSubmit={handleLoginSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="micro-label block mb-1.5 sm:mb-2 text-[var(--text-secondary)] text-xs sm:text-sm">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-3 sm:left-4 top-0 bottom-0 flex items-center pointer-events-none">
                    <Mail className="text-[var(--text-secondary)] flex-shrink-0" size={16} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 sm:h-12 pl-9 sm:pl-11 pr-4 rounded-full border-[3px] border-[rgba(26,26,26,0.85)] text-sm bg-white focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/30"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="micro-label block mb-1.5 sm:mb-2 text-[var(--text-secondary)] text-xs sm:text-sm">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 sm:left-4 top-0 bottom-0 flex items-center pointer-events-none">
                    <Lock className="text-[var(--text-secondary)] flex-shrink-0" size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-10 sm:h-12 pl-9 sm:pl-11 pr-10 sm:pr-11 rounded-full border-[3px] border-[rgba(26,26,26,0.85)] text-sm bg-white focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/30"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 sm:right-4 top-0 bottom-0 flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 sm:h-12 mt-2 bg-[var(--accent)] text-[var(--text-primary)] font-black rounded-full border-[3px] border-[rgba(26,26,26,0.85)] flex items-center justify-center gap-2 text-sm hover:translate-y-[-2px] hover:shadow-md transition-all disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[var(--text-primary)] border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          )}

          {/* Register Form */}
          {isRegistering && (
            <form onSubmit={handleRegisterSubmit} className="space-y-2 sm:space-y-3">
              <div>
                <label className="micro-label block mb-1 sm:mb-1.5 text-[var(--text-secondary)] text-xs sm:text-sm">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute left-3 sm:left-4 top-0 bottom-0 flex items-center pointer-events-none">
                    <User className="text-[var(--text-secondary)] flex-shrink-0" size={16} />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-10 sm:h-12 pl-9 sm:pl-11 pr-4 rounded-full border-[3px] border-[rgba(26,26,26,0.85)] text-sm bg-white focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/30"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="micro-label block mb-1 sm:mb-1.5 text-[var(--text-secondary)] text-xs sm:text-sm">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-3 sm:left-4 top-0 bottom-0 flex items-center pointer-events-none">
                    <Mail className="text-[var(--text-secondary)] flex-shrink-0" size={16} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 sm:h-12 pl-9 sm:pl-11 pr-4 rounded-full border-[3px] border-[rgba(26,26,26,0.85)] text-sm bg-white focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/30"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="micro-label block mb-1 sm:mb-1.5 text-[var(--text-secondary)] text-xs sm:text-sm">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 sm:left-4 top-0 bottom-0 flex items-center pointer-events-none">
                    <Lock className="text-[var(--text-secondary)] flex-shrink-0" size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-10 sm:h-12 pl-9 sm:pl-11 pr-10 sm:pr-11 rounded-full border-[3px] border-[rgba(26,26,26,0.85)] text-sm bg-white focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/30"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 sm:right-4 top-0 bottom-0 flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="micro-label block mb-1 sm:mb-1.5 text-[var(--text-secondary)] text-xs sm:text-sm">
                  Account Type
                </label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`flex items-center justify-center gap-1.5 sm:gap-2 h-10 sm:h-12 px-2 sm:px-3 rounded-xl border-[3px] transition-all ${
                      role === 'student' 
                        ? 'bg-[var(--accent)] border-[rgba(26,26,26,0.85)]' 
                        : 'bg-white border-[rgba(26,26,26,0.2)] hover:border-[rgba(26,26,26,0.5)]'
                    }`}
                  >
                    <GraduationCap size={16} className="flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-bold whitespace-nowrap">Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('teacher')}
                    className={`flex items-center justify-center gap-1.5 sm:gap-2 h-10 sm:h-12 px-2 sm:px-3 rounded-xl border-[3px] transition-all ${
                      role === 'teacher' 
                        ? 'bg-[var(--accent)] border-[rgba(26,26,26,0.85)]' 
                        : 'bg-white border-[rgba(26,26,26,0.2)] hover:border-[rgba(26,26,26,0.5)]'
                    }`}
                  >
                    <User size={16} className="flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-bold whitespace-nowrap">Teacher</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`flex items-center justify-center gap-1.5 sm:gap-2 h-10 sm:h-12 px-2 sm:px-3 rounded-xl border-[3px] transition-all ${
                      role === 'admin' 
                        ? 'bg-[var(--accent)] border-[rgba(26,26,26,0.85)]' 
                        : 'bg-white border-[rgba(26,26,26,0.2)] hover:border-[rgba(26,26,26,0.5)]'
                    }`}
                  >
                    <Shield size={16} className="flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-bold whitespace-nowrap">Admin</span>
                  </button>
                </div>
                {role === 'teacher' && (
                  <p className="mt-2 text-[10px] sm:text-xs text-yellow-600 flex items-center gap-1">
                    <Clock size={12} />
                    Teacher accounts require admin approval before login
                  </p>
                )}
                {role === 'admin' && (
                  <p className="mt-2 text-[10px] sm:text-xs text-orange-600 flex items-center gap-1">
                    <Shield size={12} />
                    Admin registration is restricted. Contact system administrator for access.
                  </p>
                )}
              </div>

              {/* Grade Selection (only for students) */}
              {role === 'student' && (
                <div>
                  <label className="micro-label block mb-1 sm:mb-1.5 text-[var(--text-secondary)] text-xs sm:text-sm">
                    Grade Level
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full h-10 sm:h-12 px-4 rounded-full border-[3px] border-[rgba(26,26,26,0.85)] text-sm bg-white focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/30 appearance-none cursor-pointer"
                  >
                    <optgroup label="High School (Junior)">
                      <option value="Grade 7">Grade 7</option>
                      <option value="Grade 8">Grade 8</option>
                      <option value="Grade 9">Grade 9</option>
                      <option value="Grade 10">Grade 10</option>
                    </optgroup>
                    <optgroup label="Senior High School">
                      <option value="Grade 11">Grade 11</option>
                      <option value="Grade 12">Grade 12</option>
                    </optgroup>
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 sm:h-12 mt-2 bg-[var(--accent)] text-[var(--text-primary)] font-black rounded-full border-[3px] border-[rgba(26,26,26,0.85)] flex items-center justify-center gap-2 text-sm hover:translate-y-[-2px] hover:shadow-md transition-all disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[var(--text-primary)] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus size={16} />
                    <span className="whitespace-nowrap">Create Account</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Toggle Login/Register */}
          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              {isRegistering ? 'Already have an account?' : "Don't have an account?"}
            </p>
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                resetForm();
              }}
              className="mt-1 sm:mt-2 text-xs sm:text-sm font-bold text-[var(--text-primary)] hover:underline"
            >
              {isRegistering ? 'Sign In' : 'Create Account'}
            </button>
          </div>

          {/* Demo Info */}
          {!isRegistering && (
            <div className="mt-4 sm:mt-6">
              <div className="p-2 sm:p-3 rounded-xl bg-[var(--card-mint)] border-[2px] border-[rgba(26,26,26,0.85)]">
                <p className="text-[10px] sm:text-xs text-center">
                  <span className="font-bold">Demo:</span> Register first, then login with your credentials
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 lg:-top-6 lg:-right-6 w-12 h-12 sm:w-16 sm:h-16 lg:w-24 lg:h-24 rounded-2xl bg-[var(--card-mint)] border-[3px] border-[rgba(26,26,26,0.85)] -z-10 rotate-12" />
        <div className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 lg:-bottom-6 lg:-left-6 w-10 h-10 sm:w-14 sm:h-14 lg:w-20 lg:h-20 rounded-2xl bg-[var(--card-lavender)] border-[3px] border-[rgba(26,26,26,0.85)] -z-10 -rotate-12" />
      </div>
    </div>
  );
}
