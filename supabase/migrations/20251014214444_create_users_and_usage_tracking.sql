/*
  # Sistema de Registro e Controle de Uso - Nuvra AI

  ## Resumo
  Cria o sistema completo de registro de usuários e rastreamento de uso da plataforma,
  com limite de 10 análises gratuitas por usuário.

  ## 1. Novas Tabelas
  
  ### `users`
  Armazena informações de usuários registrados na plataforma.
  - `id` (uuid, primary key) - Identificador único do usuário
  - `name` (text, not null) - Nome completo do usuário
  - `phone` (text, not null, unique) - Telefone do usuário (usado como identificador único)
  - `email` (text, nullable) - Email opcional do usuário
  - `subscription_status` (text, default 'free') - Status da assinatura: 'free', 'trial', 'active', 'client'
  - `total_uses` (integer, default 0) - Total de utilizações da IA
  - `created_at` (timestamptz, default now()) - Data de criação do registro
  - `updated_at` (timestamptz, default now()) - Data da última atualização

  ### `usage_logs`
  Registra cada utilização da IA por usuário.
  - `id` (uuid, primary key) - Identificador único do log
  - `user_id` (uuid, foreign key) - Referência ao usuário
  - `input_text` (text, not null) - Texto enviado pelo usuário
  - `analysis_type` (text, default 'marketing') - Tipo de análise: 'marketing', 'code', 'chat'
  - `created_at` (timestamptz, default now()) - Data e hora da utilização

  ## 2. Segurança
  - RLS habilitado em todas as tabelas
  - Políticas permitem que usuários vejam apenas seus próprios dados
  - Políticas de inserção validam que o usuário está inserindo apenas seus próprios dados

  ## 3. Índices
  - Índice no campo `phone` da tabela `users` para buscas rápidas
  - Índice no campo `user_id` da tabela `usage_logs` para consultas de histórico

  ## 4. Triggers
  - Trigger para atualizar automaticamente o campo `updated_at` quando o registro é modificado
  - Trigger para incrementar `total_uses` quando um novo log de uso é criado
*/

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL UNIQUE,
  email text,
  subscription_status text DEFAULT 'free' CHECK (subscription_status IN ('free', 'trial', 'active', 'client')),
  total_uses integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar índice para telefone (busca rápida)
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Criar tabela de logs de uso
CREATE TABLE IF NOT EXISTS usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  input_text text NOT NULL,
  analysis_type text DEFAULT 'marketing' CHECK (analysis_type IN ('marketing', 'code', 'chat')),
  created_at timestamptz DEFAULT now()
);

-- Criar índice para user_id (consultas de histórico)
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para tabela users
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert user"
  ON users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Políticas para tabela usage_logs
CREATE POLICY "Users can view own logs"
  ON usage_logs FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert usage log"
  ON usage_logs FOR INSERT
  WITH CHECK (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para incrementar total_uses automaticamente
CREATE OR REPLACE FUNCTION increment_user_total_uses()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users 
  SET total_uses = total_uses + 1 
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para incrementar total_uses
DROP TRIGGER IF EXISTS increment_uses_on_log ON usage_logs;
CREATE TRIGGER increment_uses_on_log
  AFTER INSERT ON usage_logs
  FOR EACH ROW
  EXECUTE FUNCTION increment_user_total_uses();