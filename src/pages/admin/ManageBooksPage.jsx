import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, Image as ImageIcon, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosConfig';
import useAuthStore from '../../store/authStore';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import toast from 'react-hot-toast';


export default function ManageBooksPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [coverImage, setCoverImage] = useState(null);
  const [previewCoverImage, setPreviewCoverImage] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    description: '',
    publishedYear: '',
    totalCopies: '',
    availableCopies: '',
    category: '',
  });

  // ==========================================
  // CEK PERMISSION - HANYA ADMIN & LIBRARIAN
  // ==========================================
  useEffect(() => {
    if (! user || (user.role !== 'admin' && user.role !== 'librarian')) {
      toast.error('❌ You do not have permission to access this page');
      navigate('/books');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchBooks();
  }, [searchTerm]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance. get('/books', {
        params: { search:  searchTerm || undefined, limit: 100 },
      });
      setBooks(data. data);
    } catch (error) {
      toast.error('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (book = null) => {
    if (book) {
      setEditingBook(book);
      setFormData({
        title: book. title,
        author: book. author,
        isbn: book. isbn,
        description: book. description || '',
        publishedYear: book.publishedYear || '',
        totalCopies: book.totalCopies,
        availableCopies:  book.availableCopies,
        category: book.category || '',
      });
      if (book.coverImage) {
        setPreviewCoverImage(`https://library-backend-production-1103.up.railway.app${book.coverImage}`);
      }
    } else {
      setEditingBook(null);
      setFormData({
        title: '',
        author: '',
        isbn:  '',
        description: '',
        publishedYear: '',
        totalCopies: '',
        availableCopies: '',
        category: '',
      });
      setPreviewCoverImage(null);
    }
    setCoverImage(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBook(null);
    setCoverImage(null);
    setPreviewCoverImage(null);
    setFormData({
      title:  '',
      author: '',
      isbn: '',
      description: '',
      publishedYear: '',
      totalCopies: '',
      availableCopies: '',
      category: '',
    });
  };

  const handleCoverImageChange = (e) => {
    const file = e. target.files[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewCoverImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData. author || !formData.isbn) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (! formData.totalCopies || formData.totalCopies < 1) {
      toast.error('Total copies must be at least 1');
      return;
    }

    setSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData. title);
      formDataToSend.append('author', formData.author);
      formDataToSend.append('isbn', formData.isbn);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('publishedYear', formData.publishedYear);
      formDataToSend.append('totalCopies', formData.totalCopies);
      formDataToSend.append('availableCopies', formData.availableCopies || formData.totalCopies);
      formDataToSend.append('category', formData.category);

      if (coverImage) {
        formDataToSend.append('coverImage', coverImage);
      }

      if (editingBook) {
        await axiosInstance.put(`/books/${editingBook.id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('✅ Book updated successfully! ');
      } else {
        await axiosInstance.post('/books', formDataToSend, {
          headers: { 'Content-Type':  'multipart/form-data' },
        });
        toast.success('✅ Book created successfully!');
      }
      handleCloseModal();
      fetchBooks();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save book';
      toast.error(`❌ ${message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await axiosInstance.delete(`/books/${bookId}`);
        toast.success('✅ Book deleted successfully!');
        fetchBooks();
      } catch (error) {
        toast.error('❌ Failed to delete book');
      }
    }
  };

  if (! user || (user.role !== 'admin' && user.role !== 'librarian')) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">📚 Manage Books</h1>
          <p className="text-gray-600 mt-2">Add, edit, and manage your library collection</p>
          <p className="text-xs text-blue-600 font-semibold mt-1">
            🔒 Admin & Librarian Only
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} className="flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Add Book</span>
        </Button>
      </div>

      {/* Search */}
      <div className="mb-8">
        <Input
          type="text"
          placeholder="🔍 Search books by title or author..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e. target.value)}
          icon={Search}
        />
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[... Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : books.length === 0 ? (
        <Card className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">No books found</h2>
          <p className="text-gray-600 mt-2">Create your first book to get started</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <Card key={book.id} className="hover:shadow-lg transition-smooth flex flex-col">
              {/* Book Cover */}
              <div className="w-full h-48 border-2 border-dashed rounded-lg overflow-hidden flex items-center justify-center bg-gray-100">
                {previewCoverImage ? (
                  <img
                    src={previewCoverImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : book.coverImage ? (
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <BookOpen className="w-12 h-12 text-gray-400 opacity-50" />
                )}
              </div>
              {/* Book Info */}
              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{book.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{book.author}</p>

              <div className="space-y-2 mb-4 flex-grow">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">ISBN:</span>
                  <span className="font-mono text-gray-900">{book. isbn}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Category:</span>
                  <Badge variant="secondary">{book.category || 'N/A'}</Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Available: </span>
                  <Badge variant="primary">
                    {book.availableCopies}/{book.totalCopies}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Year:</span>
                  <span className="text-gray-900">{book. publishedYear || 'N/A'}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => handleOpenModal(book)}
                  className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-smooth font-semibold text-sm flex items-center justify-center"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(book.id)}
                  className="flex-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-smooth font-semibold text-sm flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">
                {editingBook ? '✏️ Edit Book' : '📖 Add New Book'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-smooth"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Cover Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📷 Book Cover Image
                </label>
                <div className="relative">
                  <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-smooth">
                    {previewCoverImage ? (
                      <img
                        src={previewCoverImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click to upload cover image</p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Max 5MB.  JPEG, PNG, GIF, WebP</p>
              </div>

              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  label="Title *"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter book title"
                  required
                />
                <Input
                  label="Author *"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  placeholder="Enter author name"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  label="ISBN *"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleInputChange}
                  placeholder="Enter ISBN"
                  required
                  disabled={!! editingBook}
                />
                <Input
                  label="Published Year"
                  type="number"
                  name="publishedYear"
                  value={formData.publishedYear}
                  onChange={handleInputChange}
                  placeholder="e. g., 2023"
                />
              </div>

              {/* Copies Information */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-4">📊 Copies Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Total Copies *"
                    type="number"
                    name="totalCopies"
                    value={formData.totalCopies}
                    onChange={handleInputChange}
                    placeholder="e.g., 5"
                    required
                    min="1"
                  />
                  <Input
                    label="Available Copies"
                    type="number"
                    name="availableCopies"
                    value={formData.availableCopies}
                    onChange={handleInputChange}
                    placeholder="e. g., 3"
                    min="0"
                    max={formData.totalCopies}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  💡 Available copies will be auto-set to total copies if not specified
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData. category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-smooth"
                >
                  <option value="">Select a category... </option>
                  <option value="Fiction">Fiction</option>
                  <option value="Non-fiction">Non-fiction</option>
                  <option value="Science">Science</option>
                  <option value="Technology">Technology</option>
                  <option value="Romance">Romance</option>
                  <option value="Fantasy">Fantasy</option>
                  <option value="Science Fiction">Science Fiction</option>
                  <option value="Mystery">Mystery</option>
                  <option value="Thriller">Thriller</option>
                  <option value="Biography">Biography</option>
                  <option value="Self-Help">Self-Help</option>
                  <option value="History">History</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus: border-blue-500 focus: ring-1 focus:ring-blue-500 transition-smooth"
                  rows="4"
                  placeholder="Enter book description..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={handleCloseModal}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  isLoading={submitting}
                >
                  {editingBook ? '✏️ Update Book' : '📖 Create Book'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );

}










