import { useState } from 'react';
import { BookOpen, Mail, Lock, User, Eye, EyeOff, GraduationCap, Loader2 } from 'lucide-react';
import { INDIVIDUAL_GRADES } from '@/types';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; role?: 'student' | 'teacher' | 'admin'; error?: string; pending?: boolean }>;
  onRegister: (name: string, email: string, password: string, role: 'student' | 'teacher' | 'admin', grade?: string) => Promise<{ success: boolean; error?: string; pending?: boolean; autoVerified?: boolean }>;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setPendingMessage('');

    try {
      if (isRegistering) {
        const result = await onRegister(name, email, password, role, grade);
        
        if (result.success) {
          if (result.pending) {
            setPendingMessage('Your account is pending admin approval. You will be able to login once approved.');
            setIsRegistering(false);
          } else {
            // Auto-verified student - already logged in by register function
          }
        } else {
          setError(result.error || 'Registration failed');
        }
      } else {
        const result = await onLogin(email, password);
        
        if (!result.success) {
          if (result.pending) {
            setPendingMessage(result.error || '');
          } else {
            setError(result.error || 'Login failed');
          }
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1a1a1a] text-white mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">
            {isRegistering ? 'Create Account' : 'Welcome Back!'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isRegistering ? 'Sign up to get started' : 'Sign in to access your school portal'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-100 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Pending Message */}
        {pendingMessage && (
          <div className="mb-4 p-4 rounded-xl bg-yellow-100 text-yellow-800 text-sm">
            {pendingMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name field - registration only */}
          {isRegistering && (
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 rounded-xl border-2 border-[rgba(26,26,26,0.1)] focus:border-[#1a1a1a] focus:outline-none transition-colors"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>
          )}

          {/* Email field */}
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 pl-10 pr-4 rounded-xl border-2 border-[rgba(26,26,26,0.1)] focus:border-[#1a1a1a] focus:outline-none transition-colors"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 pl-10 pr-12 rounded-xl border-2 border-[rgba(26,26,26,0.1)] focus:border-[#1a1a1a] focus:outline-none transition-colors"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Role selection - registration only */}
          {isRegistering && (
            <>
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                  Account Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['student', 'teacher', 'admin'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-2 px-4 rounded-xl border-2 text-sm font-medium capitalize transition-colors ${
                        role === r
                          ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white'
                          : 'border-[rgba(26,26,26,0.1)] hover:border-[rgba(26,26,26,0.3)]'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                {role === 'teacher' && (
                  <p className="mt-2 text-xs text-amber-600">
                    Teacher accounts require admin approval before login
                  </p>
                )}
                {role === 'admin' && (
                  <p className="mt-2 text-xs text-amber-600">
                    Admin registration is restricted. Contact system administrator for access.
                  </p>
                )}
              </div>

              {/* Grade selection - students only */}
              {role === 'student' && (
                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                    Grade Level
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full h-12 pl-10 pr-4 rounded-xl border-2 border-[rgba(26,26,26,0.1)] focus:border-[#1a1a1a] focus:outline-none transition-colors appearance-none bg-white"
                    >
                      {INDIVIDUAL_GRADES.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-[#1a1a1a] text-white rounded-xl font-medium hover:bg-[#2a2a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isRegistering ? 'Creating Account...' : 'Signing In...'}
              </>
            ) : (
              isRegistering ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>

        {/* Toggle */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
              setPendingMessage('');
            }}
            className="text-sm text-gray-600 hover:text-[#1a1a1a] transition-colors"
          >
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
            <span className="font-medium underline">
              {isRegistering ? 'Sign in' : 'Create one'}
            </span>
          </button>
        </div>

        {/* Demo info */}
        {!isRegistering && (
          <div className="mt-8 p-4 rounded-xl bg-blue-50 text-blue-700 text-xs text-center">
            <p className="font-medium mb-1">Demo Credentials</p>
            <p>Admin: admin@schoolportal.edu / admin</p>
          </div>
        )}
      </div>
    </div>
  );
}
