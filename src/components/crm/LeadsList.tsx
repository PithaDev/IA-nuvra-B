import { useState, useEffect } from 'react';
import { Search, Phone, Mail, Calendar, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  total_uses: number;
  created_at: string;
  last_contact_at: string | null;
  is_qualified: boolean;
  qualification?: {
    score: number;
    stage: {
      name: string;
      color: string;
    };
    interest_level: string;
  };
}

interface LeadsListProps {
  onSelectLead: (leadId: string) => void;
}

export default function LeadsList({ onSelectLead }: LeadsListProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState<string>('all');

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          lead_qualifications (
            score,
            interest_level,
            lead_stages (
              name,
              color
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedLeads = data?.map(lead => ({
        ...lead,
        qualification: lead.lead_qualifications?.[0] ? {
          score: lead.lead_qualifications[0].score,
          stage: lead.lead_qualifications[0].lead_stages,
          interest_level: lead.lead_qualifications[0].interest_level,
        } : undefined,
      })) || [];

      setLeads(formattedLeads);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filterStage === 'all') return matchesSearch;
    if (filterStage === 'qualified') return matchesSearch && lead.is_qualified;
    return matchesSearch && lead.qualification?.stage.name === filterStage;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={filterStage}
          onChange={(e) => setFilterStage(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">Todos os Estágios</option>
          <option value="qualified">Qualificados</option>
          <option value="Novo Lead">Novo Lead</option>
          <option value="Contato Inicial">Contato Inicial</option>
          <option value="Qualificado">Qualificado</option>
          <option value="Proposta Enviada">Proposta Enviada</option>
          <option value="Negociação">Negociação</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredLeads.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            Nenhum lead encontrado
          </div>
        ) : (
          filteredLeads.map((lead) => (
            <div
              key={lead.id}
              onClick={() => onSelectLead(lead.id)}
              className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{lead.name}</h3>
                    {lead.qualification && (
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${lead.qualification.stage.color}20`,
                          color: lead.qualification.stage.color,
                        }}
                      >
                        {lead.qualification.stage.name}
                      </span>
                    )}
                    {lead.is_qualified && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                        Qualificado
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Phone className="w-4 h-4" />
                      {lead.phone}
                    </div>
                    {lead.email && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Mail className="w-4 h-4" />
                        {lead.email}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="w-4 h-4" />
                      Cadastrado em {formatDate(lead.created_at)}
                    </div>
                  </div>
                </div>

                {lead.qualification && (
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                      <span className="text-white font-semibold">{lead.qualification.score}</span>
                      <span className="text-gray-400 text-sm">/100</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {lead.total_uses} uso{lead.total_uses !== 1 ? 's' : ''}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
