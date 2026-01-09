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
                          <span className={`badge badge-soft-${agent?.status === 'Active' ? 'success' : 'danger'} border-0 me-2`}>
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
                            <i className="ti ti-mail me-2" />
                            <span className="text-body">{agent.email}</span>
                          </div>
                        )}
                        {agent.phone1 && (
                          <div className="d-flex align-items-center mb-2">
                            <i className="ti ti-phone me-2" />
                            <span className="text-body">{agent.phone1}</span>
                          </div>
                        )}
                        {(agent.city || agent.country) && (
                          <div className="d-flex align-items-center mb-2">
                            <i className="ti ti-map-pin me-2" />
                            <span className="text-body">
                              {[agent.city, agent.country].filter(Boolean).join(', ') || 'N/A'}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  {/* Add more details here */}
                </div>
              </div>
            </div>
            {/* /Agent Sidebar */}
          </div>
        </div>
        {/* End Content */}
        {/* Start Footer */}
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
