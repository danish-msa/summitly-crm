"use client";
/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import dayjs, { type Dayjs } from "dayjs";
import CommonDatePicker from "@/core/common/common-datePicker/commonDatePicker";
import CommonSelect from "@/core/common/common-select/commonSelect";
import CommonTagInputs from "@/core/common/common-tagInput/commonTagInputs";
import CommonPhoneInput from "@/core/common/common-phoneInput/commonPhoneInput";
import {
  City,
  Company_Name,
  Country,
  Currency,
  Deals,
  Industry,
  Language,
  Owner,
  Period,
  Pipeine,
  Priority,
  Source,
  State,
  Status_Open,
  AgentStatus,
} from "../../../../../core/json/selectOption";
import ImageWithBasePath from "@/core/common/imageWithBasePath";
import MultipleSelect from "@/core/common/multiple-Select/multipleSelect";
import TextEditor from "@/core/common/texteditor/texteditor";
import Link from "next/link";
import { all_routes } from "@/router/all_routes";
import { createAgent } from "@/core/services/agents.service";

interface ModalAgentsProps {
  onSuccess?: () => void;
}

const ModalAgents = ({ onSuccess }: ModalAgentsProps) => {
  const [tags, setTags] = useState<string[]>(["Collab", "VIP"]);
  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags);
  };
  const [phone, setPhone] = useState<string | undefined>();
  const [phone2, setPhone2] = useState<string | undefined>();

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    job_title: '',
    company_name: '',
    email: '',
    email_opt_out: false,
    phone1: '',
    phone2: '',
    fax: '',
    tags: [] as string[],
    source: '',
    description: '',
    status: 'Active',
    // New Agent-Specific Fields
    license_number: '',
    license_expiry_date: '',
    brokerage_start_date: '',
    team_office: '',
    commission_split: {} as any,
    banking_info: {} as any,
    emergency_contact: {} as any,
    notes: '',
  });

  const handleChange = (value: string[]) => {
    setSelectedItems(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Use phone state directly since CommonPhoneInput updates both state and formData
      const response = await createAgent({
        firstName: formData.first_name,
        lastName: formData.last_name,
        jobTitle: formData.job_title,
        companyName: formData.company_name,
        email: formData.email,
        emailOptOut: formData.email_opt_out,
        phone1: phone || formData.phone1 || undefined,
        phone2: phone2 || formData.phone2 || undefined,
        fax: formData.fax,
        tags: tags,
        source: formData.source,
        description: formData.description,
        status: formData.status as 'Active' | 'Suspended' | 'Terminated',
        // New Agent-Specific Fields
        licenseNumber: formData.license_number || undefined,
        licenseExpiryDate: formData.license_expiry_date || undefined,
        brokerageStartDate: formData.brokerage_start_date || undefined,
        teamOffice: formData.team_office || undefined,
        commissionSplit: Object.keys(formData.commission_split).length > 0 ? formData.commission_split : undefined,
        bankingInfo: Object.keys(formData.banking_info).length > 0 ? formData.banking_info : undefined,
        emergencyContact: Object.keys(formData.emergency_contact).length > 0 ? formData.emergency_contact : undefined,
        notes: formData.notes || undefined,
      });

      if (response.success) {
        // Close modal
        const offcanvas = document.getElementById('offcanvas_add');
        if (offcanvas) {
          const bsOffcanvas = (window as any).bootstrap?.Offcanvas.getInstance(offcanvas);
          if (bsOffcanvas) {
            bsOffcanvas.hide();
          }
        }
        
        // Reset form
        setFormData({
          first_name: '',
          last_name: '',
          job_title: '',
          company_name: '',
          email: '',
          email_opt_out: false,
          phone1: '',
          phone2: '',
          fax: '',
          tags: [],
          source: '',
          description: '',
          status: 'Active',
          license_number: '',
          license_expiry_date: '',
          brokerage_start_date: '',
          team_office: '',
          commission_split: {},
          banking_info: {},
          emergency_contact: {},
          notes: '',
        });
        setTags([]);
        setPhone(undefined);
        setPhone2(undefined);

        // Refresh list
        if (onSuccess) {
          onSuccess();
        }
      } else {
        console.error('❌ Failed to create agent:', response.error);
        alert(response.error || 'Failed to create agent');
      }
    } catch (error: any) {
      console.error('❌ Error creating agent:', error);
      alert('Failed to create agent. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const options = [
    {
      label: (
        <div className="d-flex align-items-center gap-2">
          <div
            style={{
              borderRadius: "50%",
              overflow: "hidden",
              width: 24,
              height: 24,
            }}
          >
            <ImageWithBasePath
              src="assets/img/profiles/avatar-02.jpg"
              alt="Robert"
              width={24}
              height={24}
            />
          </div>
          Robert Johnson
        </div>
      ),
      value: "robert-johnson",
    },
    {
      label: (
        <div className="d-flex align-items-center gap-2">
          <div
            style={{
              borderRadius: "50%",
              overflow: "hidden",
              width: 24,
              height: 24,
            }}
          >
            <ImageWithBasePath
              src="assets/img/users/user-01.jpg"
              alt="Sharon"
              width={24}
              height={24}
            />
          </div>
          Sharon Roy
        </div>
      ),
      value: "sharon-roy",
    },
  ];

  return (
    <>
      {/* Add Agent */}
      <div
        className="offcanvas offcanvas-end offcanvas-large"
        tabIndex={-1}
        id="offcanvas_add"
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="mb-0">Add New Agent</h5>
          <button
            type="button"
            className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
          <form onSubmit={handleSubmit}>
            <div className="accordion accordion-bordered" id="main_accordion">
              {/* Basic Info */}
              <div className="accordion-item rounded mb-3">
                <div className="accordion-header">
                  <Link
                    href="#"
                    className="accordion-button accordion-custom-button rounded"
                    data-bs-toggle="collapse"
                    data-bs-target="#basic"
                  >
                    <span className="avatar avatar-md rounded me-1">
                      <i className="ti ti-user-plus" />
                    </span>
                    Basic Info
                  </Link>
                </div>
                <div
                  className="accordion-collapse collapse show"
                  id="basic"
                  data-bs-parent="#main_accordion"
                >
                  <div className="accordion-body border-top">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="d-flex align-items-center mb-3">
                          <div className="avatar avatar-xxl border border-dashed me-3 flex-shrink-0">
                            <div className="position-relative d-flex align-items-center">
                              <i className="ti ti-photo text-dark fs-16" />
                            </div>
                          </div>
                          <div className="d-inline-flex flex-column align-items-start">
                            <div className="drag-upload-btn btn btn-sm btn-primary position-relative mb-2">
                              <i className="ti ti-file-broken me-1" />
                              Upload file
                              <input
                                type="file"
                                className="form-control image-sign"
                                multiple
                              />
                            </div>
                            <span>JPG, GIF or PNG. Max size of 800K</span>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            First Name <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            required
                            value={formData.first_name}
                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Last Name <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            required
                            value={formData.last_name}
                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Job Title <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.job_title}
                            onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Company Name
                            <span className="text-danger ms-1">*</span>
                          </label>
                          <CommonSelect
                            options={Company_Name}
                            className="select"
                            defaultValue={Company_Name[0]}
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <label className="form-label">
                              Email <span className="text-danger">*</span>
                            </label>
                            <div className="form-check form-switch mb-1">
                              <label className="form-check-label d-flex align-items-center gap-2">
                                <span>Email Opt Out</span>
                                <input
                                  className="form-check-input form-check-input-sm switchCheckDefault ms-auto"
                                  type="checkbox"
                                  role="switch"
                                  checked={formData.email_opt_out}
                                  onChange={(e) => setFormData({ ...formData, email_opt_out: e.target.checked })}
                                />
                              </label>
                            </div>
                          </div>
                          <input
                            type="email"
                            className="form-control"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Phone 1</label>
                          <CommonPhoneInput
                            value={phone}
                            onChange={(value) => {
                              setPhone(value);
                              setFormData({ ...formData, phone1: value || '' });
                            }}
                            placeholder="(201) 555-0123"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Phone 2</label>
                          <CommonPhoneInput
                            value={phone2}
                            onChange={(value) => {
                              setPhone2(value);
                              setFormData({ ...formData, phone2: value || '' });
                            }}
                            placeholder="(201) 555-0123"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Tags </label>
                          <CommonTagInputs
                            initialTags={tags}
                            onTagsChange={handleTagsChange}
                          />
                          <span className="fs-13">
                            Enter value separated by comma
                          </span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Source <span className="text-danger">*</span>
                          </label>
                          <CommonSelect
                            options={Source}
                            className="select"
                            defaultValue={Source[0]}
                            onChange={(value) => setFormData({ ...formData, source: value?.value || '' })}
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-0">
                          <label className="form-label">
                            Description <span className="text-danger">*</span>
                          </label>
                          <textarea
                            className="form-control"
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Agent Information */}
              <div className="accordion-item rounded mb-3">
                <div className="accordion-header">
                  <Link
                    href="#"
                    className="accordion-button accordion-custom-button rounded collapsed"
                    data-bs-toggle="collapse"
                    data-bs-target="#agent_info"
                  >
                    <span className="avatar avatar-md rounded me-1">
                      <i className="ti ti-id" />
                    </span>
                    Agent Information
                  </Link>
                </div>
                <div
                  className="accordion-collapse collapse"
                  id="agent_info"
                  data-bs-parent="#main_accordion"
                >
                  <div className="accordion-body border-top">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            License Number (RECO)
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.license_number}
                            onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                            placeholder="Enter RECO license number"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            License Expiry Date
                          </label>
                          <CommonDatePicker
                            value={formData.license_expiry_date ? dayjs(formData.license_expiry_date) : undefined}
                            onChange={(date: Dayjs | null) => setFormData({ ...formData, license_expiry_date: date ? date.format('YYYY-MM-DD') : '' })}
                            placeholder="Select expiry date"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Brokerage Start Date
                          </label>
                          <CommonDatePicker
                            value={formData.brokerage_start_date ? dayjs(formData.brokerage_start_date) : undefined}
                            onChange={(date: Dayjs | null) => setFormData({ ...formData, brokerage_start_date: date ? date.format('YYYY-MM-DD') : '' })}
                            placeholder="Select start date"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Status <span className="text-danger">*</span>
                          </label>
                          <CommonSelect
                            options={AgentStatus}
                            className="select"
                            defaultValue={AgentStatus[0]}
                            onChange={(value) => setFormData({ ...formData, status: value?.value || 'Active' })}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Team / Office Assignment
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.team_office}
                            onChange={(e) => setFormData({ ...formData, team_office: e.target.value })}
                            placeholder="Enter team or office name"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Commission Split */}
              <div className="accordion-item rounded mb-3">
                <div className="accordion-header">
                  <Link
                    href="#"
                    className="accordion-button accordion-custom-button rounded collapsed"
                    data-bs-toggle="collapse"
                    data-bs-target="#commission"
                  >
                    <span className="avatar avatar-md rounded me-1">
                      <i className="ti ti-percentage" />
                    </span>
                    Commission Split Configuration
                  </Link>
                </div>
                <div
                  className="accordion-collapse collapse"
                  id="commission"
                  data-bs-parent="#main_accordion"
                >
                  <div className="accordion-body border-top">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Commission Percentage (%)
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            min="0"
                            max="100"
                            value={formData.commission_split?.percentage || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              commission_split: {
                                ...formData.commission_split,
                                percentage: e.target.value ? parseFloat(e.target.value) : undefined
                              }
                            })}
                            placeholder="e.g., 50"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Split Structure
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.commission_split?.structure || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              commission_split: {
                                ...formData.commission_split,
                                structure: e.target.value
                              }
                            })}
                            placeholder="e.g., 50/50, 60/40"
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-0">
                          <label className="form-label">
                            Commission Notes
                          </label>
                          <textarea
                            className="form-control"
                            rows={2}
                            value={formData.commission_split?.notes || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              commission_split: {
                                ...formData.commission_split,
                                notes: e.target.value
                              }
                            })}
                            placeholder="Additional notes about commission structure"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Banking Information */}
              <div className="accordion-item rounded mb-3">
                <div className="accordion-header">
                  <Link
                    href="#"
                    className="accordion-button accordion-custom-button rounded collapsed"
                    data-bs-toggle="collapse"
                    data-bs-target="#banking"
                  >
                    <span className="avatar avatar-md rounded me-1">
                      <i className="ti ti-lock" />
                    </span>
                    Banking Information (Secured)
                  </Link>
                </div>
                <div
                  className="accordion-collapse collapse"
                  id="banking"
                  data-bs-parent="#main_accordion"
                >
                  <div className="accordion-body border-top">
                    <div className="alert alert-info">
                      <i className="ti ti-info-circle me-2" />
                      Banking information is stored securely and encrypted.
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Account Holder Name
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.banking_info?.accountHolderName || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              banking_info: {
                                ...formData.banking_info,
                                accountHolderName: e.target.value
                              }
                            })}
                            placeholder="Full name on account"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Bank Name
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.banking_info?.bankName || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              banking_info: {
                                ...formData.banking_info,
                                bankName: e.target.value
                              }
                            })}
                            placeholder="Bank name"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Account Number
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.banking_info?.accountNumber || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              banking_info: {
                                ...formData.banking_info,
                                accountNumber: e.target.value
                              }
                            })}
                            placeholder="Account number"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Routing Number
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.banking_info?.routingNumber || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              banking_info: {
                                ...formData.banking_info,
                                routingNumber: e.target.value
                              }
                            })}
                            placeholder="Routing/Transit number"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Account Type
                          </label>
                          <CommonSelect
                            options={[
                              { value: 'Checking', label: 'Checking' },
                              { value: 'Savings', label: 'Savings' },
                            ]}
                            className="select"
                            onChange={(value) => setFormData({
                              ...formData,
                              banking_info: {
                                ...formData.banking_info,
                                accountType: value?.value || ''
                              }
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="accordion-item rounded mb-3">
                <div className="accordion-header">
                  <Link
                    href="#"
                    className="accordion-button accordion-custom-button rounded collapsed"
                    data-bs-toggle="collapse"
                    data-bs-target="#emergency"
                  >
                    <span className="avatar avatar-md rounded me-1">
                      <i className="ti ti-phone-call" />
                    </span>
                    Emergency Contact
                  </Link>
                </div>
                <div
                  className="accordion-collapse collapse"
                  id="emergency"
                  data-bs-parent="#main_accordion"
                >
                  <div className="accordion-body border-top">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Contact Name <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            required
                            value={formData.emergency_contact?.name || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              emergency_contact: {
                                ...formData.emergency_contact,
                                name: e.target.value
                              }
                            })}
                            placeholder="Full name"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Phone <span className="text-danger">*</span>
                          </label>
                          <CommonPhoneInput
                            value={formData.emergency_contact?.phone}
                            onChange={(value) => setFormData({
                              ...formData,
                              emergency_contact: {
                                ...formData.emergency_contact,
                                phone: value || ''
                              }
                            })}
                            placeholder="(201) 555-0123"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Relationship <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            required
                            value={formData.emergency_contact?.relationship || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              emergency_contact: {
                                ...formData.emergency_contact,
                                relationship: e.target.value
                              }
                            })}
                            placeholder="e.g., Spouse, Parent, Sibling"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Email
                          </label>
                          <input
                            type="email"
                            className="form-control"
                            value={formData.emergency_contact?.email || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              emergency_contact: {
                                ...formData.emergency_contact,
                                email: e.target.value
                              }
                            })}
                            placeholder="email@example.com"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Internal Notes */}
              <div className="accordion-item rounded mb-3">
                <div className="accordion-header">
                  <Link
                    href="#"
                    className="accordion-button accordion-custom-button rounded collapsed"
                    data-bs-toggle="collapse"
                    data-bs-target="#notes"
                  >
                    <span className="avatar avatar-md rounded me-1">
                      <i className="ti ti-notes" />
                    </span>
                    Internal Notes / Comments
                  </Link>
                </div>
                <div
                  className="accordion-collapse collapse"
                  id="notes"
                  data-bs-parent="#main_accordion"
                >
                  <div className="accordion-body border-top">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="mb-0">
                          <label className="form-label">
                            Notes
                          </label>
                          <textarea
                            className="form-control"
                            rows={5}
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Internal comments and notes about this agent..."
                          />
                          <span className="fs-13 text-muted">
                            These notes are only visible to internal staff.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="d-flex align-items-center justify-content-end gap-2 mt-3">
              <button
                type="button"
                className="btn btn-outline-light"
                data-bs-dismiss="offcanvas"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Agent'}
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* /Add Agent */}

      {/* Delete Agent Modal */}
      <div
        className="modal fade"
        id="delete_agent"
        tabIndex={-1}
        aria-labelledby="delete_agent"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body">
              <div className="form-header">
                <h3>Delete Agent</h3>
                <p>Are you sure want to delete?</p>
              </div>
              <div className="modal-btn delete-action">
                <div className="row">
                  <div className="col-6">
                    <Link
                      href="#"
                      data-bs-dismiss="modal"
                      className="btn btn-primary w-100"
                    >
                      Cancel
                    </Link>
                  </div>
                  <div className="col-6">
                    <Link
                      href="#"
                      data-bs-dismiss="modal"
                      className="btn btn-primary w-100 continue-btn"
                    >
                      Delete
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Delete Agent Modal */}
    </>
  );
};

export default ModalAgents;
