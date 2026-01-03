export enum BookStatus {
  AVAILABLE = 'AVAILABLE',
  BORROWED = 'BORROWED',
  LOST = 'LOST'
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string; // Used for QR Code
  status: BookStatus;
  category: string;
  addedDate: string;
}

export interface Student {
  id: string;
  name: string;
  studentNumber: string; // Used for QR Code
  email: string;
  grade: string;
  readingHistory: string[]; // Array of Book IDs
}

export interface Transaction {
  id: string;
  bookId: string;
  studentId: string;
  issueDate: string; // ISO Date string
  dueDate: string;   // ISO Date string
  returnDate?: string; // ISO Date string
  isReturned: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'TEACHER';
}