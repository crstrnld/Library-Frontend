import React, { useState, useEffect } from 'react';
import { Calendar, BookOpen, AlertCircle } from 'lucide-react';
import axiosInstance from '../api/axiosConfig';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function BorrowHistoryPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('borrowed');

  useEffect(() => {
    fetchHistory();
  }, [activeTab]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/borrow/history/my', {
        params: { status: activeTab === 'all' ? undefined : activeTab },
      });
      setRecords(data.data);
    } catch (error) {
      toast.error('Failed to fetch borrow history');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (recordId) => {
    try {
      await axiosInstance.post('/borrow/return', { borrowRecordId: recordId });
      toast.success('Book returned successfully! ');
      fetchHistory();
    } catch (error) {
      toast.error(error.response?. data?.message || 'Failed to return book');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg: px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">My Library</h1>
        <p className="text-lg text-gray-600">Track and manage your borrowed books</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-8 border-b border-gray-200">
        {['borrowed', 'returned', 'all'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-semibold border-b-2 transition-smooth capitalize ${
              activeTab === tab
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab === 'all' ? 'All Books' : tab}
          </button>
        ))}
      </div>

      {/* Records */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : records.length === 0 ? (
        <Card className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No books yet</h2>
          <p className="text-gray-600">Start borrowing from our collection</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <BorrowRecordCard
              key={record.id}
              record={record}
              onReturn={() => handleReturn(record.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BorrowRecordCard({ record, onReturn }) {
  const isOverdue = new Date(record. dueDate) < new Date() && record.status === 'borrowed';
  const daysLeft = Math.ceil(
    (new Date(record.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className="flex items-center justify-between p-6">
      <div className="flex items-center space-x-6 flex-1">
        {/* Icon */}
        <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg flex items-center justify-center">
          <BookOpen className="w-8 h-8 text-primary-600" />
        </div>

        {/* Info */}
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-lg">{record.Book.title}</h3>
          <p className="text-gray-600">{record.Book.author}</p>
          <div className="flex items-center space-x-4 mt-2">
            <Badge variant={record.status === 'returned' ? 'success' : 'warning'}>
              {record.status}
            </Badge>
            {isOverdue && (
              <Badge variant="danger" className="flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>Overdue</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="text-right space-y-2">
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Borrowed: {new Date(record.borrowDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Due: {new Date(record.dueDate).toLocaleDateString()}</span>
          </div>
          {record.status === 'borrowed' && (
            <p className={`font-semibold ${isOverdue ? 'text-red-600' : 'text-green-600'}`}>
              {isOverdue ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      {record.status === 'borrowed' && (
        <Button size="sm" className="ml-4" onClick={onReturn}>
          Return
        </Button>
      )}
    </Card>
  );
}