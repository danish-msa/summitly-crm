"use client";
/* eslint-disable @next/next/no-img-element */
import ImageWithBasePath from "@/core/common/imageWithBasePath";
import ModalAgentsDetails from "./modals/modalAgentsDetails";
import { all_routes } from "@/router/all_routes";
import Link from "next/link";
import Footer from "@/core/common/footer/footer";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getAgentById, deleteAgent } from "@/core/services/agents.service";
import { Agent } from "@/core/data/interface/agent.interface";
import AgentTasksChecklist from "./AgentTasksChecklist";

const AgentsDetailsComponent = () => {
  const searchParams = useSearchParams();
  const agentId = searchParams.get('id');
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (agentId) {
      fetchAgent();
    }
  }, [agentId]);

  const fetchAgent = async () => {
    if (!agentId) return;
    
    setLoading(true);
    try {
      const response = await getAgentById(agentId);
      if (response.success && response.data) {
        setAgent(response.data);
      } else {
        console.error('Failed to fetch agent:', response.error);
      }
    } catch (error) {
      console.error('Error fetching agent:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!agentId) return;
    if (confirm('Are you sure you want to delete this agent?')) {
      const response = await deleteAgent(agentId);
      if (response.success) {
        window.location.href = all_routes.agentsList;
      } else {
        alert(response.error || 'Failed to delete agent');
      }
    }
  };

  return (
    <>
      {/* ========================
			Start Page Content
		========================= */}
      <div className="page-wrapper">
        {/* Start Content */}
        <div className="content pb-0">
          {/* Page Header */}
          <div className="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
            <div>
              <h4 className="mb-1">
                Agents
                <span className="badge badge-soft-primary ms-2">5</span>
              </h4>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0 p-0">
                  <li className="breadcrumb-item">
                    <Link href={all_routes.dealsDashboard}>Home</Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Agents
                  </li>
                </ol>
              </nav>
            </div>
            <div className="gap-2 d-flex align-items-center flex-wrap">
              <div className="dropdown">
                <Link
                  href="#"
                  className="dropdown-toggle btn btn-outline-light px-2 shadow"
                  data-bs-toggle="dropdown"
                >
                  <i className="ti ti-package-export me-2" />
                  Export
                </Link>
                <div className="dropdown-menu  dropdown-menu-end">
                  <ul>
                    <li>
                      <Link href="#" className="dropdown-item">
                        <i className="ti ti-file-type-pdf me-1" />
                        Export as PDF
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="dropdown-item">
                        <i className="ti ti-file-type-xls me-1" />
                        Export as Excel{" "}
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <Link
                href="#"
                className="btn btn-icon btn-outline-light shadow"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                aria-label="Refresh"
                data-bs-original-title="Refresh"
              >
                <i className="ti ti-refresh" />
              </Link>
            </div>
          </div>
          {/* End Page Header */}
          <div className="row">
            <div className="col-md-12">
              <div className="mb-3">
                <Link href={all_routes.agentsList}>
                  <i className="ti ti-arrow-narrow-left me-1" />
                  Back to Agents
                </Link>
              </div>
              <div className="card">
                <div className="card-body pb-2">
                  <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <div className="d-flex align-items-center mb-2">
                      <div className="avatar avatar-xxl avatar-rounded me-3 flex-shrink-0">
                        <ImageWithBasePath
                          src="assets/img/profiles/avatar-14.jpg"
                          alt="img"
                        />
                        <span className="status online" />
                      </div>
                      <div>
                        <h5 className="mb-1">
                          {loading ? 'Loading...' : agent ? `${agent.firstName} ${agent.lastName}` : 'Agent Not Found'}
                        </h5>
                        <p className="mb-2">
                          {agent ? `${agent.jobTitle || 'Agent'}${agent.companyName ? `, ${agent.companyName}` : ''}` : ''}
                        </p>
                        <div className="d-flex align-items-center">
                          <span className={`badge badge-soft-${agent?.status === 'Active' ? 'success' : agent?.status === 'Suspended' ? 'warning' : 'danger'} border-0 me-2`}>
                            {agent?.status || 'Unknown'}
                          </span>
                          {agent?.rating && (
                            <p className="d-inline-flex align-items-center mb-0">
                              <i className="ti ti-star-filled text-warning me-1" />{" "}
                              {agent.rating}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="d-flex align-items-center flex-wrap gap-2">
                      <Link
                        href="#"
                        className="avatar avatar-sm border shadow text-dark"
                      >
                        <i className="ti ti-star-filled fs-16 text-warning" />
                      </Link>
                      <Link
                        href="#"
                        className="btn btn-dark"
                        data-bs-toggle="offcanvas"
                        data-bs-target="#offcanvas_add_2"
                      >
                        <i className="ti ti-plus me-1" />
                        Add Deal
                      </Link>
                      <Link
                        href="#"
                        className="btn btn-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#add_compose"
                      >
                        <i className="ti ti-mail me-1" />
                        Send Email
                      </Link>
                      <Link
                        href={all_routes.chat}
                        className="action-icon btn btn-icon btn-sm btn-outline-light shadow"
                      >
                        <i className="ti ti-brand-hipchat" />
                      </Link>
                      <Link
                        href="#"
                        className="btn btn-icon btn-sm btn-outline-light shadow"
                        data-bs-toggle="offcanvas"
                        data-bs-target="#offcanvas_edit"
                      >
                        <i className="ti ti-edit-circle" />
                      </Link>
                      <div className="act-dropdown">
                        <Link
                          href="#"
                          data-bs-toggle="dropdown"
                          className="action-icon btn btn-icon btn-sm btn-outline-light shadow"
                          aria-expanded="false"
                        >
                          <i className="ti ti-dots-vertical" />
                        </Link>
                        <div className="dropdown-menu dropdown-menu-right">
                          <Link
                            className="dropdown-item"
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handleDelete();
                            }}
                          >
                            <i className="ti ti-trash me-1" />
                            Delete
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* /Agent User */}
            </div>
            {/* Agent Sidebar */}
            <div className="col-xl-3">
              <div className="card">
                <div className="card-body p-3">
                  <h6 className="mb-3 fw-semibold">Basic Information</h6>
                  <div className="border-bottom mb-3 pb-3">
                    {agent && (
                      <>
                        {agent.email && (
                          <div className="d-flex align-items-center mb-2">
                            <span className="avatar avatar-xs bg-light p-0 flex-shrink-0 rounded-circle text-dark me-2">
                              <i className="ti ti-mail fs-14" />
                            </span>
                            <p className="mb-0">{agent.email}</p>
                            {agent.emailOptOut && (
                              <span className="badge badge-soft-warning ms-2">Opt Out</span>
                            )}
                          </div>
                        )}
                        {agent.phone1 && (
                          <div className="d-flex align-items-center mb-2">
                            <span className="avatar avatar-xs bg-light p-0 flex-shrink-0 rounded-circle text-dark me-2">
                              <i className="ti ti-phone fs-14" />
                            </span>
                            <p className="mb-0">{agent.phone1}</p>
                          </div>
                        )}
                        {agent.phone2 && (
                          <div className="d-flex align-items-center mb-2">
                            <span className="avatar avatar-xs bg-light p-0 flex-shrink-0 rounded-circle text-dark me-2">
                              <i className="ti ti-phone-call fs-14" />
                            </span>
                            <p className="mb-0">{agent.phone2}</p>
                          </div>
                        )}
                        {(agent.address || agent.city || agent.state || agent.country) && (
                          <div className="d-flex align-items-center mb-3">
                            <span className="avatar avatar-xs bg-light p-0 flex-shrink-0 rounded-circle text-dark me-2">
                              <i className="ti ti-map-pin fs-14" />
                            </span>
                            <p className="mb-0">
                              {agent.address ? agent.address : ''}
                              {agent.address && (agent.city || agent.state || agent.country) ? ', ' : ''}
                              {[agent.city, agent.state, agent.country].filter(Boolean).join(', ') || 'N/A'}
                            </p>
                          </div>
                        )}
                        {agent.createdAt && (
                          <div className="d-flex align-items-center">
                            <span className="avatar avatar-xs bg-light p-0 flex-shrink-0 rounded-circle text-dark me-2">
                              <i className="ti ti-calendar-exclamation fs-14" />
                            </span>
                            <p className="mb-0">
                              Created on {new Date(agent.createdAt).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <h6 className="mb-3 fw-semibold">Other Information</h6>
                  <ul className="border-bottom mb-3 pb-3">
                    {agent?.language && (
                      <li className="row mb-2">
                        <span className="col-6">Language</span>
                        <span className="col-6 text-dark">{agent.language}</span>
                      </li>
                    )}
                    {agent?.currency && (
                      <li className="row mb-2">
                        <span className="col-6">Currency</span>
                        <span className="col-6 text-dark">{agent.currency}</span>
                      </li>
                    )}
                    {agent?.updatedAt && (
                      <li className="row mb-2">
                        <span className="col-6">Last Modified</span>
                        <span className="col-6 text-dark">
                          {new Date(agent.updatedAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </li>
                    )}
                    {agent?.source && (
                      <li className="row">
                        <span className="col-6">Source</span>
                        <span className="col-6 text-dark">{agent.source}</span>
                      </li>
                    )}
                  </ul>
                  {agent && agent.tags && agent.tags.length > 0 && (
                    <>
                      <h6 className="mb-3 fw-semibold">Tags</h6>
                      <div className="border-bottom mb-3 pb-3">
                        {agent.tags.map((tag, idx) => (
                          <Link
                            key={idx}
                            href="#"
                            className="badge badge-soft-success fw-medium me-2"
                          >
                            {tag}
                          </Link>
                        ))}
                      </div>
                    </>
                  )}
                  <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <h6 className="mb-3 fw-semibold">Company</h6>
                    <Link
                      href="#"
                      className="link-primary mb-3"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#offcanvas_add"
                    >
                      <i className="ti ti-circle-plus me-1" />
                      Add New
                    </Link>
                  </div>
                  {agent?.companyName && (
                    <div className="mb-3">
                      <div className="d-flex align-items-center">
                        <span className="avatar avatar-lg rounded me-2 border">
                          <i className="ti ti-building fs-20 text-dark" />
                        </span>
                        <div>
                          <h6 className="fw-medium mb-1">
                            {agent.companyName}{" "}
                            <i className="ti ti-circle-check-filled text-success fs-16" />
                          </h6>
                          {agent.industry && (
                            <p className="mb-0">{agent.industry}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  <hr />
                  <h6 className="mb-3 fw-semibold">Social Profile</h6>
                  <ul className="d-flex align-items-center">
                    <li>
                      <Link
                        href="#"
                        className="avatar avatar-sm rounded-circle fs-14 text-dark"
                      >
                        <i className="ti ti-brand-youtube" />
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="avatar avatar-sm rounded-circle fs-14 text-dark"
                      >
                        <i className="ti ti-brand-facebook" />
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="avatar avatar-sm rounded-circle fs-14 text-dark"
                      >
                        <i className="ti ti-brand-instagram" />
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="avatar avatar-sm rounded-circle fs-14 text-dark"
                      >
                        <i className="ti ti-brand-whatsapp" />
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="avatar avatar-sm rounded-circle fs-14 text-dark"
                      >
                        <i className="ti ti-brand-pinterest" />
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="avatar avatar-sm rounded-circle fs-14 text-dark"
                      >
                        <i className="ti ti-brand-linkedin" />
                      </Link>
                    </li>
                  </ul>
                  <hr />
                  <h6 className="mb-3 fw-semibold">Settings</h6>
                  <div className="mb-0">
                    <Link href="#" className="d-block mb-2">
                      <span className="avatar avatar-xs bg-light p-0 flex-shrink-0 rounded-circle text-dark me-2">
                        <i className="ti ti-share-2" />
                      </span>
                      Share Agent
                    </Link>
                    <Link href="#" className="d-block mb-2">
                      <span className="avatar avatar-xs bg-light p-0 flex-shrink-0 rounded-circle text-dark me-2">
                        <i className="ti ti-star" />
                      </span>
                      Add to Favourite
                    </Link>
                    <Link
                      href="#"
                      className="d-block mb-0"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete();
                      }}
                    >
                      <span className="avatar avatar-xs bg-light p-0 flex-shrink-0 rounded-circle text-dark me-2">
                        <i className="ti ti-trash-x" />
                      </span>
                      Delete Agent
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            {/* /Agent Sidebar */}
            {/* Agent Details */}
            <div className="col-xl-9">
              <div className="card mb-3">
                <div className="card-body pb-0 pt-2">
                  <ul className="nav nav-tabs nav-bordered mb-3" role="tablist">
                    <li className="nav-item" role="presentation">
                      <Link
                        href="#tab_tasks"
                        data-bs-toggle="tab"
                        aria-expanded="false"
                        className="nav-link active border-3"
                        aria-selected="true"
                        role="tab"
                      >
                        <span className="d-md-inline-block">
                          <i className="ti ti-checklist me-1" />
                          Tasks Checklist
                        </span>
                      </Link>
                    </li>
                    <li className="nav-item" role="presentation">
                      <Link
                        href="#tab_1"
                        data-bs-toggle="tab"
                        aria-expanded="false"
                        className="nav-link border-3"
                        aria-selected="false"
                        role="tab"
                      >
                        <span className="d-md-inline-block">
                          <i className="ti ti-alarm-minus me-1" />
                          Activities
                        </span>
                      </Link>
                    </li>
                    <li className="nav-item" role="presentation">
                      <Link
                        href="#tab_2"
                        data-bs-toggle="tab"
                        aria-expanded="true"
                        className="nav-link border-3"
                        aria-selected="false"
                        role="tab"
                        tabIndex={-1}
                      >
                        <span className="d-md-inline-block">
                          <i className="ti ti-notes me-1" />
                          Notes
                        </span>
                      </Link>
                    </li>
                    <li className="nav-item" role="presentation">
                      <Link
                        href="#tab_3"
                        data-bs-toggle="tab"
                        aria-expanded="false"
                        className="nav-link border-3"
                        aria-selected="false"
                        tabIndex={-1}
                        role="tab"
                      >
                        <span className="d-md-inline-block">
                          <i className="ti ti-phone me-1" />
                          Calls
                        </span>
                      </Link>
                    </li>
                    <li className="nav-item" role="presentation">
                      <Link
                        href="#tab_4"
                        data-bs-toggle="tab"
                        aria-expanded="false"
                        className="nav-link border-3"
                        aria-selected="false"
                        tabIndex={-1}
                        role="tab"
                      >
                        <span className="d-md-inline-block">
                          <i className="ti ti-file me-1" />
                          Files
                        </span>
                      </Link>
                    </li>
                    <li className="nav-item" role="presentation">
                      <Link
                        href="#tab_5"
                        data-bs-toggle="tab"
                        aria-expanded="false"
                        className="nav-link border-3"
                        aria-selected="false"
                        tabIndex={-1}
                        role="tab"
                      >
                        <span className="d-md-inline-block">
                          <i className="ti ti-mail-check me-1" />
                          Email
                        </span>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              {/* Tab Content */}
              <div className="tab-content pt-0">
                {/* Tasks Checklist */}
                <div className="tab-pane active show" id="tab_tasks">
                  <div className="card">
                    <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                      <h5 className="fw-semibold mb-0">Tasks Checklist</h5>
                    </div>
                    <div className="card-body">
                      {agentId && <AgentTasksChecklist agentId={agentId} />}
                    </div>
                  </div>
                </div>
                {/* /Tasks Checklist */}
                {/* Activities */}
                <div className="tab-pane fade" id="tab_1">
                  <div className="card">
                    <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                      <h5 className="fw-semibold mb-0">Activities</h5>
                      <div className="dropdown">
                        <Link
                          href="#"
                          className="dropdown-toggle btn btn-outline-light px-2 shadow"
                          data-bs-toggle="dropdown"
                        >
                          <i className="ti ti-sort-ascending-2 me-2" />
                          Sort By
                        </Link>
                        <div className="dropdown-menu">
                          <ul>
                            <li>
                              <Link href="#" className="dropdown-item">
                                Newest
                              </Link>
                            </li>
                            <li>
                              <Link href="#" className="dropdown-item">
                                Oldest
                              </Link>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="badge badge-soft-info border-0 mb-3">
                        <i className="ti ti-calendar-check me-1" />
                        Today
                      </div>
                      <div className="card border shadow-none mb-3">
                        <div className="card-body p-3">
                          <div className="d-flex flex-wrap row-gap-2">
                            <span className="avatar avatar-md flex-shrink-0 rounded me-2 bg-info">
                              <i className="ti ti-user-plus fs-20" />
                            </span>
                            <div>
                              <h6 className="fw-medium fs-14 mb-1">
                                Agent created
                              </h6>
                              <p className="mb-0">
                                {agent?.createdAt ? new Date(agent.createdAt).toLocaleString() : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      {agent?.updatedAt && agent.updatedAt !== agent.createdAt && (
                        <div className="card border shadow-none mb-3">
                          <div className="card-body p-3">
                            <div className="d-flex flex-wrap row-gap-2">
                              <span className="avatar avatar-md flex-shrink-0 rounded me-2 bg-success">
                                <i className="ti ti-edit fs-20" />
                              </span>
                              <div>
                                <h6 className="fw-medium fs-14 mb-1">
                                  Agent information updated
                                </h6>
                                <p className="mb-0">
                                  {new Date(agent.updatedAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {!agent && (
                        <div className="text-center py-4">
                          <p className="text-muted">No activities found</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* /Activities */}
                {/* Notes */}
                <div className="tab-pane fade" id="tab_2">
                  <div className="card">
                    <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                      <h5 className="fw-semibold mb-0">Notes</h5>
                      <div className="d-inline-flex align-items-center">
                        <div className="dropdown me-2">
                          <Link
                            href="#"
                            className="dropdown-toggle btn btn-outline-light px-2 shadow"
                            data-bs-toggle="dropdown"
                          >
                            <i className="ti ti-sort-ascending-2 me-2" />
                            Sort By
                          </Link>
                          <div className="dropdown-menu">
                            <ul>
                              <li>
                                <Link href="#" className="dropdown-item">
                                  Newest
                                </Link>
                              </li>
                              <li>
                                <Link href="#" className="dropdown-item">
                                  Oldest
                                </Link>
                              </li>
                            </ul>
                          </div>
                        </div>
                        <Link
                          href="#"
                          data-bs-toggle="modal"
                          data-bs-target="#add_notes"
                          className="link-primary fw-medium"
                        >
                          <i className="ti ti-circle-plus me-1" />
                          Add New
                        </Link>
                      </div>
                    </div>
                    <div className="card-body">
                      {agent?.notes ? (
                        <div className="card mb-3">
                          <div className="card-body">
                            <p className="mb-0">{agent.notes}</p>
                            <span className="text-muted fs-12">
                              Internal notes - Only visible to staff
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-muted">No notes found</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* /Notes */}
                {/* Calls */}
                <div className="tab-pane fade" id="tab_3">
                  <div className="card">
                    <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                      <h5 className="fw-semibold mb-0">Calls</h5>
                      <div className="d-inline-flex align-items-center">
                        <Link
                          href="#"
                          data-bs-toggle="modal"
                          data-bs-target="#create_call"
                          className="link-primary fw-medium"
                        >
                          <i className="ti ti-circle-plus me-1" />
                          Add New
                        </Link>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="text-center py-4">
                        <p className="text-muted">No calls logged</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* /Calls */}
                {/* Files */}
                <div className="tab-pane fade" id="tab_4">
                  <div className="card">
                    <div className="card-header">
                      <h5 className="fw-semibold mb-0">Files</h5>
                    </div>
                    <div className="card-body">
                      <div className="card border mb-3">
                        <div className="card-body pb-0">
                          <div className="row align-items-center">
                            <div className="col-md-8">
                              <div className="mb-3">
                                <h6 className="mb-1">Manage Documents</h6>
                                <p>
                                  Send customizable quotes, proposals and
                                  contracts to close deals faster.
                                </p>
                              </div>
                            </div>
                            <div className="col-md-4 text-md-end">
                              <div className="mb-3">
                                <Link
                                  href="#"
                                  className="btn btn-primary"
                                  data-bs-toggle="modal"
                                  data-bs-target="#new_file"
                                >
                                  Create Document
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-center py-4">
                        <p className="text-muted">No files uploaded</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* /Files */}
                {/* Email */}
                <div className="tab-pane fade" id="tab_5">
                  <div className="card">
                    <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                      <h5 className="mb-1">Email</h5>
                      <div className="d-inline-flex align-items-center">
                        <Link
                          href="#"
                          className="link-primary fw-medium"
                          data-bs-toggle="tooltip"
                          data-bs-placement="left"
                          data-bs-custom-class="tooltip-dark"
                          data-bs-original-title="There are no email accounts configured, Please configured your email account in order to Send/ Create EMails"
                        >
                          <i className="ti ti-circle-plus me-1" />
                          Create Email
                        </Link>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="card border mb-0">
                        <div className="card-body pb-0">
                          <div className="row align-items-center">
                            <div className="col-md-8">
                              <div className="mb-3">
                                <h6 className="mb-1">Manage Emails</h6>
                                <p>
                                  You can send and reply to emails directly via
                                  this section.
                                </p>
                              </div>
                            </div>
                            <div className="col-md-4 text-md-end">
                              <div className="mb-3">
                                <Link
                                  href="#"
                                  className="btn btn-primary"
                                  data-bs-toggle="modal"
                                  data-bs-target="#create_email"
                                >
                                  Connect Account
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* /Email */}
              </div>
              {/* /Tab Content */}
            </div>
            {/* /Agent Details */}
          </div>
          {/* Start Footer */}
        </div>
        {/* End Content */}
        <Footer/>
        {/* End Footer */}
      </div>
      {/* ========================
			End Page Content
		========================= */}
      <ModalAgentsDetails agent={agent} onSuccess={fetchAgent} />
    </>
  );
};

export default AgentsDetailsComponent;
