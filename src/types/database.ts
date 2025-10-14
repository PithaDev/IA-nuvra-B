export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subscription_status: 'free' | 'trial' | 'active' | 'client';
  total_uses: number;
  created_at: string;
  updated_at: string;
}

export interface UsageLog {
  id: string;
  user_id: string;
  input_text: string;
  analysis_type: 'marketing' | 'code' | 'chat';
  created_at: string;
}
