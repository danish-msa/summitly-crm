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
import { updateAgent } from "@/core/services/agents.service";
import { Agent } from "@/core/data/interface/agent.interface";

interface ModalAgentsDetailsProps {
  agent: Agent | null;
  onSuccess?: () => void;
}

const ModalAgentsDetails = ({ agent, onSuccess }: ModalAgentsDetailsProps) => {
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phone, setPhone] = useState<string | undefined>();
  const [phone2, setPhone2] = useState<string | undefined>();
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
    // Location Information
    address: '',
    city: '',
    state: '',
    country: '',
    zip_code: '',
    // Agent-Specific Fields
    license_number: '',
    license_expiry_date: '',
    brokerage_start_date: '',
    team_office: '',
    commission_split: {} as any,
    banking_info: {} as any,
    emergency_contact: {} as any,
    notes: '',
  });

  useEffect(() => {
    if (agent) {
      setFormData({
        first_name: agent.firstName || '',
        last_name: agent.lastName || '',
        job_title: agent.jobTitle || '',
        company_name: agent.companyName || '',
        email: agent.email || '',
        email_opt_out: agent.emailOptOut || false,
        phone1: agent.phone1 || '',
        phone2: agent.phone2 || '',
        fax: agent.fax || '',
        tags: agent.tags || [],
        source: agent.source || '',
        description: agent.description || '',
        status: agent.status || 'Active',
        // Location Information
        address: agent.address || '',
        city: agent.city || '',
        state: agent.state || '',
        country: agent.country || '',
        zip_code: agent.zipCode || '',
        // Agent-Specific Fields
        license_number: agent.licenseNumber || '',
        license_expiry_date: agent.licenseExpiryDate || '',
        brokerage_start_date: agent.brokerageStartDate || '',
        team_office: agent.teamOffice || '',
        commission_split: agent.commissionSplit || {},
        banking_info: agent.bankingInfo || {},
        emergency_contact: agent.emergencyContact || {},
        notes: agent.notes || '',
      });
      setTags(agent.tags || []);
      setPhone(agent.phone1);
      setPhone2(agent.phone2);
    }
  }, [agent]);

  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags);
    setFormData({ ...formData, tags: newTags });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agent?.id) return;

    setIsSubmitting(true);
    try {
      // Prepare update data - send empty strings as null to clear fields
      const updateData: any = {
        firstName: formData.first_name || null,
        lastName: formData.last_name || null,
        jobTitle: formData.job_title || null,
        companyName: formData.company_name || null,
        email: formData.email || null,
        emailOptOut: formData.email_opt_out,
        phone1: formData.phone1 || null,
        phone2: formData.phone2 || null,
        fax: formData.fax || null,
        tags: tags || [],
        source: formData.source || null,
        description: formData.description || null,
        status: formData.status as 'Active' | 'Suspended' | 'Terminated',
        // Location Information
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        country: formData.country || null,
        zipCode: formData.zip_code || null,
        // Agent-Specific Fields
        licenseNumber: formData.license_number || null,
        licenseExpiryDate: formData.license_expiry_date || null,
        brokerageStartDate: formData.brokerage_start_date || null,
        teamOffice: formData.team_office || null,
        commissionSplit: Object.keys(formData.commission_split || {}).length > 0 ? formData.commission_split : null,
        bankingInfo: Object.keys(formData.banking_info || {}).length > 0 ? formData.banking_info : null,
        emergencyContact: Object.keys(formData.emergency_contact || {}).length > 0 ? formData.emergency_contact : null,
        notes: formData.notes || null,
      };

      console.log('📤 Updating agent:', agent.id, updateData);

      const response = await updateAgent(agent.id, updateData);

      console.log('📥 Update response:', response);

      if (response.success) {
        const offcanvas = document.getElementById('offcanvas_edit');
        if (offcanvas) {
          const bsOffcanvas = (window as any).bootstrap?.Offcanvas.getInstance(offcanvas);
          if (bsOffcanvas) {
            bsOffcanvas.hide();
          }
        }
        if (onSuccess) {
          onSuccess();
        }
      } else {
        console.error('❌ Update failed:', response.error);
        alert(response.error || 'Failed to update agent');
      }
    } catch (error: any) {
      console.error('❌ Error updating agent:', error);
      alert(`Failed to update agent: ${error.message || 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Edit Agent */}
      <div
        className="offcanvas offcanvas-end offcanvas-large"
        tabIndex={-1}
        id="offcanvas_edit"
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="mb-0">Edit Agent</h5>
          <button
            type="button"
            className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
          <form onSubmit={handleSubmit}>
            <div className="accordion accordion-bordered" id="main_accordion_edit">
              {/* Basic Info */}
              <div className="accordion-item rounded mb-3">
                <div className="accordion-header">
                  <Link
                    href="#"
                    className="accordion-button accordion-custom-button rounded"
                    data-bs-toggle="collapse"
                    data-bs-target="#basic_edit"
                  >
                    <span className="avatar avatar-md rounded me-1">
                      <i className="ti ti-user-edit" />
                    </span>
                    Basic Info
                  </Link>
                </div>
                <div
                  className="accordion-collapse collapse show"
                  id="basic_edit"
                  data-bs-parent="#main_accordion_edit"
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
                            defaultValue={Company_Name.find((opt) => opt.value === formData.company_name) || Company_Name[0]}
                            onChange={(value) => setFormData({ ...formData, company_name: value?.value || '' })}
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
                            defaultValue={Source.find((opt) => opt.value === formData.source) || Source[0]}
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

              {/* Location Information */}
              <div className="accordion-item rounded mb-3">
                <div className="accordion-header">
                  <Link
                    href="#"
                    className="accordion-button accordion-custom-button rounded collapsed"
                    data-bs-toggle="collapse"
                    data-bs-target="#location_edit"
                  >
                    <span className="avatar avatar-md rounded me-1">
                      <i className="ti ti-map-pin" />
                    </span>
                    Location Information
                  </Link>
                </div>
                <div
                  className="accordion-collapse collapse"
                  id="location_edit"
                  data-bs-parent="#main_accordion_edit"
                >
                  <div className="accordion-body border-top">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Address</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Street address"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">City</label>
                          <CommonSelect
                            options={City}
                            className="select"
                            defaultValue={City.find((opt) => opt.value === formData.city) || City[0]}
                            onChange={(value) => setFormData({ ...formData, city: value?.value || '' })}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">State</label>
                          <CommonSelect
                            options={State}
                            className="select"
                            defaultValue={State.find((opt) => opt.value === formData.state) || State[0]}
                            onChange={(value) => setFormData({ ...formData, state: value?.value || '' })}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Country</label>
                          <CommonSelect
                            options={Country}
                            className="select"
                            defaultValue={Country.find((opt) => opt.value === formData.country) || Country[0]}
                            onChange={(value) => setFormData({ ...formData, country: value?.value || '' })}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Zip Code</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.zip_code}
                            onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                            placeholder="Postal code"
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
                    data-bs-target="#agent_info_edit"
                  >
                    <span className="avatar avatar-md rounded me-1">
                      <i className="ti ti-id" />
                    </span>
                    Agent Information
                  </Link>
                </div>
                <div
                  className="accordion-collapse collapse"
                  id="agent_info_edit"
                  data-bs-parent="#main_accordion_edit"
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
                            defaultValue={AgentStatus.find((opt) => opt.value === formData.status) || AgentStatus[0]}
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
                    data-bs-target="#commission_edit"
                  >
                    <span className="avatar avatar-md rounded me-1">
                      <i className="ti ti-percentage" />
                    </span>
                    Commission Split Configuration
                  </Link>
                </div>
                <div
                  className="accordion-collapse collapse"
                  id="commission_edit"
                  data-bs-parent="#main_accordion_edit"
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
                    data-bs-target="#banking_edit"
                  >
                    <span className="avatar avatar-md rounded me-1">
                      <i className="ti ti-lock" />
                    </span>
                    Banking Information (Secured)
                  </Link>
                </div>
                <div
                  className="accordion-collapse collapse"
                  id="banking_edit"
                  data-bs-parent="#main_accordion_edit"
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
                            defaultValue={formData.banking_info?.accountType ? 
                              { value: formData.banking_info.accountType, label: formData.banking_info.accountType } : 
                              undefined}
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
                    data-bs-target="#emergency_edit"
                  >
                    <span className="avatar avatar-md rounded me-1">
                      <i className="ti ti-phone-call" />
                    </span>
                    Emergency Contact
                  </Link>
                </div>
                <div
                  className="accordion-collapse collapse"
                  id="emergency_edit"
                  data-bs-parent="#main_accordion_edit"
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
                    data-bs-target="#notes_edit"
                  >
                    <span className="avatar avatar-md rounded me-1">
                      <i className="ti ti-notes" />
                    </span>
                    Internal Notes / Comments
                  </Link>
                </div>
                <div
                  className="accordion-collapse collapse"
                  id="notes_edit"
                  data-bs-parent="#main_accordion_edit"
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
                disabled={isSubmitting || !agent?.id}
              >
                {isSubmitting ? 'Updating...' : 'Update Agent'}
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* /Edit Agent */}
    </>
  );
};

export default ModalAgentsDetails;
