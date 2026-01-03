import React from 'react';
import { Library } from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

export const Login: React.FC = () => {
  
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Giriş hatası:", error);
      alert("Giriş yapılamadı. Konsolu kontrol edin.");
    }
  };

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
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-lg shadow-indigo-200"
          >
            Google ile Giriş Yap
          </button>
        </div>

        <p className="text-center text-xs text-gray-400">
          Uygulama Firebase bağlantısı gerektirir.
        </p>
      </div>
    </div>
  );
};