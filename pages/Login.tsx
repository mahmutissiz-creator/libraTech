import React from 'react';
import { Library } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-8">
        <div className="text-center">
          <div className="mx-auto bg-indigo-600 w-16 h-16 rounded-xl flex items-center justify-center text-white mb-4">
            <Library size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Kütüphane Yönetimi</h2>
          <p className="mt-2 text-gray-600">Yönetmek için giriş yapın</p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={onLogin}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-lg shadow-indigo-200"
          >
            Google ile Giriş Yap
          </button>
          <button
            onClick={onLogin}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Email ile Giriş Yap
          </button>
        </div>

        <p className="text-center text-xs text-gray-400">
          Demo Uygulaması - Herhangi bir butona basarak Admin olarak giriş yapabilirsiniz.
        </p>
      </div>
    </div>
  );
};