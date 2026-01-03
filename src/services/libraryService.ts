import { db } from '../firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  query, 
  where
} from 'firebase/firestore';
import { Book, BookStatus, Student, Transaction } from '../types';

// Helper: Firestore verisini TypeScript tipine dönüştürür
const convertDoc = <T>(doc: any): T => ({ id: doc.id, ...doc.data() });

export const LibraryService = {
  // --- KİTAP İŞLEMLERİ ---
  getBooks: async (): Promise<Book[]> => {
    const snapshot = await getDocs(collection(db, 'books'));
    return snapshot.docs.map(d => convertDoc<Book>(d));
  },

  addBook: async (book: Omit<Book, 'id' | 'status' | 'addedDate'>): Promise<{success: boolean, message: string}> => {
    try {
      // ISBN Kontrolü (Aynı kitap var mı?)
      const q = query(collection(db, 'books'), where("isbn", "==", book.isbn));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return { success: false, message: 'Bu ISBN numarasına sahip bir kitap zaten var.' };
      }

      await addDoc(collection(db, 'books'), {
        ...book,
        status: BookStatus.AVAILABLE,
        addedDate: new Date().toISOString()
      });
      return { success: true, message: 'Kitap başarıyla eklendi.' };
    } catch (error) {
      console.error(error);
      return { success: false, message: 'Kitap eklenirken hata oluştu.' };
    }
  },

  deleteBook: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, 'books', id));
  },

  // --- ÖĞRENCİ İŞLEMLERİ ---
  getStudents: async (): Promise<Student[]> => {
    const snapshot = await getDocs(collection(db, 'students'));
    return snapshot.docs.map(d => convertDoc<Student>(d));
  },

  addStudent: async (student: Omit<Student, 'id' | 'readingHistory'>): Promise<{success: boolean, message: string}> => {
    try {
      // Öğrenci No Kontrolü
      const q = query(collection(db, 'students'), where("studentNumber", "==", student.studentNumber));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return { success: false, message: 'Bu numaraya sahip bir öğrenci zaten kayıtlı.' };
      }

      await addDoc(collection(db, 'students'), {
        ...student,
        readingHistory: []
      });
      return { success: true, message: 'Öğrenci başarıyla eklendi.' };
    } catch (error) {
      return { success: false, message: 'Hata oluştu: ' + error };
    }
  },

  deleteStudent: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, 'students', id));
  },

  // --- ÖDÜNÇ/İADE İŞLEMLERİ (TRANSACTIONS) ---
  getActiveTransactions: async (): Promise<(Transaction & { book: Book, student: Student })[]> => {
    // 1. Henüz iade edilmemiş işlemleri çek
    const tQuery = query(collection(db, 'transactions'), where("isReturned", "==", false));
    const tSnapshot = await getDocs(tQuery);
    const transactions = tSnapshot.docs.map(d => convertDoc<Transaction>(d));

    if (transactions.length === 0) return [];

    // 2. Kitap ve Öğrenci bilgilerini çekip birleştir (Join işlemi)
    const booksSnapshot = await getDocs(collection(db, 'books'));
    const studentsSnapshot = await getDocs(collection(db, 'students'));

    const books = booksSnapshot.docs.map(d => convertDoc<Book>(d));
    const students = studentsSnapshot.docs.map(d => convertDoc<Student>(d));

    return transactions
      .map(t => {
        const book = books.find(b => b.id === t.bookId);
        const student = students.find(s => s.id === t.studentId);
        if (!book || !student) return null;
        return { ...t, book, student };
      })
      .filter((t): t is (Transaction & { book: Book, student: Student }) => t !== null);
  },

  issueBook: async (isbn: string, studentNumber: string, durationDays: number): Promise<{ success: boolean; message: string; warning?: string }> => {
    try {
      // Kitabı Bul
      const bQuery = query(collection(db, 'books'), where("isbn", "==", isbn));
      const bSnap = await getDocs(bQuery);
      if (bSnap.empty) return { success: false, message: 'Kitap bulunamadı.' };
      const bookDoc = bSnap.docs[0];
      const book = convertDoc<Book>(bookDoc);

      // Öğrenciyi Bul
      const sQuery = query(collection(db, 'students'), where("studentNumber", "==", studentNumber));
      const sSnap = await getDocs(sQuery);
      if (sSnap.empty) return { success: false, message: 'Öğrenci bulunamadı.' };
      const studentDoc = sSnap.docs[0];
      const student = convertDoc<Student>(studentDoc);

      // Kitap Müsait mi?
      if (book.status !== BookStatus.AVAILABLE) return { success: false, message: 'Kitap şu anda başkasında.' };

      // Daha önce okudu mu uyarısı
      const hasReadBefore = student.readingHistory && student.readingHistory.includes(book.id);
      let warningMsg = undefined;
      if (hasReadBefore) {
        warningMsg = `Dikkat! ${student.name} bu kitabı daha önce okumuş.`;
      }

      // İşlem Kaydı Oluştur
      await addDoc(collection(db, 'transactions'), {
        bookId: book.id,
        studentId: student.id,
        issueDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString(),
        isReturned: false
      });

      // Kitap Durumunu Güncelle
      await updateDoc(doc(db, 'books', book.id), { status: BookStatus.BORROWED });

      // Öğrenci Geçmişini Güncelle
      const newHistory = [...(student.readingHistory || []), book.id];
      await updateDoc(doc(db, 'students', student.id), { readingHistory: newHistory });

      return { success: true, message: 'Kitap verildi.', warning: warningMsg };

    } catch (e) {
      console.error(e);
      return { success: false, message: 'İşlem sırasında hata oluştu.' };
    }
  },

  returnBook: async (isbn: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Kitabı Bul
      const bQuery = query(collection(db, 'books'), where("isbn", "==", isbn));
      const bSnap = await getDocs(bQuery);
      if (bSnap.empty) return { success: false, message: 'Kitap bulunamadı.' };
      const book = convertDoc<Book>(bSnap.docs[0]);

      // Aktif İşlemi Bul
      const tQuery = query(
        collection(db, 'transactions'), 
        where("bookId", "==", book.id),
        where("isReturned", "==", false)
      );
      const tSnap = await getDocs(tQuery);
      if (tSnap.empty) return { success: false, message: 'Bu kitap ödünçte görünmüyor.' };
      const transactionId = tSnap.docs[0].id;

      // İşlemi Kapat (İade Edildi)
      await updateDoc(doc(db, 'transactions', transactionId), {
        isReturned: true,
        returnDate: new Date().toISOString()
      });

      // Kitabı Müsait Yap
      await updateDoc(doc(db, 'books', book.id), { status: BookStatus.AVAILABLE });

      return { success: true, message: 'Kitap iade alındı.' };

    } catch (e) {
      return { success: false, message: 'Hata: ' + e };
    }
  },
  
  resetDatabase: async () => {
    console.warn("Gerçek veritabanında reset işlemi devre dışı.");
  }
};