import React from 'react';
import { BookOpen, Users, LayoutDashboard, ArrowLeftRight, LogOut, Library, RefreshCcw } from 'lucide-react';
import { LibraryService } from '../services/libraryService';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  user: any;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate, onLogout, user }) => {
  const navItems = [
    { id: 'dashboard', label: 'Panel', icon: LayoutDashboard },
    { id: 'circulation', label: 'Ödünç İşlemleri', icon: ArrowLeftRight },
    { id: 'books', label: 'Kitap Envanteri', icon: BookOpen },
    { id: 'students', label: 'Öğrenciler', icon: Users },
  ];

  const handleResetData = () => {
    if(window.confirm("TÜM VERİLER SİLİNECEK ve fabrika ayarlarına dönülecek. Onaylıyor musunuz?")) {
      LibraryService.resetDatabase();
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-900 text-white flex flex-col shadow-xl no-print">
        <div className="p-6 flex items-center space-x-3 border-b border-indigo-800">
          <div className="bg-indigo-500 p-2 rounded-lg">
            <Library size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg">LibraTech</h1>
            <p className="text-xs text-indigo-300">Okul Kütüphanesi</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-indigo-700 text-white shadow-md' 
                    : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-indigo-800 space-y-2">
          <div className="flex items-center space-x-3 px-4 py-3 mb-2">
            <img 
              src={`https://ui-avatars.com/api/?name=${user.name}&background=random`} 
              alt="Profile" 
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-indigo-300 truncate">{user.email}</p>
            </div>
          </div>
          
          <button
            onClick={handleResetData}
            className="w-full flex items-center space-x-3 px-4 py-2 text-indigo-300 hover:bg-indigo-950 hover:text-white rounded-lg transition-colors"
            title="Veritabanını Sıfırla"
          >
            <RefreshCcw size={18} />
            <span className="text-xs">Verileri Sıfırla</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-2 text-red-300 hover:bg-indigo-950 hover:text-red-200 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};