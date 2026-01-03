import React, { useEffect, useState } from 'react';
import { Student } from '../types';
import { LibraryService } from '../services/libraryService';
import { Plus, Printer, Trash2, Search } from 'lucide-react';
import { QRCodeDisplay } from '../components/QRCodeDisplay';

export const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [isAdding, setIsAdding] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', studentNumber: '', grade: '' });

  const fetchStudents = async () => {
    const data = await LibraryService.getStudents();
    setStudents(data);
    setFilteredStudents(data);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    const lowerTerm = searchTerm.toLowerCase();
    const filtered = students.filter(student => 
      student.name.toLowerCase().includes(lowerTerm) || 
      student.studentNumber.includes(lowerTerm) ||
      student.grade.toLowerCase().includes(lowerTerm)
    );
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newStudent.name && newStudent.studentNumber) {
      const res = await LibraryService.addStudent(newStudent);
      if (res.success) {
        setNewStudent({ name: '', studentNumber: '', grade: '' });
        setIsAdding(false);
        fetchStudents();
      } else {
        alert(res.message);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu öğrenciyi silmek istediğinize emin misiniz?')) {
      await LibraryService.deleteStudent(id);
      fetchStudents();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <h2 className="text-2xl font-bold text-gray-800">Öğrenci Veritabanı</h2>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input 
            type="text"
            placeholder="Öğrenci ara..." 
            className="pl-10 block w-full rounded-lg border-gray-300 border py-2 px-4 focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex space-x-3 w-full md:w-auto">
            <button 
                onClick={handlePrint}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center space-x-2 flex-1 md:flex-none"
            >
                <Printer size={18} />
                <span>Kart Yazdır</span>
            </button>
            <button 
                onClick={() => setIsAdding(!isAdding)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center space-x-2 flex-1 md:flex-none"
            >
                <Plus size={18} />
                <span>Ekle</span>
            </button>
        </div>
      </div>

      {/* Add Form */}
      {isAdding && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-indigo-100 no-print">
          <h3 className="text-lg font-semibold mb-4">Yeni Öğrenci Kaydet</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              placeholder="Ad Soyad" 
              className="border p-2 rounded" 
              value={newStudent.name}
              onChange={e => setNewStudent({...newStudent, name: e.target.value})}
              required
            />
            <input 
              placeholder="Öğrenci No (ID)" 
              className="border p-2 rounded" 
              value={newStudent.studentNumber}
              onChange={e => setNewStudent({...newStudent, studentNumber: e.target.value})}
              required
            />
            <input 
              placeholder="Sınıf / Şube" 
              className="border p-2 rounded col-span-1 md:col-span-2" 
              value={newStudent.grade}
              onChange={e => setNewStudent({...newStudent, grade: e.target.value})}
            />
            <button type="submit" className="col-span-1 md:col-span-2 bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">Öğrenciyi Kaydet</button>
          </form>
        </div>
      )}

      {/* Student List (Web View) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden no-print">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">İsim</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Öğrenci No</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Sınıf</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Geçmiş</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredStudents.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-6 text-gray-400">Öğrenci bulunamadı.</td></tr>
            ) : filteredStudents.map(student => (
              <tr key={student.id}>
                <td className="px-6 py-4 font-medium">{student.name}</td>
                <td className="px-6 py-4 text-gray-500 font-mono">{student.studentNumber}</td>
                <td className="px-6 py-4">{student.grade}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {student.readingHistory ? student.readingHistory.length : 0} kitap okudu
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleDelete(student.id)}
                    className="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                    title="Öğrenciyi Sil"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Print View - Library Cards */}
      <div className="print-only w-full">
        <h1 className="text-2xl font-bold mb-8 text-center">Kütüphane Kartları</h1>
        <div className="grid grid-cols-2 gap-8 w-full">
            {filteredStudents.map(student => (
                <div key={student.id} className="border-2 border-black rounded-xl p-6 flex items-center justify-between break-inside-avoid shadow-none">
                    <div className="flex-1 mr-4">
                        <div className="flex items-center space-x-2 mb-2">
                            <div className="w-8 h-8 bg-black rounded-full text-white flex items-center justify-center font-bold">L</div>
                            <span className="font-bold text-sm tracking-wider uppercase">Okul Kütüphanesi</span>
                        </div>
                        <h3 className="text-xl font-bold uppercase mb-1">{student.name}</h3>
                        <p className="text-lg font-mono mb-1">{student.studentNumber}</p>
                        <p className="text-sm text-gray-600 mb-4">{student.grade}</p>
                        <div className="border-t-2 border-black pt-2 w-32">
                            <p className="text-[10px] uppercase font-bold text-gray-500">Yetkili İmza</p>
                        </div>
                    </div>
                    <div>
                        <QRCodeDisplay 
                            value={student.studentNumber} 
                            label=""
                            size={96}
                        />
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};