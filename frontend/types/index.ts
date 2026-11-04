export type UserRole = 'client' | 'freelancer' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  paypal_email?: string;
  avatar_url?: string;
  created_at: string;
}

export interface ProjectMember {
  user_id: string;
  role: string;
  full_name?: string;
  email?: string;
}

export interface Project {
  id: string;
  client_id: string;
  title: string;
  description: string;
  budget: number;
  currency: string;
  deadline?: string;
  status: 'draft' | 'agreement_pending' | 'active' | 'completed' | 'disputed' | 'cancelled';
  created_at: string;
  updated_at: string;
  client_name?: string;
  freelancer_id?: string;
  freelancer_name?: string;
  freelancer_email?: string;
  members?: ProjectMember[];
}

export interface BudgetItem {
  milestone: string;
  amount: number;
  percentage: number;
}

export interface AgreementAcceptance {
  id: string;
  agreement_id: string;
  user_id: string;
  role: string;
  accepted_at: string;
  signature_hash: string;
}

export interface Agreement {
  id: string;
  project_id: string;
  version: number;
  title: string;
  scope_of_work: string;
  budget_allocation: BudgetItem[];
  acceptance_criteria: string[];
  assumptions: string[];
  clarification_questions: string[];
  status: 'draft' | 'pending_acceptance' | 'accepted' | 'superseded';
  created_at: string;
  updated_at: string;
  acceptances?: AgreementAcceptance[];
  is_client_accepted: boolean;
  is_freelancer_accepted: boolean;
}

export interface Milestone {
  id: string;
  project_id: string;
  agreement_id?: string;
  sequence_order: number;
  title: string;
  description: string;
  amount: number;
  currency: string;
  deadline?: string;
  acceptance_criteria: string[];
  status: 'pending' | 'in_progress' | 'submitted' | 'changes_requested' | 'approved' | 'invoiced' | 'paid';
  created_at: string;
  updated_at: string;
  has_deliverable?: boolean;
  latest_deliverable_id?: string;
  latest_verdict?: 'satisfied' | 'uncertain' | 'missing' | 'unable_to_verify';
  invoice_id?: string;
  invoice_status?: string;
  paypal_hosted_url?: string;
}

export interface Deliverable {
  id: string;
  milestone_id: string;
  submitted_by: string;
  title: string;
  description: string;
  file_urls: string[];
  demo_url?: string;
  notes?: string;
  version: number;
  status: string;
  created_at: string;
  updated_at: string;
  has_verification_report: boolean;
  verification_report_id?: string;
}

export interface CriterionEvaluation {
  criterion: string;
  verdict: 'satisfied' | 'uncertain' | 'missing' | 'unable_to_verify';
  evidence_reference: string;
  notes?: string;
  confidence: number;
}

export interface VerificationReport {
  id: string;
  deliverable_id: string;
  milestone_id: string;
  summary: string;
  criteria_analysis: CriterionEvaluation[];
  satisfied_criteria: string[];
  uncertain_criteria: string[];
  missing_criteria: string[];
  missing_evidence: string[];
  recommendations: string[];
  confidence_score: number;
  overall_verdict: 'satisfied' | 'uncertain' | 'missing' | 'unable_to_verify';
  generated_by: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  milestone_id: string;
  project_id: string;
  client_id: string;
  freelancer_id: string;
  paypal_invoice_id?: string;
  paypal_invoice_number?: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED';
  amount: number;
  currency: string;
  invoice_date: string;
  due_date?: string;
  paypal_hosted_url?: string;
  created_at: string;
  updated_at: string;
}

export interface TrustEvent {
  id: string;
  sequence_number: number;
  project_id: string;
  event_type: string;
  actor_id?: string;
  actor_name?: string;
  entity_id?: string;
  payload: Record<string, any>;
  prev_hash: string;
  current_hash: string;
  timestamp: string;
}

export interface TrustStatus {
  total_events: number;
  is_valid: boolean;
  genesis_hash: string;
  latest_hash: string;
  verified_at: string;
  tamper_detected: boolean;
}

export interface PaymentCoordination {
  project_id: string;
  overall_health: 'healthy' | 'action_required' | 'blocked';
  total_budget: string;
  paid_amount: string;
  pending_amount: string;
  active_milestone_status: string;
  latest_invoice_status?: string;
  action_items: string[];
  suggested_communications: string[];
  risk_assessment: string;
}
