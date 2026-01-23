import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, BookOpen, Users, Settings, User } from 'lucide-react';
import useAuthStore from '../store/authStore';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  const isAdmin = user?. role === 'admin';
  const isLibrarian = user?.role === 'librarian';
  const canManageBooks = isAdmin || isLibrarian;

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/20 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-smooth">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl hidden sm:inline bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LibraryHub
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink to="/books" label="📚 Books" />
            {user && (
              <>
                <NavLink to="/borrow" label="📖 My Books" />
                {/* ==========================================
                    HANYA ADMIN & LIBRARIAN BISA LIHAT INI
                    ========================================== */}
                {canManageBooks && (
                  <NavLink to="/admin/books" label="⚙️ Manage Books" />
                )}
                {/* ==========================================
                    HANYA ADMIN BISA LIHAT INI
                    ========================================== */}
                {isAdmin && (
                  <NavLink to="/admin/users" label="👥 Users" />
                )}
              </>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="hidden sm:flex items-center space-x-3">
                  <img
                    src={user.profileImage ?   `http://localhost:3000${user.profileImage}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border-2 border-blue-500 object-cover"
                  />
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    {/* ==========================================
                        TAMPIL BADGE ROLE
                        ========================================== */}
                    <p className={`text-xs capitalize font-bold ${
                      user.role === 'admin'
                        ? 'text-red-600'
                        : user.role === 'librarian'
                        ? 'text-yellow-600'
                        : 'text-green-600'
                    }`}>
                      {user.role === 'admin' ? '👑 Admin' : user.role === 'librarian' ? '📚 Librarian' : '👤 Member'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/profile')}
                  className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-smooth"
                  title="Profile"
                >
                  <User className="w-5 h-5" />
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-smooth"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-smooth"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-smooth"
                >
                  Register
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-smooth"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-slide-up">
            <MobileNavLink to="/books" label="📚 Books" />
            {user && (
              <>
                <MobileNavLink to="/borrow" label="📖 My Books" />
                <MobileNavLink to="/profile" label="👤 Profile" />
                {canManageBooks && (
                  <MobileNavLink to="/admin/books" label="⚙️ Manage Books" />
                )}
                {isAdmin && <MobileNavLink to="/admin/users" label="👥 Users" />}
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({ to, label }) {
  return (
    <Link
      to={to}
      className="px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-smooth font-medium"
    >
      {label}
    </Link>
  );
}

function MobileNavLink({ to, label }) {
  return (
    <Link
      to={to}
      className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg transition-smooth"
    >
      {label}
    </Link>
  );
}