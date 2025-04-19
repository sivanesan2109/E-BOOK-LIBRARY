import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, LogOut, User } from 'lucide-react';
import Theme from './Theme';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="bg-white dark:bg-gray-950 shadow-sm">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between h-16 items-center">
      
      {/* Left - Logo */}
      <div className="flex items-center">
        <a href="/">
          <BookOpen className="h-8 w-8 text-blue-600" />
        </a>
        <span className="ml-2 text-xl font-bold text-gray-900 dark:text-gray-100">E-Book Reader</span>
      </div>

      {/* Theme Toggle Button */}
     <Theme/>

      {/* Right - User Info & Logout */}
      <div className="flex items-center">
        <div className="flex items-center">
          <User className="h-5 w-5 text-gray-500 dark:text-gray-100" />
          <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-100">{user?.email}</span>
        </div>
        <button
          onClick={handleSignOut}
          className="ml-4 flex items-center text-sm font-medium text-gray-700 dark:text-gray-100 hover:text-gray-500"
        >
          <LogOut className="h-5 w-5 mr-1" />
          Sign out
        </button>
      </div>

    </div>
  </div>
</header>


      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;