import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axiosConfig';
import useAuthStore from '../store/authStore';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();

  const handleChange = (e) => {
    const { name, value } = e. target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]:  '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData. password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      console.log('🔐 Attempting login with:', formData. email);
      
      const { data } = await axiosInstance. post('/auth/login', {
        email: formData.email. trim(),
        password: formData. password,
      });

      console.log('✅ Login successful:', data);
      
      setToken(data.token);
      setUser(data.data);
      toast.success('✅ Login successful!');
      navigate('/books');
    } catch (error) {
      console.error('❌ Login failed:', error);
      
      const message = error.response?.data?.message || 
                     error.message || 
                     'Login failed - please try again';
      
      toast.error(message);
      
      if (error.response?.status === 404) {
        toast.error('❌ User not found.  Please check your email.');
      } else if (error.response?.status === 401) {
        toast.error('❌ Invalid email or password.');
      } else if (error.code === 'ECONNREFUSED') {
        toast.error('❌ Cannot connect to backend. Is it running on port 3001?');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Quick login for testing
  const quickLogin = (email, password) => {
    setFormData({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email Address"
            type="email"
            name="email"
            icon={Mail}
            value={formData. email}
            onChange={handleChange}
            error={errors.email}
            placeholder="you@example.com"
          />

          <Input
            label="Password"
            type="password"
            name="password"
            icon={Lock}
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="Enter your password"
          />

          <Button
            type="submit"
            size="lg"
            className="w-full"
            isLoading={isLoading}
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account? {' '}
            <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-700">
              Sign up here
            </Link>
          </p>
        </div>

        {/* Demo Credentials 
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm font-semibold text-blue-900 mb-3">🔐 Demo Accounts (Click to Auto-fill): </p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => quickLogin('admin@example.com', 'admin123456')}
              className="w-full text-left p-2 bg-white hover:bg-blue-100 rounded border border-blue-300 text-xs font-mono transition-smooth"
            >
              <p className="font-bold text-blue-900">👑 Admin</p>
              <p className="text-blue-800">admin@example.com</p>
              <p className="text-blue-800">admin123456</p>
            </button>
            <button
              type="button"
              onClick={() => quickLogin('librarian@example.com', 'librarian123456')}
              className="w-full text-left p-2 bg-white hover:bg-blue-100 rounded border border-blue-300 text-xs font-mono transition-smooth"
            >
              <p className="font-bold text-blue-900">📚 Librarian</p>
              <p className="text-blue-800">librarian@example.com</p>
              <p className="text-blue-800">librarian123456</p>
            </button>
            <button
              type="button"
              onClick={() => quickLogin('john@example.com', 'password123456')}
              className="w-full text-left p-2 bg-white hover:bg-blue-100 rounded border border-blue-300 text-xs font-mono transition-smooth"
            >
              <p className="font-bold text-blue-900">👤 Member</p>
              <p className="text-blue-800">john@example.com</p>
              <p className="text-blue-800">password123456</p>
            </button>
          </div>
        </div>*/}
      </Card>
    </div>
  );
}