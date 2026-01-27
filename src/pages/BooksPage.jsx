import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen } from 'lucide-react';
import axiosInstance from '../api/axiosConfig';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import Badge from '../components/Badge';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchBooks();
  }, [searchTerm, category, page]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/books', {
        params: {
          search: searchTerm || undefined,
          category: category || undefined,
          page,
          limit: 12,
        },
      });
      setBooks(data.data);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      toast.error('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Browse Our Collection</h1>
        <p className="text-lg text-gray-600">
          Discover thousands of books from various categories
        </p>
      </div>

      {/* Filters */}
      <div className="mb-12 grid md:grid-cols-3 gap-4">
        <Input
          type="text"
          placeholder="Search books, authors, or ISBN..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          icon={Search}
        />
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
        >
          <option value="">All Categories</option>
          <option value="Fiction">Fiction</option>
          <option value="Non-fiction">Non-fiction</option>
          <option value="Science">Science</option>
          <option value="History">History</option>
          <option value="Biography">Biography</option>
        </select>
        <Button variant="secondary" className="flex items-center justify-center space-x-2">
          <Filter className="w-4 h-4" />
          <span>Filters</span>
        </Button>
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="grid md:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-80 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No books found</h2>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {books.map((book) => (
              <BookCard key={book.id} book={book} user={user} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="text-gray-600 font-semibold">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function BookCard({ book, user }) {
  const [borrowing, setBorrowing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [dueDate, setDueDate] = useState('');

  const handleBorrow = async () => {
    if (!dueDate) {
      toast.error('Please select a due date');
      return;
    }

    setBorrowing(true);
    try {
      const response = await axiosInstance.post('/borrow', {
        bookId: book.id,
        dueDate,
      });

      toast.success('Book borrowed successfully!');
      console.log('Borrow success:', response.data);

      setShowModal(false);
      setDueDate('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to borrow book');
      console.error('Borrow error:', error.response?.data || error.message);
    } finally {
      setBorrowing(false);
    }
  };

  return (
    <>
      <Card className="h-full flex flex-col hover:scale-105 group">
        {/* Book Cover */}
        <div className="w-24 h-36 rounded-lg mb-4 overflow-hidden flex items-center justify-center bg-gray-100">
          {book.coverImage ? (
            <img
              src={`${process.env.REACT_APP_BACKEND_URL || 'https://library-backend-production-1103.up.railway.app'}${book.coverImage}`}
              alt={book.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <BookOpen className="w-12 h-12 text-gray-400 opacity-50" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3 mb-4">
          <h3 className="font-bold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-smooth">
            {book.title}
          </h3>
          <p className="text-sm text-gray-600">{book.author}</p>
          {book.category && (
            <Badge variant="secondary" className="text-xs">
              {book.category}
            </Badge>
          )}
        </div>

        {/* Info */}
        <div className="border-t border-gray-200 pt-4 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Available:</span>
            <span className="font-bold text-gray-900">
              {book.availableCopies}/{book.totalCopies}
            </span>
          </div>
        </div>

        {/* Action */}
        {book.availableCopies > 0 ? (
          <Button
            size="sm"
            className="w-full"
            onClick={() => setShowModal(true)}
            disabled={!user}
          >
            Borrow Book
          </Button>
        ) : (
          <Button size="sm" variant="secondary" className="w-full" disabled>
            Out of Stock
          </Button>
        )}
      </Card>

      {/* Borrow Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Borrow "{book.title}"
            </h2>
            <div className="space-y-4">
              <Input
                label="Due Date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  isLoading={borrowing}
                  onClick={handleBorrow}
                >
                  Confirm
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
