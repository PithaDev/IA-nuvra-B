import { useState, useEffect } from 'react';
import { Users, TrendingUp, Target, Calendar, Search, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import LeadsList from '../components/crm/LeadsList';
import LeadDetails from '../components/crm/LeadDetails';
import PipelineView from '../components/crm/PipelineView';
import Analytics from '../components/crm/Analytics';

type ViewType = 'leads' | 'pipeline' | 'analytics';

interface Stats {
  totalLeads: number;
  qualifiedLeads: number;
  activeDeals: number;
  conversionRate: number;
}

export default function CRMDashboard() {
  const [currentView, setCurrentView] = useState<ViewType>('leads');
  const [stats, setStats] = useState<Stats>({
    totalLeads: 0,
    qualifiedLeads: 0,
    activeDeals: 0,
    conversionRate: 0,
  });
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { count: totalLeads } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      const { count: qualifiedLeads } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_qualified', true);

      const { data: stages } = await supabase
        .from('lead_stages')
        .select('id')
        .in('name', ['Proposta Enviada', 'Negociação']);

      let activeDeals = 0;
      if (stages && stages.length > 0) {
        const stageIds = stages.map(s => s.id);
        const { count } = await supabase
          .from('lead_qualifications')
          .select('*', { count: 'exact', head: true })
          .in('stage_id', stageIds);
        activeDeals = count || 0;
      }

      const conversionRate = totalLeads ? ((qualifiedLeads || 0) / totalLeads) * 100 : 0;

      setStats({
        totalLeads: totalLeads || 0,
        qualifiedLeads: qualifiedLeads || 0,
        activeDeals,
        conversionRate: Math.round(conversionRate),
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0B0F] via-[#1a1b2e] to-[#0A0B0F]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">CRM Dashboard</h1>
            <p className="text-gray-400">Gerencie seus leads e oportunidades</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentView('leads')}
              className={`px-4 py-2 rounded-lg transition-all ${
                currentView === 'leads'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Leads
            </button>
            <button
              onClick={() => setCurrentView('pipeline')}
              className={`px-4 py-2 rounded-lg transition-all ${
                currentView === 'pipeline'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <Target className="w-4 h-4 inline mr-2" />
              Pipeline
            </button>
            <button
              onClick={() => setCurrentView('analytics')}
              className={`px-4 py-2 rounded-lg transition-all ${
                currentView === 'analytics'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Análises
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total de Leads</span>
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.totalLeads}</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Leads Qualificados</span>
              <Target className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.qualifiedLeads}</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Negociações Ativas</span>
              <Calendar className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.activeDeals}</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Taxa de Conversão</span>
              <TrendingUp className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.conversionRate}%</p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          {currentView === 'leads' && (
            <LeadsList onSelectLead={setSelectedLeadId} />
          )}
          {currentView === 'pipeline' && (
            <PipelineView onSelectLead={setSelectedLeadId} />
          )}
          {currentView === 'analytics' && (
            <Analytics />
          )}
        </div>

        {selectedLeadId && (
          <LeadDetails
            leadId={selectedLeadId}
            onClose={() => setSelectedLeadId(null)}
            onUpdate={loadStats}
          />
        )}
      </div>
    </div>
  );
}
