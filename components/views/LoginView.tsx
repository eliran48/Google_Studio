import React, { useState } from 'react';
import { auth } from '../../services/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const LoginView: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegistering) {
      if (password !== confirmPassword) {
        setError('הסיסמאות אינן תואמות.');
        return;
      }
      if (password.length < 6) {
        setError('הסיסמה חייבת להכיל לפחות 6 תווים.');
        return;
      }
      try {
        await createUserWithEmailAndPassword(auth, email, password);
      } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
          setError('כתובת האימייל כבר בשימוש.');
        } else {
          setError('אירעה שגיאה ברישום. נסה שוב.');
        }
        console.error("Registration error:", err);
      }
    } else {
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (err: any) {
        setError('אימייל או סיסמה שגויים.');
        console.error("Login error:", err);
      }
    }
  };

  const toggleForm = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-4xl font-extrabold text-gray-900 dark:text-white">
            TaskFlow
          </h1>
          <h2 className="mt-2 text-center text-xl text-gray-600 dark:text-gray-300">
            {isRegistering ? 'יצירת חשבון חדש' : 'התחברות למערכת'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <p className="text-center text-sm text-red-500">{error}</p>}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                כתובת אימייל
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="כתובת אימייל"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                סיסמה
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isRegistering ? "new-password" : "current-password"}
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${isRegistering ? '' : 'rounded-b-md'} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="סיסמה"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {isRegistering && (
              <div>
                <label htmlFor="confirm-password" className="sr-only">
                  אימות סיסמה
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="אימות סיסמה"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isRegistering ? 'הרשמה' : 'התחברות'}
            </button>
          </div>
          
          <div className="text-sm text-center">
            <button 
              type="button" 
              onClick={toggleForm} 
              className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
            >
              {isRegistering ? 'יש לך כבר חשבון? התחבר' : 'אין לך חשבון? הירשם'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginView;
