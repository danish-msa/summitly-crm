/**
 * Agent Onboarding Interfaces
 * 
 * These interfaces define the structure for the agent onboarding system
 * in the Ontario real estate brokerage CRM.
 */

export type OnboardingStatus = 
  | 'Invited' 
  | 'Onboarding Started' 
  | 'Profile Complete' 
  | 'Compliance Pending' 
  | 'Awaiting Approval' 
  | 'Active' 
  | 'Suspended' 
  | 'Terminated';

export type ComplianceStatus = 'Pending' | 'In Review' | 'Approved' | 'Rejected';

export type DocumentStatus = 'Pending' | 'Approved' | 'Rejected';

export type AgreementStatus = 'Pending' | 'Signed' | 'Expired';

export type AgentRole = 'Salesperson' | 'Broker' | 'Team Leader';

export type DocumentType = 
  | 'RECO Registration' 
  | 'E&O Insurance' 
  | 'FINTRAC Acknowledgment' 
  | 'PIPEDA Consent' 
  | 'Government ID' 
  | 'Other';

export type AgreementType = 
  | 'Independent Contractor' 
  | 'Brokerage Policies' 
  | 'Code of Ethics' 
  | 'AML Policy' 
  | 'Other';

export type TrainingType = 
  | 'Brokerage Policies' 
  | 'Compliance Training' 
  | 'CRM Usage' 
  | 'Marketing Guidelines' 
  | 'Other';

/**
 * Main onboarding record
 */
export interface AgentOnboarding {
  id: string;
  agentId: string;
  
  // Status
  status: OnboardingStatus;
  onboardingStartedAt?: string;
  completedAt?: string;
  activatedAt?: string;
  activatedBy?: string;
  
  // Invitation
  invitationToken?: string;
  invitationSentAt?: string;
  invitationExpiresAt?: string;
  invitationAcceptedAt?: string;
  invitedBy?: string;
  
  // Role & Assignment
  role?: AgentRole;
  assignedOffice?: string;
  assignedTeam?: string;
  
  // Completion Flags
  profileCompleted: boolean;
  profileCompletedAt?: string;
  complianceStatus?: ComplianceStatus;
  complianceCompletedAt?: string;
  trainingCompleted: boolean;
  trainingCompletedAt?: string;
  financialSetup: boolean;
  financialApprovedAt?: string;
  financialApprovedBy?: string;
  
  // Admin
  adminNotes?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Relations (optional, populated when fetched with relations)
  checklist?: OnboardingChecklist[];
  documents?: OnboardingDocument[];
  agreements?: OnboardingAgreement[];
  training?: OnboardingTraining[];
  auditLogs?: OnboardingAuditLog[];
}

/**
 * Onboarding checklist item
 */
export interface OnboardingChecklist {
  id: string;
  onboardingId: string;
  step: string; // Step identifier
  stepName: string;
  stepOrder: number;
  isRequired: boolean;
  isCompleted: boolean;
  completedAt?: string;
  completedBy?: string;
  stepData?: any; // JSON data
  createdAt: string;
  updatedAt: string;
}

/**
 * Onboarding document
 */
export interface OnboardingDocument {
  id: string;
  onboardingId: string;
  documentType: DocumentType;
  documentName: string;
  fileName: string;
  filePath: string;
  fileSize?: number;
  mimeType?: string;
  expiryDate?: string;
  isExpired: boolean;
  isRequired: boolean;
  status: DocumentStatus;
  statusChangedAt?: string;
  statusChangedBy?: string;
  adminNotes?: string;
  rejectionReason?: string;
  version: number;
  previousVersion?: string;
  uploadedBy?: string;
  uploadedAt: string;
  uploadIp?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Onboarding agreement (e-signature)
 */
export interface OnboardingAgreement {
  id: string;
  onboardingId: string;
  agreementType: AgreementType;
  agreementName: string;
  documentId?: string;
  documentVersion?: string;
  signedBy?: string;
  signedAt?: string;
  signatureIp?: string;
  signatureData?: any; // JSON signature data
  status: AgreementStatus;
  isRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Onboarding training
 */
export interface OnboardingTraining {
  id: string;
  onboardingId: string;
  trainingType: TrainingType;
  trainingName: string;
  trainingUrl?: string;
  isCompleted: boolean;
  completedAt?: string;
  completedBy?: string;
  quizScore?: number;
  quizPassed?: boolean;
  quizAttempts: number;
  isRequired: boolean;
  isMandatory: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Onboarding audit log
 */
export interface OnboardingAuditLog {
  id: string;
  onboardingId: string;
  action: string;
  actionType: string;
  description?: string;
  performedBy?: string;
  performedByRole?: string;
  ipAddress?: string;
  oldValue?: any;
  newValue?: any;
  createdAt: string;
}

/**
 * Create onboarding request
 */
export interface CreateOnboardingRequest {
  agentId: string;
  email: string;
  role?: AgentRole;
  assignedOffice?: string;
  assignedTeam?: string;
  invitedBy?: string;
}

/**
 * Update onboarding status request
 */
export interface UpdateOnboardingStatusRequest {
  status: OnboardingStatus;
  adminNotes?: string;
  activatedBy?: string;
}

/**
 * Upload document request
 */
export interface UploadDocumentRequest {
  documentType: DocumentType;
  documentName: string;
  file: File;
  expiryDate?: string;
  isRequired?: boolean;
}

/**
 * Approve/reject document request
 */
export interface ReviewDocumentRequest {
  status: 'Approved' | 'Rejected';
  adminNotes?: string;
  rejectionReason?: string;
}

/**
 * Sign agreement request
 */
export interface SignAgreementRequest {
  agreementType: AgreementType;
  signatureData: any;
  ipAddress?: string;
}

/**
 * Complete training request
 */
export interface CompleteTrainingRequest {
  trainingType: TrainingType;
  quizScore?: number;
  quizPassed?: boolean;
}

/**
 * Onboarding progress summary
 */
export interface OnboardingProgress {
  totalSteps: number;
  completedSteps: number;
  requiredSteps: number;
  completedRequiredSteps: number;
  progressPercentage: number;
  canProceed: boolean; // Can proceed to next step
  canActivate: boolean; // Can be activated by admin
  blockingIssues: string[]; // List of issues preventing activation
}
