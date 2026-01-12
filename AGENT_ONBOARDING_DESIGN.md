# Agent Onboarding System Design
## Ontario Real Estate Brokerage CRM

## 🎯 Expert Recommendations & Refinements

### Key Improvements to Your Guideline:

1. **Status Workflow** - More granular statuses for better tracking
2. **Document Versioning** - Critical for compliance audits
3. **Automated Expiry Monitoring** - Prevent compliance lapses
4. **Role-Based Access** - Different onboarding paths for Salesperson vs Broker
5. **Audit Trail** - Every action logged for compliance
6. **Integration Points** - RECO verification API (if available)
7. **Workflow Engine** - Prevent skipping steps

## 📊 Database Schema Design

### Core Models:

1. **AgentOnboarding** - Main onboarding record
2. **OnboardingChecklist** - Task/step tracking
3. **OnboardingDocument** - Document uploads with expiry
4. **OnboardingInvitation** - Invite tracking
5. **OnboardingAgreement** - E-signature tracking
6. **OnboardingTraining** - Training completion tracking
7. **OnboardingAuditLog** - Complete audit trail

## 🔄 Status Workflow

```
Invited → Onboarding Started → Profile Complete → Compliance Pending → 
Awaiting Approval → Active → (Suspended/Terminated)
```

### Status Definitions:

- **Invited**: Admin sent invitation, agent hasn't accepted
- **Onboarding Started**: Agent accepted invite, started process
- **Profile Complete**: Personal/professional info filled
- **Compliance Pending**: Documents uploaded, awaiting admin review
- **Awaiting Approval**: All steps complete, admin review pending
- **Active**: Fully onboarded, can create deals
- **Suspended**: Temporarily inactive (compliance issue)
- **Terminated**: No longer with brokerage

## 📋 Onboarding Steps (Refined)

### Step 1: Invitation (Admin)
- Email invitation
- Assign role (Salesperson/Broker)
- Assign office/team
- Set provisional status
- Track invite status (sent/viewed/accepted)

### Step 2: Account Creation (Agent)
- Password creation
- 2FA setup (recommended)
- Accept Terms & Privacy Policy
- System creates onboarding record

### Step 3: Profile Completion
- Legal name (must match RECO)
- Preferred display name
- Contact information
- Emergency contact
- RECO registration number
- License type & dates
- Brokerage join date

### Step 4: Compliance Documents (CRITICAL)
- RECO registration confirmation
- E&O Insurance certificate
- FINTRAC acknowledgment
- PIPEDA consent
- Government ID
- Each with: upload, expiry date, status, admin notes

### Step 5: Agreements (E-Signature)
- Independent Contractor Agreement
- Brokerage Policies & Procedures
- Code of Ethics
- Anti-Money Laundering Policy
- Each with: signature, timestamp, IP, document version

### Step 6: Financial Setup
- Commission split acknowledgment
- Banking information (encrypted)
- HST number (if applicable)
- Admin approval required

### Step 7: Training
- Brokerage policies training
- Compliance training
- CRM usage training
- Marketing guidelines
- Track completion with dates

### Step 8: Marketing Profile (Optional)
- Headshot
- Bio
- Languages
- Service areas
- Social media links

### Step 9: Final Activation (Admin)
- Admin reviews all steps
- System validates completeness
- Admin activates agent
- Agent gains full access

## 🔒 Security & Compliance

1. **Document Encryption**: All sensitive documents encrypted at rest
2. **Access Control**: Role-based access to sensitive data
3. **Audit Logging**: Every action logged with user, timestamp, IP
4. **Document Retention**: Compliance with Ontario retention requirements
5. **Expiry Alerts**: Automated alerts for expiring documents
6. **Version Control**: Document versions tracked for audit

## ⚠️ Critical Business Rules

1. **No Deal Creation**: Agent cannot create deals until status = "Active"
2. **Mandatory Documents**: Cannot proceed without all mandatory documents
3. **Expiry Monitoring**: System blocks access if critical documents expired
4. **Admin Approval**: All compliance documents require admin approval
5. **Status Lock**: Cannot skip steps or change status manually

## 🚀 Automation Opportunities

1. **Email Reminders**: Automated reminders for incomplete steps
2. **Expiry Alerts**: 30/60/90 days before document expiry
3. **Status Progression**: Auto-advance when steps complete
4. **Compliance Checks**: Automated validation of document completeness
5. **Access Control**: Automatic access granting/revocation based on status
