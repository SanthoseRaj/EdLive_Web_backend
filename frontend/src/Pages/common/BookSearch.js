import React, { useState } from 'react';

const BookSearch = () => {
  const [searchParams, setSearchParams] = useState({
    title: '',
    author: '',
    isbn: '',
    genre: ''
  });
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const queryParams = new URLSearchParams();
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/library/books/search?${queryParams}`,
        { credentials: 'include' }
      );
      
      if (response.ok) {
        const data = await response.json();
        setBooks(data.data);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async (bookId) => {
    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7); // 7 days from now
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/library/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          book_id: bookId,
          expiry_date: expiryDate.toISOString().split('T')[0]
        })
      });

      if (response.ok) {
        alert('Book reserved successfully!');
      } else {
        alert('Failed to reserve book');
      }
    } catch (error) {
      console.error('Reservation failed:', error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="mb-6 p-4 bg-gray-50 rounded">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Title"
            value={searchParams.title}
            onChange={(e) => setSearchParams({...searchParams, title: e.target.value})}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Author"
            value={searchParams.author}
            onChange={(e) => setSearchParams({...searchParams, author: e.target.value})}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="ISBN"
            value={searchParams.isbn}
            onChange={(e) => setSearchParams({...searchParams, isbn: e.target.value})}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Genre"
            value={searchParams.genre}
            onChange={(e) => setSearchParams({...searchParams, genre: e.target.value})}
            className="p-2 border rounded"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {loading ? 'Searching...' : 'Search Books'}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map(book => (
          <div key={book.id} className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold text-lg">{book.title}</h3>
            <p className="text-gray-600">by {book.author}</p>
            <p className="text-sm">ISBN: {book.isbn}</p>
            <p className="text-sm">Genre: {book.genre}</p>
            <p className="text-sm">
              Available: {book.available_quantity} of {book.quantity}
            </p>
            <button
              onClick={() => handleReserve(book.id)}
              disabled={book.available_quantity === 0}
              className={`mt-2 px-3 py-1 rounded text-sm ${
                book.available_quantity === 0
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {book.available_quantity === 0 ? 'Reserve' : 'Check Availability'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookSearch;