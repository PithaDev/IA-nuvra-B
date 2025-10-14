import { useState } from 'react';
import App from './App';
import CRMDashboard from './pages/CRMDashboard';
import { Database, ArrowLeft } from 'lucide-react';

export default function AppRouter() {
  const [currentPage, setCurrentPage] = useState<'app' | 'crm'>('app');

  return (
    <>
      {currentPage === 'app' && (
        <>
          <App />
          <button
            onClick={() => setCurrentPage('crm')}
            className="fixed bottom-6 left-6 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 z-50"
          >
            <Database className="w-5 h-5" />
            <span className="font-semibold">Acessar CRM</span>
          </button>
        </>
      )}

      {currentPage === 'crm' && (
        <>
          <CRMDashboard />
          <button
            onClick={() => setCurrentPage('app')}
            className="fixed bottom-6 left-6 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 z-50"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Voltar para App</span>
          </button>
        </>
      )}
    </>
  );
}
