import { Book, BookStatus, Student, Transaction, User } from '../types';

// Initial Mock Data
let books: Book[] = [
  { id: 'b1', title: 'Kürk Mantolu Madonna', author: 'Sabahattin Ali', isbn: '9789753638029', status: BookStatus.BORROWED, category: 'Edebiyat', addedDate: '2023-01-01' },
  { id: 'b2', title: '1984', author: 'George Orwell', isbn: '9780451524935', status: BookStatus.AVAILABLE, category: 'Bilim Kurgu', addedDate: '2023-01-05' },
  { id: 'b3', title: 'Matematik Cilt 1', author: 'Tom M. Apostol', isbn: '9780471000051', status: BookStatus.BORROWED, category: 'Eğitim', addedDate: '2023-02-10' },
  { id: 'b4', title: 'Temiz Kod (Clean Code)', author: 'Robert C. Martin', isbn: '9780132350884', status: BookStatus.AVAILABLE, category: 'Teknoloji', addedDate: '2023-03-20' },
];

let students: Student[] = [
  { id: 's1', name: 'Ali Yılmaz', studentNumber: '2024001', email: 'ali@okul.com', grade: '10-A', readingHistory: [] },
  { id: 's2', name: 'Ayşe Demir', studentNumber: '2024002', email: 'ayse@okul.com', grade: '11-B', readingHistory: ['b2'] },
  { id: 's3', name: 'Mehmet Kaya', studentNumber: '2024003', email: 'mehmet@okul.com', grade: '9-C', readingHistory: [] },
];

// Transactions: Note distinct dates to simulate overdue items
let transactions: Transaction[] = [
  { 
    id: 't1', 
    bookId: 'b1', 
    studentId: 's1', 
    issueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),   // Due 5 days ago (OVERDUE)
    isReturned: false 
  },
  { 
    id: 't2', 
    bookId: 'b3', 
    studentId: 's3', 
    issueDate: new Date().toISOString(), // Today
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // Due in 14 days
    isReturned: false 
  }
];

export const LibraryService = {
  // --- Books ---
  getBooks: async (): Promise<Book[]> => {
    return [...books];
  },
  addBook: async (book: Omit<Book, 'id' | 'status' | 'addedDate'>): Promise<Book> => {
    const newBook: Book = {
      ...book,
      id: Math.random().toString(36).substr(2, 9),
      status: BookStatus.AVAILABLE,
      addedDate: new Date().toISOString()
    };
    books.push(newBook);
    return newBook;
  },

  // --- Students ---
  getStudents: async (): Promise<Student[]> => {
    return [...students];
  },
  addStudent: async (student: Omit<Student, 'id' | 'readingHistory'>): Promise<Student> => {
    const newStudent: Student = {
      ...student,
      id: Math.random().toString(36).substr(2, 9),
      readingHistory: []
    };
    students.push(newStudent);
    return newStudent;
  },

  // --- Transactions (Core Logic) ---
  getActiveTransactions: async (): Promise<(Transaction & { book: Book, student: Student })[]> => {
    return transactions
      .filter(t => !t.isReturned)
      .map(t => {
        const book = books.find(b => b.id === t.bookId)!;
        const student = students.find(s => s.id === t.studentId)!;
        return { ...t, book, student };
      });
  },

  issueBook: async (isbn: string, studentNumber: string, durationDays: number): Promise<{ success: boolean; message: string; warning?: string }> => {
    const book = books.find(b => b.isbn === isbn);
    const student = students.find(s => s.studentNumber === studentNumber);

    if (!book) return { success: false, message: 'Bu ISBN/QR kodu ile kitap bulunamadı.' };
    if (!student) return { success: false, message: 'Bu numara/QR ile öğrenci bulunamadı.' };
    if (book.status !== BookStatus.AVAILABLE) return { success: false, message: 'Kitap şu anda başkasında ödünçte.' };

    const hasReadBefore = student.readingHistory.includes(book.id);
    let warningMsg = undefined;
    if (hasReadBefore) {
      warningMsg = `Dikkat! ${student.name} isimli öğrenci "${book.title}" kitabını daha önce okumuş.`;
    }

    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      bookId: book.id,
      studentId: student.id,
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString(),
      isReturned: false
    };

    transactions.push(newTransaction);
    
    // Update local state
    books = books.map(b => b.id === book.id ? { ...b, status: BookStatus.BORROWED } : b);
    students = students.map(s => s.id === student.id ? { ...s, readingHistory: [...s.readingHistory, book.id] } : s);

    return { success: true, message: 'Kitap başarıyla ödünç verildi.', warning: warningMsg };
  },

  returnBook: async (isbn: string): Promise<{ success: boolean; message: string }> => {
    const book = books.find(b => b.isbn === isbn);
    if (!book) return { success: false, message: 'Kitap bulunamadı.' };

    const transaction = transactions.find(t => t.bookId === book.id && !t.isReturned);
    if (!transaction) return { success: false, message: 'Bu kitap şu anda ödünçte görünmüyor.' };

    // Update transaction
    transactions = transactions.map(t => t.id === transaction.id ? { ...t, isReturned: true, returnDate: new Date().toISOString() } : t);
    
    // Update book status
    books = books.map(b => b.id === book.id ? { ...b, status: BookStatus.AVAILABLE } : b);

    return { success: true, message: 'Kitap envantere başarıyla iade edildi.' };
  }
};