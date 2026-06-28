import React, { useState, useEffect } from 'react';
import { Users, Search, Lock, Trash2, Shield } from 'lucide-react';
import axiosInstance from '../../api/axiosConfig';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import toast from 'react-hot-toast';

export default function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/users', {
        params: { search:  searchTerm || undefined, limit:  100 },
      });
      setUsers(data. data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await axiosInstance.get('/users/statistics/all');
      setStats(data. data);
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await axiosInstance.patch(`/users/${userId}/status`);
      toast.success('✅ User status updated! ');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axiosInstance.delete(`/users/${userId}`);
        toast.success('✅ User deleted successfully! ');
        fetchUsers();
      } catch (error) {
        toast.error('❌ Failed to delete user');
      }
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await axiosInstance.put(`/users/${userId}/role`, { role: newRole });
      toast.success('✅ User role updated!');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin':
        return 'danger';
      case 'librarian':
        return 'warning';
      default:
        return 'primary';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm: px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">👥 Manage Users</h1>
        <p className="text-gray-600 mt-2">View and manage user accounts</p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card>
            <div className="text-center">
              <p className="text-gray-600 text-sm font-medium">Total Users</p>
              <p className="text-4xl font-bold text-blue-600 mt-2">
                {stats.totalUsers}
              </p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-gray-600 text-sm font-medium">Active Users</p>
              <p className="text-4xl font-bold text-green-600 mt-2">
                {stats.activeUsers}
              </p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-gray-600 text-sm font-medium">Inactive Users</p>
              <p className="text-4xl font-bold text-red-600 mt-2">
                {stats.inactiveUsers}
              </p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-gray-600 text-sm font-medium">Admins</p>
              <p className="text-4xl font-bold text-purple-600 mt-2">
                {stats. usersByRole?. admin || 0}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Search */}
      <div className="mb-8">
        <Input
          type="text"
          placeholder="🔍 Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={Search}
        />
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="space-y-4">
          {[... Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <Card className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">No users found</h2>
        </Card>
      ) : (
        <div className="overflow-x-auto shadow-soft rounded-lg">
          <table className="w-full bg-white">
            <thead className="bg-gradient-to-r from-blue-50 to-purple-50 border-b-2 border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-bold text-gray-900">Name</th>
                <th className="text-left py-4 px-6 font-bold text-gray-900">Email</th>
                <th className="text-center py-4 px-6 font-bold text-gray-900">Role</th>
                <th className="text-center py-4 px-6 font-bold text-gray-900">Status</th>
                <th className="text-right py-4 px-6 font-bold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-200 hover:bg-blue-50 transition-smooth"
                >
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-semibold text-gray-900">{user.name}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-600 text-sm">
                    {user.email}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <select
                      value={user.role}
                      onChange={(e) => handleChangeRole(user.id, e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded text-sm font-semibold"
                    >
                      <option value="member">Member</option>
                      <option value="librarian">Librarian</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Badge
                      variant={user.isActive ? 'success' : 'danger'}
                      className="text-xs"
                    >
                      {user.isActive ? '🟢 Active' : '🔴 Inactive'}
                    </Badge>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className={`p-2 rounded-lg transition-smooth font-semibold ${
                          user.isActive
                            ? 'hover:bg-red-100 text-red-600'
                            : 'hover:bg-green-100 text-green-600'
                        }`}
                        title={
                          user.isActive ?  'Deactivate' : 'Activate'
                        }
                      >
                        <Lock className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-smooth font-semibold"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}