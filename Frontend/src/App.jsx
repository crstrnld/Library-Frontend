import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import useAuthStore from './store/authStore';
import axiosInstance from './api/axiosConfig';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BooksPage from './pages/BooksPage';
import BorrowHistoryPage from './pages/BorrowHistoryPage';
import ProfilePage from './pages/ProfilePage';
import ManageBooksPage from './pages/admin/ManageBooksPage';
import ManageUsersPage from './pages/admin/ManageUsersPage';

function App() {
  const { user, setUser, token } = useAuthStore();

  useEffect(() => {
    if (token && !user) {
      fetchCurrentUser();
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const { data } = await axiosInstance. get('/auth/me');
      setUser(data. data);
    } catch (error) {
      console.error('Failed to fetch user');
    }
  };

  // ==========================================
  // PROTECTED ROUTE UNTUK ADMIN/LIBRARIAN
  // ==========================================
  const ProtectedManageBooksRoute = () => {
    if (!user) return <Navigate to="/login" />;
    if (user.role !== 'admin' && user.role !== 'librarian') {
      return <Navigate to="/books" />;
    }
    return <ManageBooksPage />;
  };

  // ==========================================
  // PROTECTED ROUTE UNTUK ADMIN ONLY
  // ==========================================
  const ProtectedManageUsersRoute = () => {
    if (!user) return <Navigate to="/login" />;
    if (user.role !== 'admin') {
      return <Navigate to="/books" />;
    }
    return <ManageUsersPage />;
  };

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/books" element={<BooksPage />} />
        <Route
          path="/profile"
          element={user ? <ProfilePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/borrow"
          element={user ? <BorrowHistoryPage /> : <Navigate to="/login" />}
        />
        <Route path="/admin/books" element={<ProtectedManageBooksRoute />} />
        <Route path="/admin/users" element={<ProtectedManageUsersRoute />} />

        {/* 404 Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;