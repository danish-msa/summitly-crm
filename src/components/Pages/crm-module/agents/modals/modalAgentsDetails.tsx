"use client";
/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
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
      const response = await updateAgent(agent.id, {
        firstName: formData.first_name,
        lastName: formData.last_name,
        jobTitle: formData.job_title,
        companyName: formData.company_name,
        email: formData.email,
        emailOptOut: formData.email_opt_out,
        phone1: formData.phone1,
        phone2: formData.phone2,
        fax: formData.fax,
        tags: tags,
        source: formData.source,
        description: formData.description,
        status: formData.status as 'Active' | 'Suspended' | 'Terminated',
      });

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
        alert(response.error || 'Failed to update agent');
      }
    } catch (error: any) {
      console.error('Error updating agent:', error);
      alert('Failed to update agent. Please try again.');
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
              {/* Add more accordion sections for additional fields */}
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
