/**
 * Agent Interface
 * 
 * This interface defines the structure of an Agent in the CRM system.
 * Agents will have all Contact fields plus additional custom fields.
 */

export interface Agent {
  // Basic Information
  id: string;
  firstName: string;
  lastName: string;
  jobTitle?: string;
  companyName?: string;
  email: string;
  emailOptOut?: boolean;
  phone1?: string;
  phone2?: string;
  fax?: string;
  
  // Additional Contact Fields
  deals?: string[];
  dateOfBirth?: string;
  reviews?: number;
  owner?: string;
  tags?: string[];
  source?: string;
  industry?: string;
  currency?: string;
  language?: string;
  description?: string;
  
  // Location Information
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  
  // Status & Rating
  status: "Active" | "Suspended" | "Terminated";
  rating?: number;
  
  // Image
  image?: string;
  
  // Agent-Specific Fields
  licenseNumber?: string;
  licenseExpiryDate?: string;
  brokerageStartDate?: string;
  teamOffice?: string;
  commissionSplit?: {
    percentage?: number;
    structure?: string; // e.g., "50/50", "60/40", "Tiered"
    notes?: string;
    [key: string]: any;
  };
  bankingInfo?: {
    accountHolderName?: string;
    accountNumber?: string; // Should be encrypted in production
    routingNumber?: string; // Should be encrypted in production
    bankName?: string;
    accountType?: string; // "Checking" | "Savings"
    [key: string]: any;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
    email?: string;
    [key: string]: any;
  };
  notes?: string; // Internal comments/notes
  
  // Dates
  createdAt?: string;
  updatedAt?: string;
  
  // Custom Agent Fields (to be defined later)
  [key: string]: any;
}

export interface AgentListData {
  key: string;
  Name: string;
  Role: string;
  Phone: string;
  Tags: string;
  Location: string;
  Rating: string;
  Image: string;
  Flags: string;
  Status: "Active" | "Suspended" | "Terminated";
}
