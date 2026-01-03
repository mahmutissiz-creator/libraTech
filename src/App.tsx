import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Circulation } from './pages/Circulation';
import { BookInventory } from './pages/BookInventory';
import { Students } from './pages/Students';
import { User } from './types';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    // Firebase Auth Listener
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Admin',
          email: firebaseUser.email || '',
          role: 'ADMIN'
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth);
    setCurrentPage('dashboard');
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Yükleniyor...</div>;

  if (!user) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'circulation': return <Circulation />;
      case 'books': return <BookInventory />;
      case 'students': return <Students />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout 
      currentPage={currentPage} 
      onNavigate={setCurrentPage} 
      onLogout={handleLogout}
      user={user}
    >
      {renderPage()}
    </Layout>
  );
};

export default App;