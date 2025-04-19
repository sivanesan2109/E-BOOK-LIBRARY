import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Book, Search, Filter, CheckCircle } from 'lucide-react';




type Book = {
  id: string;
  title: string;
  author: string;
  category: string;
  url: string;
  read?: boolean;
  img_url:string;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [categories, setCategories] = useState<string[]>([]);
  const [showReadOnly, setShowReadOnly] = useState(false);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        // Fetch all books
        const { data: booksData, error: booksError } = await supabase
          .from('books')
          .select('*');

        if (booksError) throw booksError;

        // Fetch user's book data
        const { data: userBooksData, error: userBooksError } = await supabase
          .from('user_books')
          .select('*')
          .eq('user_id', user?.id);

        if (userBooksError) throw userBooksError;

        // Create a map of book_id to read status
        const userBooksMap = new Map();
        userBooksData?.forEach((userBook) => {
          userBooksMap.set(userBook.book_id, {
            read: userBook.read,
            highlights: userBook.highlights,
          });
        });

        // Combine the data
        const combinedBooks = booksData?.map((book) => ({
          ...book,
          read: userBooksMap.get(book.id)?.read || false,
        }));

        setBooks(combinedBooks || []);
        setFilteredBooks(combinedBooks || []);

        // Extract unique categories
        const uniqueCategories = [...new Set(booksData?.map((book) => book.category))];
        setCategories(uniqueCategories as string[]);
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBooks();
    }
  }, [user]);

  // Apply filters and search
  useEffect(() => {
    let result = [...books];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(term) ||
          book.author.toLowerCase().includes(term)
      );
    }

    // Apply category filter
    if (selectedCategory) {
      result = result.filter((book) => book.category === selectedCategory);
    }

    // Apply read status filter
    if (showReadOnly) {
      result = result.filter((book) => book.read);
    }

    // Apply sort
    result.sort((a, b) => {
      const comparison = a.title.localeCompare(b.title);
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredBooks(result);
  }, [books, searchTerm, selectedCategory, sortOrder, showReadOnly]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Your Library</h1>

      {/* Search and filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 dark:text-gray-100" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-900 placeholder-gray-500 dark:placeholder-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search by title or author"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category filter */}
          <div className="w-full md:w-64">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400 dark:text-gray-100" />
              </div>
              <select
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort order */}
          <div className="w-full md:w-48">
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            >
              <option value="asc">A-Z</option>
              <option value="desc">Z-A</option>
            </select>
          </div>
          <div className="block  px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm hover:bg-blue-500"><a href="/request" className='hover:text-white'>Book Request</a></div>
        </div>

        {/* Read filter */}
        <div className="flex items-center">
          <input
            id="read-only"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={showReadOnly}
            onChange={(e) => setShowReadOnly(e.target.checked)}
          />
          <label htmlFor="read-only" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
            Show only books I've read
          </label>
        </div>
      </div>
           
      {/* Book list */}
      {filteredBooks.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm text-center">
          <p className="text-gray-500 dark:text-gray-100">No books found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
  {filteredBooks.map((book) => (
    <Link
      key={book.id}
      to={book.category==="Video"?`/video/${book.id}`:`/book/${book.id}`}
      className="bg-white dark:bg-gray-900 border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      <div className="relative p-4 flex flex-col items-center">
        <img
          width={160}
          height={240}
          src={book.img_url}
          alt={book.title}
          className="h-40 object-cover rounded-md shadow-md transition-transform duration-200 hover:scale-105"
        />
      </div>
      <div className="px-5 pb-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 text-center">{book.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-100 text-center">by {book.author}</p>

        <div className="flex justify-center items-center mt-3 space-x-2">
          <Book className="h-4 w-4 text-blue-500" />
          <span className="text-xs font-medium text-blue-500">{book.category}</span>
        </div>

        {book.read && (
          <div className="flex justify-center mt-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
        )}
      </div>
    </Link>
  ))}
</div>

      )}
      
    </div>
  );
};

export default Dashboard;