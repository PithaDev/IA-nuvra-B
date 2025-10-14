import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { DollarSign } from 'lucide-react';

interface Stage {
  id: string;
  name: string;
  order_position: number;
  color: string;
}

interface Lead {
  id: string;
  name: string;
  phone: string;
  estimated_value: number | null;
  score: number;
}

interface PipelineViewProps {
  onSelectLead: (leadId: string) => void;
}

export default function PipelineView({ onSelectLead }: PipelineViewProps) {
  const [stages, setStages] = useState<Stage[]>([]);
  const [leadsByStage, setLeadsByStage] = useState<Record<string, Lead[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPipeline();
  }, []);

  const loadPipeline = async () => {
    try {
      setLoading(true);

      const { data: stagesData } = await supabase
        .from('lead_stages')
        .select('*')
        .order('order_position');

      if (stagesData) {
        setStages(stagesData);

        const leadsByStageMap: Record<string, Lead[]> = {};

        for (const stage of stagesData) {
          const { data: qualifications } = await supabase
            .from('lead_qualifications')
            .select(`
              user_id,
              score,
              estimated_value,
              users (
                id,
                name,
                phone
              )
            `)
            .eq('stage_id', stage.id);

          leadsByStageMap[stage.id] = qualifications?.map(q => ({
            id: q.users.id,
            name: q.users.name,
            phone: q.users.phone,
            estimated_value: q.estimated_value,
            score: q.score,
          })) || [];
        }

        setLeadsByStage(leadsByStageMap);
      }
    } catch (error) {
      console.error('Error loading pipeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return 'Não informado';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {stages.map((stage) => {
          const stageLeads = leadsByStage[stage.id] || [];
          const totalValue = stageLeads.reduce((sum, lead) => sum + (lead.estimated_value || 0), 0);

          return (
            <div
              key={stage.id}
              className="flex-shrink-0 w-80 bg-white/5 rounded-xl p-4 border border-white/10"
            >
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3
                    className="font-semibold text-lg"
                    style={{ color: stage.color }}
                  >
                    {stage.name}
                  </h3>
                  <span className="text-gray-400 text-sm">
                    {stageLeads.length}
                  </span>
                </div>
                {totalValue > 0 && (
                  <div className="flex items-center gap-1 text-sm text-gray-400">
                    <DollarSign className="w-4 h-4" />
                    {formatCurrency(totalValue)}
                  </div>
                )}
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {stageLeads.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-8">
                    Nenhum lead neste estágio
                  </p>
                ) : (
                  stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => onSelectLead(lead.id)}
                      className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-all cursor-pointer"
                    >
                      <h4 className="text-white font-medium mb-1">{lead.name}</h4>
                      <p className="text-gray-400 text-sm mb-2">{lead.phone}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Score: {lead.score}/100
                        </span>
                        {lead.estimated_value && (
                          <span className="text-xs text-green-400 font-medium">
                            {formatCurrency(lead.estimated_value)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
