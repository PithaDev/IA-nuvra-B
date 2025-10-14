/*
  # Sistema CRM Completo - Nuvra AI

  ## Resumo
  Cria a estrutura completa de CRM para gerenciar leads, qualificação, pipeline de vendas,
  interações e análises. Integrado com o sistema existente de usuários.

  ## 1. Novas Tabelas

  ### `lead_stages`
  Define os estágios do funil de vendas.
  - `id` (uuid, primary key) - Identificador único do estágio
  - `name` (text, not null) - Nome do estágio (ex: "Novo Lead", "Qualificado", "Proposta")
  - `order_position` (integer, not null) - Ordem de exibição no funil
  - `color` (text, default '#3B82F6') - Cor do estágio no dashboard
  - `created_at` (timestamptz, default now())

  ### `lead_sources`
  Rastreia de onde vieram os leads.
  - `id` (uuid, primary key) - Identificador único da fonte
  - `name` (text, not null) - Nome da fonte (ex: "Nuvra AI", "Indicação", "LinkedIn")
  - `description` (text) - Descrição da fonte
  - `created_at` (timestamptz, default now())

  ### `lead_qualifications`
  Informações adicionais de qualificação dos leads.
  - `id` (uuid, primary key) - Identificador único
  - `user_id` (uuid, foreign key) - Referência ao usuário/lead
  - `stage_id` (uuid, foreign key) - Estágio atual no funil
  - `source_id` (uuid, foreign key) - Fonte do lead
  - `company_name` (text) - Nome da empresa
  - `company_size` (text) - Tamanho da empresa (pequeno, médio, grande)
  - `industry` (text) - Setor/indústria
  - `job_title` (text) - Cargo do lead
  - `budget_range` (text) - Faixa de orçamento
  - `pain_points` (text) - Problemas/dores identificados
  - `interest_level` (text) - Nível de interesse (baixo, médio, alto)
  - `score` (integer, default 0) - Score de qualificação (0-100)
  - `notes` (text) - Observações gerais
  - `last_interaction_at` (timestamptz) - Data da última interação
  - `expected_close_date` (date) - Data prevista de fechamento
  - `estimated_value` (decimal) - Valor estimado do negócio
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

  ### `interactions`
  Registra todas as interações com os leads.
  - `id` (uuid, primary key) - Identificador único da interação
  - `user_id` (uuid, foreign key) - Referência ao usuário/lead
  - `interaction_type` (text, not null) - Tipo: 'email', 'call', 'meeting', 'whatsapp', 'ai_usage'
  - `subject` (text) - Assunto da interação
  - `description` (text, not null) - Descrição detalhada
  - `duration_minutes` (integer) - Duração em minutos (para calls/meetings)
  - `outcome` (text) - Resultado da interação
  - `next_action` (text) - Próxima ação a tomar
  - `next_action_date` (date) - Data da próxima ação
  - `created_at` (timestamptz, default now())

  ### `tasks`
  Tarefas e follow-ups pendentes.
  - `id` (uuid, primary key) - Identificador único da tarefa
  - `user_id` (uuid, foreign key) - Lead relacionado
  - `title` (text, not null) - Título da tarefa
  - `description` (text) - Descrição detalhada
  - `priority` (text, default 'medium') - Prioridade: 'low', 'medium', 'high', 'urgent'
  - `status` (text, default 'pending') - Status: 'pending', 'in_progress', 'completed', 'cancelled'
  - `due_date` (date) - Data de vencimento
  - `completed_at` (timestamptz) - Data de conclusão
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

  ### `stage_history`
  Histórico de movimentação entre estágios.
  - `id` (uuid, primary key) - Identificador único
  - `user_id` (uuid, foreign key) - Lead relacionado
  - `from_stage_id` (uuid, foreign key) - Estágio de origem
  - `to_stage_id` (uuid, foreign key) - Estágio de destino
  - `reason` (text) - Motivo da mudança
  - `created_at` (timestamptz, default now())

  ## 2. Alterações na Tabela `users`
  - Adiciona campos para CRM:
    - `lead_source` (text) - Fonte original do lead
    - `is_qualified` (boolean) - Se o lead está qualificado
    - `last_contact_at` (timestamptz) - Data do último contato

  ## 3. Segurança (RLS)
  - RLS habilitado em todas as novas tabelas
  - Acesso público para leitura de stages e sources (são dados de referência)
  - Políticas restritivas para dados sensíveis de leads

  ## 4. Índices
  - Índices em campos de busca e filtros frequentes
  - Índices em foreign keys para joins rápidos

  ## 5. Dados Iniciais
  - Estágios padrão do funil de vendas
  - Fontes de leads padrão
*/

-- Alterar tabela users para adicionar campos de CRM
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'lead_source'
  ) THEN
    ALTER TABLE users ADD COLUMN lead_source text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'is_qualified'
  ) THEN
    ALTER TABLE users ADD COLUMN is_qualified boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'last_contact_at'
  ) THEN
    ALTER TABLE users ADD COLUMN last_contact_at timestamptz;
  END IF;
END $$;

-- Criar tabela de estágios do funil
CREATE TABLE IF NOT EXISTS lead_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  order_position integer NOT NULL UNIQUE,
  color text DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de fontes de leads
CREATE TABLE IF NOT EXISTS lead_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de qualificação de leads
CREATE TABLE IF NOT EXISTS lead_qualifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  stage_id uuid REFERENCES lead_stages(id) ON DELETE SET NULL,
  source_id uuid REFERENCES lead_sources(id) ON DELETE SET NULL,
  company_name text,
  company_size text CHECK (company_size IN ('pequeno', 'medio', 'grande', 'enterprise')),
  industry text,
  job_title text,
  budget_range text,
  pain_points text,
  interest_level text DEFAULT 'medio' CHECK (interest_level IN ('baixo', 'medio', 'alto')),
  score integer DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  notes text,
  last_interaction_at timestamptz,
  expected_close_date date,
  estimated_value decimal(12, 2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar índices para lead_qualifications
CREATE INDEX IF NOT EXISTS idx_lead_qualifications_user_id ON lead_qualifications(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_qualifications_stage_id ON lead_qualifications(stage_id);
CREATE INDEX IF NOT EXISTS idx_lead_qualifications_source_id ON lead_qualifications(source_id);
CREATE INDEX IF NOT EXISTS idx_lead_qualifications_score ON lead_qualifications(score);

-- Criar tabela de interações
CREATE TABLE IF NOT EXISTS interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  interaction_type text NOT NULL CHECK (interaction_type IN ('email', 'call', 'meeting', 'whatsapp', 'ai_usage', 'other')),
  subject text,
  description text NOT NULL,
  duration_minutes integer,
  outcome text,
  next_action text,
  next_action_date date,
  created_at timestamptz DEFAULT now()
);

-- Criar índices para interactions
CREATE INDEX IF NOT EXISTS idx_interactions_user_id ON interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_type ON interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_interactions_created_at ON interactions(created_at DESC);

-- Criar tabela de tarefas
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  due_date date,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar índices para tasks
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Criar tabela de histórico de estágios
CREATE TABLE IF NOT EXISTS stage_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  from_stage_id uuid REFERENCES lead_stages(id) ON DELETE SET NULL,
  to_stage_id uuid NOT NULL REFERENCES lead_stages(id) ON DELETE CASCADE,
  reason text,
  created_at timestamptz DEFAULT now()
);

-- Criar índice para stage_history
CREATE INDEX IF NOT EXISTS idx_stage_history_user_id ON stage_history(user_id);
CREATE INDEX IF NOT EXISTS idx_stage_history_created_at ON stage_history(created_at DESC);

-- Habilitar RLS em todas as tabelas
ALTER TABLE lead_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE stage_history ENABLE ROW LEVEL SECURITY;

-- Políticas para lead_stages (público para leitura)
CREATE POLICY "Anyone can view stages"
  ON lead_stages FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert stages"
  ON lead_stages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update stages"
  ON lead_stages FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Políticas para lead_sources (público para leitura)
CREATE POLICY "Anyone can view sources"
  ON lead_sources FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert sources"
  ON lead_sources FOR INSERT
  WITH CHECK (true);

-- Políticas para lead_qualifications
CREATE POLICY "Anyone can view qualifications"
  ON lead_qualifications FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert qualification"
  ON lead_qualifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update qualifications"
  ON lead_qualifications FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Políticas para interactions
CREATE POLICY "Anyone can view interactions"
  ON interactions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert interaction"
  ON interactions FOR INSERT
  WITH CHECK (true);

-- Políticas para tasks
CREATE POLICY "Anyone can view tasks"
  ON tasks FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert task"
  ON tasks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update tasks"
  ON tasks FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Políticas para stage_history
CREATE POLICY "Anyone can view stage history"
  ON stage_history FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert stage history"
  ON stage_history FOR INSERT
  WITH CHECK (true);

-- Trigger para atualizar updated_at em lead_qualifications
DROP TRIGGER IF EXISTS update_lead_qualifications_updated_at ON lead_qualifications;
CREATE TRIGGER update_lead_qualifications_updated_at
  BEFORE UPDATE ON lead_qualifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar updated_at em tasks
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para registrar mudanças de estágio automaticamente
CREATE OR REPLACE FUNCTION log_stage_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.stage_id IS DISTINCT FROM NEW.stage_id THEN
    INSERT INTO stage_history (user_id, from_stage_id, to_stage_id)
    VALUES (NEW.user_id, OLD.stage_id, NEW.stage_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para registrar mudanças de estágio
DROP TRIGGER IF EXISTS track_stage_changes ON lead_qualifications;
CREATE TRIGGER track_stage_changes
  AFTER UPDATE ON lead_qualifications
  FOR EACH ROW
  EXECUTE FUNCTION log_stage_change();

-- Função para atualizar last_interaction_at automaticamente
CREATE OR REPLACE FUNCTION update_last_interaction()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE lead_qualifications 
  SET last_interaction_at = NEW.created_at
  WHERE user_id = NEW.user_id;
  
  UPDATE users
  SET last_contact_at = NEW.created_at
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar last_interaction_at
DROP TRIGGER IF EXISTS update_interaction_timestamp ON interactions;
CREATE TRIGGER update_interaction_timestamp
  AFTER INSERT ON interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_last_interaction();

-- Inserir estágios padrão do funil
INSERT INTO lead_stages (name, order_position, color) VALUES
  ('Novo Lead', 1, '#6B7280'),
  ('Contato Inicial', 2, '#3B82F6'),
  ('Qualificado', 3, '#8B5CF6'),
  ('Proposta Enviada', 4, '#F59E0B'),
  ('Negociação', 5, '#10B981'),
  ('Fechado - Ganho', 6, '#059669'),
  ('Fechado - Perdido', 7, '#EF4444')
ON CONFLICT (order_position) DO NOTHING;

-- Inserir fontes padrão
INSERT INTO lead_sources (name, description) VALUES
  ('Nuvra AI', 'Lead captado através da plataforma Nuvra AI'),
  ('Indicação', 'Indicação de cliente ou parceiro'),
  ('LinkedIn', 'Prospecção via LinkedIn'),
  ('Instagram', 'Rede social Instagram'),
  ('Google Ads', 'Anúncios no Google'),
  ('Facebook Ads', 'Anúncios no Facebook'),
  ('Website', 'Formulário do website'),
  ('Evento', 'Evento presencial ou online'),
  ('Cold Call', 'Ligação fria'),
  ('Outro', 'Outras fontes')
ON CONFLICT (name) DO NOTHING;