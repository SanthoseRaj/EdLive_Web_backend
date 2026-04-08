import React, { useState, useEffect } from 'react';

const BookManagement = () => {
  const [books, setBooks] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddCopyModal, setShowAddCopyModal] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    publication_year: '',
    genre: '',
    quantity: 1,
    location: ''
  });
  const [newCopy, setNewCopy] = useState({
    barcode: '',
    condition: 'Good'
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/library/books`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setBooks(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch books:', error);
    }
  };

  const fetchBookDetails = async (bookId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/library/books/${bookId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch book details:', error);
      return null;
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/library/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newBook)
      });

      if (response.ok) {
        const data = await response.json();
        setBooks([...books, data.data]);
        setNewBook({
          title: '',
          author: '',
          isbn: '',
          publisher: '',
          publication_year: '',
          genre: '',
          quantity: 1,
          location: ''
        });
        setShowAddForm(false);
        alert('Book added successfully!');
      }
    } catch (error) {
      console.error('Failed to add book:', error);
    }
  };

  const handleViewBook = async (book) => {
    const bookDetails = await fetchBookDetails(book.id);
    if (bookDetails) {
      setSelectedBook(bookDetails);
      setShowViewModal(true);
    }
  };

  const handleAddCopy = (book) => {
    setSelectedBook(book);
    setNewCopy({
      barcode: '',
      condition: 'Good'
    });
    setShowAddCopyModal(true);
  };

  const handleAddCopySubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/library/books/copies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          book_id: selectedBook.id,
          barcode: newCopy.barcode,
          condition: newCopy.condition
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert('Book copy added successfully!');
        setShowAddCopyModal(false);
        setNewCopy({ barcode: '', condition: 'Good' });
        
        // Refresh the book details if view modal is open
        if (showViewModal) {
          const updatedBookDetails = await fetchBookDetails(selectedBook.id);
          if (updatedBookDetails) {
            setSelectedBook(updatedBookDetails);
          }
        }
        
        // Refresh books list to update available quantities
        fetchBooks();
      } else {
        const errorData = await response.json();
        alert(`Failed to add copy: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Failed to add book copy:', error);
      alert('Failed to add book copy');
    }
  };

  const closeModals = () => {
    setShowViewModal(false);
    setShowAddCopyModal(false);
    setSelectedBook(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Book Management</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {showAddForm ? 'Cancel' : 'Add New Book'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddBook} className="mb-6 p-4 bg-gray-50 rounded">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Title *"
              value={newBook.title}
              onChange={(e) => setNewBook({...newBook, title: e.target.value})}
              required
              className="p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Author *"
              value={newBook.author}
              onChange={(e) => setNewBook({...newBook, author: e.target.value})}
              required
              className="p-2 border rounded"
            />
            <input
              type="text"
              placeholder="ISBN"
              value={newBook.isbn}
              onChange={(e) => setNewBook({...newBook, isbn: e.target.value})}
              className="p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Publisher"
              value={newBook.publisher}
              onChange={(e) => setNewBook({...newBook, publisher: e.target.value})}
              className="p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Publication Year"
              value={newBook.publication_year}
              onChange={(e) => setNewBook({...newBook, publication_year: e.target.value})}
              className="p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Genre"
              value={newBook.genre}
              onChange={(e) => setNewBook({...newBook, genre: e.target.value})}
              className="p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Quantity *"
              value={newBook.quantity}
              onChange={(e) => setNewBook({...newBook, quantity: parseInt(e.target.value)})}
              required
              min="1"
              className="p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Location"
              value={newBook.location}
              onChange={(e) => setNewBook({...newBook, location: e.target.value})}
              className="p-2 border rounded"
            />
          </div>
          <button
            type="submit"
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add Book
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Author</th>
              <th className="px-4 py-2">ISBN</th>
              <th className="px-4 py-2">Quantity</th>
              <th className="px-4 py-2">Available</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map(book => (
              <tr key={book.id}>
                <td className="border px-4 py-2">{book.title}</td>
                <td className="border px-4 py-2">{book.author}</td>
                <td className="border px-4 py-2">{book.isbn || 'N/A'}</td>
                <td className="border px-4 py-2">{book.quantity}</td>
                <td className="border px-4 py-2">{book.available_quantity}</td>
                <td className="border px-4 py-2">
                  <button 
                    onClick={() => handleViewBook(book)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    View
                  </button>
                  <button 
                    onClick={() => handleAddCopy(book)}
                    className="text-green-500 hover:text-green-700"
                  >
                    Add Copies
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Book Modal */}
      {showViewModal && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Book Details</h3>
                <button onClick={closeModals} className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-700">Basic Information</h4>
                  <p><strong>Title:</strong> {selectedBook.title}</p>
                  <p><strong>Author:</strong> {selectedBook.author}</p>
                  <p><strong>ISBN:</strong> {selectedBook.isbn || 'N/A'}</p>
                  <p><strong>Publisher:</strong> {selectedBook.publisher || 'N/A'}</p>
                  <p><strong>Publication Year:</strong> {selectedBook.publication_year || 'N/A'}</p>
                  <p><strong>Genre:</strong> {selectedBook.genre || 'N/A'}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-700">Inventory Information</h4>
                  <p><strong>Total Quantity:</strong> {selectedBook.quantity}</p>
                  <p><strong>Available Quantity:</strong> {selectedBook.available_quantity}</p>
                  <p><strong>Location:</strong> {selectedBook.location || 'N/A'}</p>
                  <p><strong>Status:</strong> {selectedBook.is_active ? 'Active' : 'Inactive'}</p>
                </div>
              </div>

              {selectedBook.copies && selectedBook.copies.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Book Copies</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-gray-50">
                      <thead>
                        <tr>
                          <th className="px-3 py-2 text-left">Barcode</th>
                          <th className="px-3 py-2 text-left">Status</th>
                          <th className="px-3 py-2 text-left">Condition</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedBook.copies.map(copy => (
                          <tr key={copy.id}>
                            <td className="px-3 py-2 border">{copy.barcode}</td>
                            <td className="px-3 py-2 border">
                              <span className={`px-2 py-1 rounded text-xs ${
                                copy.status === 'Available' ? 'bg-green-100 text-green-800' :
                                copy.status === 'Checked Out' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {copy.status}
                              </span>
                            </td>
                            <td className="px-3 py-2 border">{copy.condition || 'Good'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => handleAddCopy(selectedBook)}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mr-2"
                >
                  Add More Copies
                </button>
                <button
                  onClick={closeModals}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Copy Modal */}
      {showAddCopyModal && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Add Book Copy</h3>
                <button onClick={closeModals} className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>
              
              <p className="mb-4 text-gray-600">
                Adding copy for: <strong>{selectedBook.title}</strong> by {selectedBook.author}
              </p>
              
              <form onSubmit={handleAddCopySubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Barcode *
                    </label>
                    <input
                      type="text"
                      value={newCopy.barcode}
                      onChange={(e) => setNewCopy({...newCopy, barcode: e.target.value})}
                      required
                      className="w-full p-2 border rounded"
                      placeholder="Enter barcode"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Condition
                    </label>
                    <select
                      value={newCopy.condition}
                      onChange={(e) => setNewCopy({...newCopy, condition: e.target.value})}
                      className="w-full p-2 border rounded"
                    >
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6 space-x-2">
                  <button
                    type="button"
                    onClick={closeModals}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Add Copy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookManagement;