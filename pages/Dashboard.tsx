import React, { useEffect, useState } from 'react';
import { Transaction, Book, Student } from '../types';
import { LibraryService } from '../services/mockDatabase';
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [loans, setLoans] = useState<(Transaction & { book: Book, student: Student })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLoans = async () => {
    setLoading(true);
    const data = await LibraryService.getActiveTransactions();
    setLoans(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const getDaysKept = (issueDate: string) => {
    const start = new Date(issueDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const isOverdue = (dueDate: string) => {
    return new Date() > new Date(dueDate);
  };

  if (loading) return <div className="p-8 text-center">Panel verileri yükleniyor...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Kütüphane Paneli</h2>
        <button onClick={fetchLoans} className="text-sm text-indigo-600 hover:text-indigo-800">Verileri Yenile</button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Aktif Ödünçler</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">{loans.length}</h3>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
              <Clock size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Gecikmiş Kitaplar</p>
              <h3 className="text-3xl font-bold text-red-600 mt-1">
                {loans.filter(l => isOverdue(l.dueDate)).length}
              </h3>
            </div>
            <div className="bg-red-50 p-3 rounded-lg text-red-600">
              <AlertCircle size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Zamanında Teslimler</p>
              <h3 className="text-3xl font-bold text-green-600 mt-1">
                 {loans.filter(l => !isOverdue(l.dueDate)).length}
              </h3>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-green-600">
              <CheckCircle2 size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-semibold text-gray-800">Şu An Ödünçte Olan Kitaplar</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                <th className="px-6 py-3 font-medium">Öğrenci</th>
                <th className="px-6 py-3 font-medium">Kitap Adı</th>
                <th className="px-6 py-3 font-medium">Veriliş Tarihi</th>
                <th className="px-6 py-3 font-medium">Teslim Tarihi</th>
                <th className="px-6 py-3 font-medium">Geçen Gün</th>
                <th className="px-6 py-3 font-medium">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    Şu anda ödünç verilmiş kitap yok.
                  </td>
                </tr>
              ) : (
                loans.map((loan) => {
                  const overdue = isOverdue(loan.dueDate);
                  const daysKept = getDaysKept(loan.issueDate);
                  
                  return (
                    <tr 
                      key={loan.id} 
                      className={`transition-colors ${overdue ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}`}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{loan.student.name}</div>
                        <div className="text-xs text-gray-500">{loan.student.studentNumber}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900">{loan.book.title}</div>
                        <div className="text-xs text-gray-500">ISBN: {loan.book.isbn}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(loan.issueDate).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(loan.dueDate).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {daysKept} gün
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          overdue 
                            ? 'bg-red-100 text-red-800 border border-red-200' 
                            : 'bg-green-100 text-green-800 border border-green-200'
                        }`}>
                          {overdue ? 'Gecikmiş' : 'Zamanında'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};