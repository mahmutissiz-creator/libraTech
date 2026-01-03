import { Book, BookStatus, Student, Transaction } from '../types';

const STORAGE_KEYS = {
  BOOKS: 'libratech_books',
  STUDENTS: 'libratech_students',
  TRANSACTIONS: 'libratech_transactions'
};

// Initial Data (Seed) - Sadece ilk açılışta yüklenir
const initialBooks: Book[] = [
  { id: 'b1', title: 'Kürk Mantolu Madonna', author: 'Sabahattin Ali', isbn: '9789753638029', status: BookStatus.BORROWED, category: 'Edebiyat', addedDate: '2023-01-01' },
  { id: 'b2', title: '1984', author: 'George Orwell', isbn: '9780451524935', status: BookStatus.AVAILABLE, category: 'Bilim Kurgu', addedDate: '2023-01-05' },
  { id: 'b3', title: 'Matematik Cilt 1', author: 'Tom M. Apostol', isbn: '9780471000051', status: BookStatus.BORROWED, category: 'Eğitim', addedDate: '2023-02-10' },
  { id: 'b4', title: 'Temiz Kod (Clean Code)', author: 'Robert C. Martin', isbn: '9780132350884', status: BookStatus.AVAILABLE, category: 'Teknoloji', addedDate: '2023-03-20' },
];

const initialStudents: Student[] = [
  { id: 's1', name: 'Ali Yılmaz', studentNumber: '2024001', grade: '10-A', readingHistory: [] },
  { id: 's2', name: 'Ayşe Demir', studentNumber: '2024002', grade: '11-B', readingHistory: ['b2'] },
  { id: 's3', name: 'Mehmet Kaya', studentNumber: '2024003', grade: '9-C', readingHistory: [] },
];

const initialTransactions: Transaction[] = [
  { 
    id: 't1', 
    bookId: 'b1', 
    studentId: 's1', 
    issueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), 
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),   
    isReturned: false 
  },
  { 
    id: 't2', 
    bookId: 'b3', 
    studentId: 's3', 
    issueDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    isReturned: false 
  }
];

// Helper to load/save
const loadData = <T>(key: string, defaultData: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(defaultData));
    return defaultData;
  }
  return JSON.parse(stored);
};

const saveData = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const LibraryService = {
  // --- Books ---
  getBooks: async (): Promise<Book[]> => {
    return loadData<Book[]>(STORAGE_KEYS.BOOKS, initialBooks);
  },

  addBook: async (book: Omit<Book, 'id' | 'status' | 'addedDate'>): Promise<{success: boolean, message: string}> => {
    const books = loadData<Book[]>(STORAGE_KEYS.BOOKS, initialBooks);
    
    // Check duplicate ISBN
    if (books.some(b => b.isbn === book.isbn)) {
      return { success: false, message: 'Bu ISBN numarasına sahip bir kitap zaten var.' };
    }

    const newBook: Book = {
      ...book,
      id: Math.random().toString(36).substr(2, 9),
      status: BookStatus.AVAILABLE,
      addedDate: new Date().toISOString()
    };
    
    books.push(newBook);
    saveData(STORAGE_KEYS.BOOKS, books);
    return { success: true, message: 'Kitap başarıyla eklendi.' };
  },

  deleteBook: async (id: string): Promise<void> => {
    let books = loadData<Book[]>(STORAGE_KEYS.BOOKS, initialBooks);
    books = books.filter(b => b.id !== id);
    saveData(STORAGE_KEYS.BOOKS, books);
  },

  // --- Students ---
  getStudents: async (): Promise<Student[]> => {
    return loadData<Student[]>(STORAGE_KEYS.STUDENTS, initialStudents);
  },

  addStudent: async (student: Omit<Student, 'id' | 'readingHistory'>): Promise<{success: boolean, message: string}> => {
    const students = loadData<Student[]>(STORAGE_KEYS.STUDENTS, initialStudents);

    // Check duplicate Student Number
    if (students.some(s => s.studentNumber === student.studentNumber)) {
      return { success: false, message: 'Bu numaraya sahip bir öğrenci zaten kayıtlı.' };
    }

    const newStudent: Student = {
      ...student,
      id: Math.random().toString(36).substr(2, 9),
      readingHistory: []
    };
    students.push(newStudent);
    saveData(STORAGE_KEYS.STUDENTS, students);
    return { success: true, message: 'Öğrenci başarıyla eklendi.' };
  },

  deleteStudent: async (id: string): Promise<void> => {
    let students = loadData<Student[]>(STORAGE_KEYS.STUDENTS, initialStudents);
    students = students.filter(s => s.id !== id);
    saveData(STORAGE_KEYS.STUDENTS, students);
  },

  // --- Transactions ---
  getActiveTransactions: async (): Promise<(Transaction & { book: Book, student: Student })[]> => {
    const transactions = loadData<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, initialTransactions);
    const books = loadData<Book[]>(STORAGE_KEYS.BOOKS, initialBooks);
    const students = loadData<Student[]>(STORAGE_KEYS.STUDENTS, initialStudents);

    return transactions
      .filter(t => !t.isReturned)
      .map(t => {
        const book = books.find(b => b.id === t.bookId);
        const student = students.find(s => s.id === t.studentId);
        // Filtreleme: Eğer kitap veya öğrenci silindiyse transaction'ı gösterme (veya handle et)
        if (!book || !student) return null; 
        return { ...t, book, student };
      })
      .filter((t): t is (Transaction & { book: Book, student: Student }) => t !== null);
  },

  issueBook: async (isbn: string, studentNumber: string, durationDays: number): Promise<{ success: boolean; message: string; warning?: string }> => {
    let books = loadData<Book[]>(STORAGE_KEYS.BOOKS, initialBooks);
    let students = loadData<Student[]>(STORAGE_KEYS.STUDENTS, initialStudents);
    let transactions = loadData<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, initialTransactions);

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
    
    // Update local objects
    book.status = BookStatus.BORROWED;
    student.readingHistory.push(book.id);

    // Save all to storage
    saveData(STORAGE_KEYS.BOOKS, books); // Kitabın durumu değişti
    saveData(STORAGE_KEYS.STUDENTS, students); // Öğrencinin geçmişi değişti
    saveData(STORAGE_KEYS.TRANSACTIONS, transactions);

    return { success: true, message: 'Kitap başarıyla ödünç verildi.', warning: warningMsg };
  },

  returnBook: async (isbn: string): Promise<{ success: boolean; message: string }> => {
    let books = loadData<Book[]>(STORAGE_KEYS.BOOKS, initialBooks);
    let transactions = loadData<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, initialTransactions);

    const book = books.find(b => b.isbn === isbn);
    if (!book) return { success: false, message: 'Kitap bulunamadı.' };

    const transaction = transactions.find(t => t.bookId === book.id && !t.isReturned);
    if (!transaction) return { success: false, message: 'Bu kitap şu anda ödünçte görünmüyor.' };

    // Update transaction
    transaction.isReturned = true;
    transaction.returnDate = new Date().toISOString();
    
    // Update book status
    book.status = BookStatus.AVAILABLE;

    saveData(STORAGE_KEYS.TRANSACTIONS, transactions);
    saveData(STORAGE_KEYS.BOOKS, books);

    return { success: true, message: 'Kitap envantere başarıyla iade edildi.' };
  },

  // Reset Data for Debugging/Demo
  resetDatabase: () => {
    localStorage.removeItem(STORAGE_KEYS.BOOKS);
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    window.location.reload();
  }
};