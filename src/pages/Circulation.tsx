import React, { useState } from 'react';
import { LibraryService } from '../services/libraryService';
import { Scan, ArrowRight, BookDown, BookUp, AlertTriangle, CheckCircle } from 'lucide-react';

type Mode = 'ISSUE' | 'RETURN';

export const Circulation: React.FC = () => {
  const [mode, setMode] = useState<Mode>('ISSUE');
  const [bookIsbn, setBookIsbn] = useState('');
  const [studentNum, setStudentNum] = useState('');
  const [duration, setDuration] = useState(14); // Default 14 days
  
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'warning', msg: string } | null>(null);

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    
    if (!bookIsbn || !studentNum) {
      setFeedback({ type: 'error', msg: 'Lütfen hem Kitap hem de Öğrenci QR kodunu okutun.' });
      return;
    }

    try {
      const result = await LibraryService.issueBook(bookIsbn, studentNum, duration);
      if (result.success) {
        if (result.warning) {
           setFeedback({ type: 'warning', msg: result.warning + " (Kitap Başarıyla Verildi)" });
        } else {
           setFeedback({ type: 'success', msg: result.message });
        }
        setBookIsbn('');
        setStudentNum('');
      } else {
        setFeedback({ type: 'error', msg: result.message });
      }
    } catch (error) {
      setFeedback({ type: 'error', msg: 'Sistem hatası oluştu.' });
    }
  };

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!bookIsbn) {
      setFeedback({ type: 'error', msg: 'Lütfen Kitap QR kodunu okutun.' });
      return;
    }

    try {
      const result = await LibraryService.returnBook(bookIsbn);
      if (result.success) {
        setFeedback({ type: 'success', msg: result.message });
        setBookIsbn('');
      } else {
        setFeedback({ type: 'error', msg: result.message });
      }
    } catch (error) {
      setFeedback({ type: 'error', msg: 'Sistem hatası oluştu.' });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">Ödünç Bankosu</h2>
        <p className="text-gray-500">Kitap vermek veya almak için QR kodları taratın.</p>
      </div>

      {/* Mode Switcher */}
      <div className="flex rounded-lg bg-gray-200 p-1">
        <button
          onClick={() => { setMode('ISSUE'); setFeedback(null); setBookIsbn(''); setStudentNum(''); }}
          className={`flex-1 py-3 px-6 rounded-md text-sm font-semibold transition-all flex items-center justify-center space-x-2 ${
            mode === 'ISSUE' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <BookDown size={20} />
          <span>Kitap Ver (Ödünç)</span>
        </button>
        <button
          onClick={() => { setMode('RETURN'); setFeedback(null); setBookIsbn(''); setStudentNum(''); }}
          className={`flex-1 py-3 px-6 rounded-md text-sm font-semibold transition-all flex items-center justify-center space-x-2 ${
            mode === 'RETURN' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <BookUp size={20} />
          <span>Kitap Al (İade)</span>
        </button>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <form onSubmit={mode === 'ISSUE' ? handleIssue : handleReturn} className="space-y-6">
          
          {/* Scanner Input - Book */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Kitap QR / ISBN</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Scan size={20} />
              </div>
              <input
                type="text"
                autoFocus
                value={bookIsbn}
                onChange={(e) => setBookIsbn(e.target.value)}
                placeholder="Kitap barkodunu taratın..."
                className="pl-10 block w-full rounded-lg border-gray-300 bg-gray-50 border focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 py-3 transition-colors"
              />
            </div>
          </div>

          {/* Issue Mode Specifics */}
          {mode === 'ISSUE' && (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Öğrenci QR / No</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Scan size={20} />
                  </div>
                  <input
                    type="text"
                    value={studentNum}
                    onChange={(e) => setStudentNum(e.target.value)}
                    placeholder="Öğrenci kimliğini taratın..."
                    className="pl-10 block w-full rounded-lg border-gray-300 bg-gray-50 border focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 py-3 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                 <label className="block text-sm font-medium text-gray-700">Ödünç Süresi (Gün)</label>
                 <select 
                    value={duration} 
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="block w-full rounded-lg border-gray-300 border py-3 px-4 focus:border-indigo-500 focus:ring-indigo-500"
                 >
                    <option value={7}>7 Gün (1 Hafta)</option>
                    <option value={14}>14 Gün (2 Hafta)</option>
                    <option value={30}>30 Gün (1 Ay)</option>
                    <option value={90}>90 Gün (Dönemlik)</option>
                 </select>
                 <p className="text-xs text-gray-500">Bu süre geçilirse gecikme uyarısı verilecektir.</p>
              </div>
            </>
          )}

          {/* Action Button */}
          <button
            type="submit"
            className={`w-full flex items-center justify-center space-x-2 py-4 rounded-lg font-bold text-white shadow-md transition-transform active:scale-95 ${
              mode === 'ISSUE' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            <span>{mode === 'ISSUE' ? 'Ödünç İşlemini Tamamla' : 'İade İşlemini Tamamla'}</span>
            <ArrowRight size={20} />
          </button>
        </form>

        {/* Feedback Messages */}
        {feedback && (
          <div className={`mt-6 p-4 rounded-lg flex items-start space-x-3 ${
            feedback.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
            feedback.type === 'warning' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
            'bg-green-50 text-green-800 border border-green-200'
          }`}>
            {feedback.type === 'error' && <AlertTriangle className="shrink-0" size={24} />}
            {feedback.type === 'warning' && <AlertTriangle className="shrink-0" size={24} />}
            {feedback.type === 'success' && <CheckCircle className="shrink-0" size={24} />}
            <div>
              <p className="font-semibold">{feedback.type === 'error' ? 'Hata' : feedback.type === 'warning' ? 'Uyarı' : 'Başarılı'}</p>
              <p>{feedback.msg}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};