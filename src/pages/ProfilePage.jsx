import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Camera, Save, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axiosConfig';
import useAuthStore from '../store/authStore';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user:  currentUser } = useAuthStore();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const userId = currentUser?.id;

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance. get(`/users/${userId}`);
      setUser(data. data);
      setFormData({
        name:  data.data.name,
        email: data.data.email,
      });
      if (data.data.profileImage) {
        setPreviewImage(`http://localhost:3000${data.data.profileImage}`);
      }
    } catch (error) {
      toast.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData. email) {
      toast.error('Name and email are required');
      return;
    }

    setSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);

      if (profileImage) {
        formDataToSend.append('profileImage', profileImage);
      }

      const { data } = await axiosInstance.put(`/users/${userId}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUser(data.data);
      toast.success('✅ Profile updated successfully! ');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('All password fields are required');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    try {
      await axiosInstance.post(`/users/${userId}/change-password`, {
        currentPassword: passwordData. currentPassword,
        newPassword:  passwordData.newPassword,
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordForm(false);
      toast.success('✅ Password changed successfully!');
    } catch (error) {
      toast.error(error.response?.data?. message || 'Failed to change password');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">👤 My Profile</h1>

      {/* Profile Picture Section 
      <Card className="mb-8">
        <div className="text-center mb-6">
          <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-blue-500 bg-gray-100">
            {previewImage ? (
              <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Camera className="w-12 h-12" />
              </div>
            )}
          </div>
          <label className="inline-block">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-smooth font-semibold">
              📷 Change Photo
            </button>
          </label>
        </div>
      </Card>*/}

      {/* Profile Information Form */}
      <Card className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">✏️ Edit Profile</h2>

        <form onSubmit={handleSubmitProfile} className="space-y-6">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter your name"
            required
          />

          <Input
            label="Email Address"
            type="email"
            name="email"
            value={formData. email}
            onChange={handleInputChange}
            placeholder="Enter your email"
            required
          />

          <div className="flex gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => navigate('/books')}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" isLoading={submitting}>
              <Save className="w-5 h-5 inline mr-2" />
              Save Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Change Password Section */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🔐 Security</h2>

        {! showPasswordForm ? (
          <Button
            onClick={() => setShowPasswordForm(true)}
            variant="secondary"
            className="flex items-center space-x-2"
          >
            <Lock className="w-5 h-5" />
            <span>Change Password</span>
          </Button>
        ) : (
          <form onSubmit={handleSubmitPassword} className="space-y-6">
            <Input
              label="Current Password"
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              placeholder="Enter your current password"
              required
            />

            <Input
              label="New Password"
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              placeholder="Enter new password"
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="Confirm new password"
              required
            />

            <div className="flex gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword:  '',
                  });
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" isLoading={submitting}>
                Update Password
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}