import { useState, useEffect } from 'react';
import { X, Phone, Mail, Calendar, TrendingUp, Building, DollarSign, MessageSquare, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface LeadDetailsProps {
  leadId: string;
  onClose: () => void;
  onUpdate: () => void;
}

interface LeadData {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  created_at: string;
  total_uses: number;
  subscription_status: string;
  is_qualified: boolean;
  qualification?: {
    id: string;
    score: number;
    company_name: string | null;
    company_size: string | null;
    industry: string | null;
    job_title: string | null;
    interest_level: string;
    notes: string | null;
    estimated_value: number | null;
    stage_id: string;
    stage_name: string;
    source_name: string;
  };
  interactions: Array<{
    id: string;
    interaction_type: string;
    subject: string;
    description: string;
    created_at: string;
  }>;
}

export default function LeadDetails({ leadId, onClose, onUpdate }: LeadDetailsProps) {
  const [lead, setLead] = useState<LeadData | null>(null);
  const [stages, setStages] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    company_size: 'medio',
    industry: '',
    job_title: '',
    interest_level: 'medio',
    estimated_value: '',
    notes: '',
    stage_id: '',
  });

  useEffect(() => {
    loadLeadDetails();
    loadStages();
  }, [leadId]);

  const loadStages = async () => {
    const { data } = await supabase
      .from('lead_stages')
      .select('id, name')
      .order('order_position');

    if (data) setStages(data);
  };

  const loadLeadDetails = async () => {
    try {
      setLoading(true);
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', leadId)
        .single();

      if (userError) throw userError;

      const { data: qualData } = await supabase
        .from('lead_qualifications')
        .select(`
          *,
          lead_stages (name),
          lead_sources (name)
        `)
        .eq('user_id', leadId)
        .maybeSingle();

      const { data: interactionsData } = await supabase
        .from('interactions')
        .select('*')
        .eq('user_id', leadId)
        .order('created_at', { ascending: false })
        .limit(10);

      setLead({
        ...userData,
        qualification: qualData ? {
          id: qualData.id,
          score: qualData.score,
          company_name: qualData.company_name,
          company_size: qualData.company_size,
          industry: qualData.industry,
          job_title: qualData.job_title,
          interest_level: qualData.interest_level,
          notes: qualData.notes,
          estimated_value: qualData.estimated_value,
          stage_id: qualData.stage_id,
          stage_name: qualData.lead_stages.name,
          source_name: qualData.lead_sources.name,
        } : undefined,
        interactions: interactionsData || [],
      });

      if (qualData) {
        setFormData({
          company_name: qualData.company_name || '',
          company_size: qualData.company_size || 'medio',
          industry: qualData.industry || '',
          job_title: qualData.job_title || '',
          interest_level: qualData.interest_level || 'medio',
          estimated_value: qualData.estimated_value?.toString() || '',
          notes: qualData.notes || '',
          stage_id: qualData.stage_id || '',
        });
      }
    } catch (error) {
      console.error('Error loading lead details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!lead?.qualification) return;

    try {
      const { error } = await supabase
        .from('lead_qualifications')
        .update({
          company_name: formData.company_name || null,
          company_size: formData.company_size,
          industry: formData.industry || null,
          job_title: formData.job_title || null,
          interest_level: formData.interest_level,
          estimated_value: formData.estimated_value ? parseFloat(formData.estimated_value) : null,
          notes: formData.notes || null,
          stage_id: formData.stage_id || null,
        })
        .eq('id', lead.qualification.id);

      if (error) throw error;

      if (formData.stage_id !== lead.qualification.stage_id) {
        const newStage = stages.find(s => s.id === formData.stage_id);
        await supabase.from('interactions').insert({
          user_id: leadId,
          interaction_type: 'other',
          subject: 'Mudança de estágio',
          description: `Lead movido para ${newStage?.name}`,
        });
      }

      await loadLeadDetails();
      onUpdate();
      setEditing(false);
    } catch (error) {
      console.error('Error saving lead:', error);
    }
  };

  const handleQualify = async () => {
    try {
      await supabase
        .from('users')
        .update({ is_qualified: true })
        .eq('id', leadId);

      await loadLeadDetails();
      onUpdate();
    } catch (error) {
      console.error('Error qualifying lead:', error);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!lead) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1b2e] border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white">{lead.name}</h2>
            <p className="text-gray-400 text-sm mt-1">
              Cliente desde {new Date(lead.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!lead.is_qualified && (
              <button
                onClick={handleQualify}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Marcar como Qualificado
              </button>
            )}
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
                >
                  Salvar
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
              >
                Editar
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-all"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-100px)] p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-300">
                <Phone className="w-5 h-5 text-blue-400" />
                <span>{lead.phone}</span>
              </div>
              {lead.email && (
                <div className="flex items-center gap-3 text-gray-300">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <span>{lead.email}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-gray-300">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <span>{lead.total_uses} usos da plataforma</span>
              </div>
              {lead.qualification && (
                <div className="flex items-center gap-3 text-gray-300">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <span>Fonte: {lead.qualification.source_name}</span>
                </div>
              )}
            </div>

            {lead.qualification && (
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-3">Score de Qualificação</h3>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-blue-400">
                    {lead.qualification.score}
                  </div>
                  <div className="flex-1">
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${lead.qualification.score}%` }}
                      ></div>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">
                      Estágio: {lead.qualification.stage_name}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white/5 rounded-xl p-6 mb-6">
            <h3 className="text-white font-semibold mb-4">Informações de Qualificação</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm block mb-1">Empresa</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                ) : (
                  <p className="text-white">{lead.qualification?.company_name || 'Não informado'}</p>
                )}
              </div>

              <div>
                <label className="text-gray-400 text-sm block mb-1">Cargo</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.job_title}
                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                ) : (
                  <p className="text-white">{lead.qualification?.job_title || 'Não informado'}</p>
                )}
              </div>

              <div>
                <label className="text-gray-400 text-sm block mb-1">Setor</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                ) : (
                  <p className="text-white">{lead.qualification?.industry || 'Não informado'}</p>
                )}
              </div>

              <div>
                <label className="text-gray-400 text-sm block mb-1">Tamanho da Empresa</label>
                {editing ? (
                  <select
                    value={formData.company_size}
                    onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  >
                    <option value="pequeno">Pequeno</option>
                    <option value="medio">Médio</option>
                    <option value="grande">Grande</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                ) : (
                  <p className="text-white capitalize">{lead.qualification?.company_size || 'Não informado'}</p>
                )}
              </div>

              <div>
                <label className="text-gray-400 text-sm block mb-1">Valor Estimado</label>
                {editing ? (
                  <input
                    type="number"
                    value={formData.estimated_value}
                    onChange={(e) => setFormData({ ...formData, estimated_value: e.target.value })}
                    placeholder="R$ 0,00"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                ) : (
                  <p className="text-white">
                    {lead.qualification?.estimated_value
                      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.qualification.estimated_value)
                      : 'Não informado'}
                  </p>
                )}
              </div>

              <div>
                <label className="text-gray-400 text-sm block mb-1">Estágio</label>
                {editing ? (
                  <select
                    value={formData.stage_id}
                    onChange={(e) => setFormData({ ...formData, stage_id: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  >
                    {stages.map(stage => (
                      <option key={stage.id} value={stage.id}>{stage.name}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-white">{lead.qualification?.stage_name || 'Não informado'}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="text-gray-400 text-sm block mb-1">Observações</label>
              {editing ? (
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white resize-none"
                />
              ) : (
                <p className="text-white">{lead.qualification?.notes || 'Nenhuma observação'}</p>
              )}
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              Histórico de Interações
            </h3>
            <div className="space-y-3">
              {lead.interactions.length === 0 ? (
                <p className="text-gray-400 text-center py-4">Nenhuma interação registrada</p>
              ) : (
                lead.interactions.map((interaction) => (
                  <div key={interaction.id} className="border-l-2 border-blue-500 pl-4 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-medium">{interaction.subject}</span>
                      <span className="text-gray-400 text-sm">
                        {new Date(interaction.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{interaction.description}</p>
                    <span className="text-xs text-gray-500 capitalize">{interaction.interaction_type}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
