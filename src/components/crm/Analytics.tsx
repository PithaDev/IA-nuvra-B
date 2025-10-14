import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { TrendingUp, Users, Target, Award } from 'lucide-react';

interface AnalyticsData {
  leadsPerDay: { date: string; count: number }[];
  topSources: { name: string; count: number }[];
  conversionFunnel: { stage: string; count: number; color: string }[];
  averageScore: number;
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData>({
    leadsPerDay: [],
    topSources: [],
    conversionFunnel: [],
    averageScore: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      const { data: users } = await supabase
        .from('users')
        .select('created_at, lead_source');

      const { data: qualifications } = await supabase
        .from('lead_qualifications')
        .select(`
          score,
          stage_id,
          lead_stages (name, color),
          lead_sources (name)
        `);

      const leadsPerDay: Record<string, number> = {};
      users?.forEach(user => {
        const date = new Date(user.created_at).toLocaleDateString('pt-BR');
        leadsPerDay[date] = (leadsPerDay[date] || 0) + 1;
      });

      const sourcesCount: Record<string, number> = {};
      qualifications?.forEach(q => {
        if (q.lead_sources?.name) {
          sourcesCount[q.lead_sources.name] = (sourcesCount[q.lead_sources.name] || 0) + 1;
        }
      });

      const stagesCount: Record<string, { count: number; color: string }> = {};
      qualifications?.forEach(q => {
        if (q.lead_stages?.name) {
          if (!stagesCount[q.lead_stages.name]) {
            stagesCount[q.lead_stages.name] = { count: 0, color: q.lead_stages.color };
          }
          stagesCount[q.lead_stages.name].count++;
        }
      });

      const avgScore = qualifications?.length
        ? qualifications.reduce((sum, q) => sum + q.score, 0) / qualifications.length
        : 0;

      setData({
        leadsPerDay: Object.entries(leadsPerDay)
          .map(([date, count]) => ({ date, count }))
          .slice(-7),
        topSources: Object.entries(sourcesCount)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5),
        conversionFunnel: Object.entries(stagesCount)
          .map(([stage, { count, color }]) => ({ stage, count, color })),
        averageScore: Math.round(avgScore),
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Leads nos Últimos 7 Dias
          </h3>
          <div className="space-y-3">
            {data.leadsPerDay.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">{item.date}</span>
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 bg-blue-500 rounded"
                    style={{ width: `${item.count * 20}px` }}
                  ></div>
                  <span className="text-white font-medium">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-400" />
            Principais Fontes de Leads
          </h3>
          <div className="space-y-3">
            {data.topSources.map((source, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">{source.name}</span>
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 bg-green-500 rounded"
                    style={{ width: `${source.count * 15}px` }}
                  ></div>
                  <span className="text-white font-medium">{source.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            Funil de Conversão
          </h3>
          <div className="space-y-4">
            {data.conversionFunnel.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-400 text-sm">{item.stage}</span>
                  <span className="text-white font-medium">{item.count}</span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(item.count / Math.max(...data.conversionFunnel.map(f => f.count))) * 100}%`,
                      backgroundColor: item.color,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            Score Médio de Qualificação
          </h3>
          <div className="flex items-center justify-center py-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-8 border-white/10 flex items-center justify-center">
                <span className="text-4xl font-bold text-white">{data.averageScore}</span>
              </div>
              <div
                className="absolute top-0 left-0 w-32 h-32 rounded-full border-8 border-yellow-400"
                style={{
                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + Math.cos((data.averageScore / 100 * 360 - 90) * Math.PI / 180) * 50}% ${50 + Math.sin((data.averageScore / 100 * 360 - 90) * Math.PI / 180) * 50}%)`,
                }}
              ></div>
            </div>
          </div>
          <p className="text-center text-gray-400 text-sm">
            Qualidade média dos leads captados
          </p>
        </div>
      </div>
    </div>
  );
}
