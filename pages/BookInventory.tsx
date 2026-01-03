import React, { useEffect, useState } from 'react';
import { Book, BookStatus } from '../types';
import { LibraryService } from '../services/mockDatabase';
import { Plus, Printer, Trash2 } from 'lucide-react';
import { QRCodeDisplay } from '../components/QRCodeDisplay';

export const BookInventory: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newBook, setNewBook] = useState({ title: '', author: '', isbn: '', category: '' });

  const fetchBooks = async () => {
    const data = await LibraryService.getBooks();
    setBooks(data);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newBook.title && newBook.isbn) {
      await LibraryService.addBook(newBook);
      setNewBook({ title: '', author: '', isbn: '', category: '' });
      setIsAdding(false);
      fetchBooks();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to generate a random ISBN if not provided
  const generateRandomISBN = () => {
    setNewBook(prev => ({...prev, isbn: Math.floor(1000000000000 + Math.random() * 9000000000000).toString()}));
  }

  const getStatusLabel = (status: BookStatus) => {
    switch(status) {
      case BookStatus.AVAILABLE: return 'MEVCUT';
      case BookStatus.BORROWED: return 'ÖDÜNÇTE';
      case BookStatus.LOST: return 'KAYIP';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center no-print">
        <h2 className="text-2xl font-bold text-gray-800">Kitap Envanteri</h2>
        <div className="space-x-3">
            <button 
                onClick={handlePrint}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center space-x-2 inline-flex"
            >
                <Printer size={18} />
                <span>QR Kodları Yazdır</span>
            </button>
            <button 
                onClick={() => setIsAdding(!isAdding)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2 inline-flex"
            >
                <Plus size={18} />
                <span>Kitap Ekle</span>
            </button>
        </div>
      </div>

      {/* Add Form */}
      {isAdding && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-indigo-100 no-print">
          <h3 className="text-lg font-semibold mb-4">Yeni Kitap Ekle</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              placeholder="Kitap Adı" 
              className="border p-2 rounded" 
              value={newBook.title}
              onChange={e => setNewBook({...newBook, title: e.target.value})}
              required
            />
            <input 
              placeholder="Yazar" 
              className="border p-2 rounded" 
              value={newBook.author}
              onChange={e => setNewBook({...newBook, author: e.target.value})}
              required
            />
            <div className="flex space-x-2">
                <input 
                placeholder="ISBN / Barkod" 
                className="border p-2 rounded flex-1" 
                value={newBook.isbn}
                onChange={e => setNewBook({...newBook, isbn: e.target.value})}
                required
                />
                <button type="button" onClick={generateRandomISBN} className="text-xs bg-gray-100 px-2 rounded hover:bg-gray-200">Üret</button>
            </div>
            <input 
              placeholder="Kategori" 
              className="border p-2 rounded" 
              value={newBook.category}
              onChange={e => setNewBook({...newBook, category: e.target.value})}
            />
            <button type="submit" className="col-span-2 bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">Kaydet</button>
          </form>
        </div>
      )}

      {/* Book List Table (Web View) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden no-print">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Başlık</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Yazar</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">ISBN</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {books.map(book => (
              <tr key={book.id}>
                <td className="px-6 py-4">{book.title}</td>
                <td className="px-6 py-4 text-gray-500">{book.author}</td>
                <td className="px-6 py-4 font-mono text-xs">{book.isbn}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${book.status === BookStatus.AVAILABLE ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                    {getStatusLabel(book.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Print View (QR Codes Grid) */}
      <div className="print-only">
        <h1 className="text-2xl font-bold mb-6 text-center">Kitap Envanteri QR Kodları</h1>
        <div className="grid grid-cols-4 gap-4">
            {books.map(book => (
                <QRCodeDisplay 
                    key={book.id} 
                    value={book.isbn} 
                    label={book.title.substring(0, 20) + (book.title.length>20 ? '...' : '')} 
                    subLabel={book.isbn}
                />
            ))}
        </div>
      </div>
    </div>
  );
};