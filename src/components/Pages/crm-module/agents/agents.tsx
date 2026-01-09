"use client";
/* eslint-disable @next/next/no-img-element */
import PageHeader from "@/core/common/page-header/pageHeader";
import ModalAgents from "./modals/modalAgents";
import Link from "next/link";
import ImageWithBasePath from "@/core/common/imageWithBasePath";
import { all_routes } from "@/router/all_routes";
import Footer from "@/core/common/footer/footer";
import { useState, useEffect } from "react";
import { getAgents, transformAgentToListData } from "@/core/services/agents.service";
import { AgentListData } from "@/core/data/interface/agent.interface";

const AgentsComponent = () => {
  const [data, setData] = useState<AgentListData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchAgents();
  }, [refreshKey]);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const response = await getAgents({ limit: 100, offset: 0 });
      if (response.success && response.data) {
        const transformedData = response.data.map(transformAgentToListData);
        setData(transformedData);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <>
      {/* ========================
			Start Page Content
		========================= */}
      <div className="page-wrapper">
        {/* Start Content */}
        <div className="content">
          {/* Page Header */}
          <PageHeader
            title="Agents"
            badgeCount={data.length}
            showModuleTile={false}
            showExport={false}
          />

          {/* End Page Header */}
          {/* table header */}
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <div className="dropdown">
                <Link
                  href="#"
                  className="btn btn-outline-light shadow px-2"
                  data-bs-toggle="dropdown"
                  data-bs-auto-close="outside"
                >
                  <i className="ti ti-filter me-2" />
                  Filter
                  <i className="ti ti-chevron-down ms-2" />
                </Link>
                {/* Filter dropdown content - simplified for now */}
              </div>
            </div>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <Link
                href="#"
                className="btn btn-primary"
                data-bs-toggle="offcanvas"
                data-bs-target="#offcanvas_add"
              >
                <i className="ti ti-square-rounded-plus-filled me-1" />
                Add Agent
              </Link>
              <div className="d-flex align-items-center shadow p-1 rounded border view-icons bg-white">
                <Link
                  href={all_routes.agentsList}
                  className="btn btn-sm p-1 border-0 fs-14"
                >
                  <i className="ti ti-list-tree" />
                </Link>
                <Link
                  href={all_routes.agentsGrid}
                  className="flex-shrink-0 btn btn-sm p-1 border-0 ms-1 fs-14 active"
                >
                  <i className="ti ti-grid-dots" />
                </Link>
              </div>
            </div>
          </div>
          {/* Agents Grid */}
          {loading ? (
            <div className="text-center p-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="row">
              {data.map((agent) => (
              <div key={agent.key} className="col-xl-3 col-lg-4 col-md-6">
                <div className="card">
                  <div className="card-body text-center">
                    <div className="avatar avatar-xxl avatar-rounded mb-3">
                      <ImageWithBasePath
                        src={`assets/img/profiles/${agent.Image}`}
                        alt={agent.Name}
                      />
                      <span className="status online" />
                    </div>
                    <h5 className="mb-1">
                      <Link href={`${all_routes.agentsDetails}?id=${agent.key}`}>{agent.Name}</Link>
                    </h5>
                    <p className="text-body mb-2">{agent.Role}</p>
                    <div className="d-flex align-items-center justify-content-center mb-2">
                      <span
                        className={`badge badge-tag ${
                          agent.Tags === "Collab"
                            ? "badge-soft-success"
                            : agent.Tags === "VIP"
                            ? "badge-soft-warning"
                            : "badge-soft-danger"
                        } me-2`}
                      >
                        {agent.Tags}
                      </span>
                      <span
                        className={`badge badge-pill badge-status ${
                          agent.Status === "Active"
                            ? "bg-success"
                            : "bg-danger"
                        }`}
                      >
                        {agent.Status}
                      </span>
                    </div>
                    <div className="d-flex align-items-center justify-content-center mb-3">
                      <i className="ti ti-star-filled text-warning me-1" />
                      <span>{agent.Rating}</span>
                    </div>
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      <Link
                        href={all_routes.agentsDetails}
                        className="btn btn-sm btn-primary"
                      >
                        View Details
                      </Link>
                      <div className="dropdown">
                        <Link
                          href="#"
                          className="btn btn-sm btn-outline-light"
                          data-bs-toggle="dropdown"
                        >
                          <i className="ti ti-dots-vertical" />
                        </Link>
                        <div className="dropdown-menu dropdown-menu-end">
                          <Link
                            className="dropdown-item"
                            href="#"
                            data-bs-toggle="offcanvas"
                            data-bs-target="#offcanvas_edit"
                          >
                            <i className="ti ti-edit text-blue" /> Edit
                          </Link>
                          <Link
                            className="dropdown-item"
                            href="#"
                            data-bs-toggle="modal"
                            data-bs-target="#delete_agent"
                          >
                            <i className="ti ti-trash" /> Delete
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              ))}
            </div>
          )}
          {/* /Agents Grid */}
        </div>
        {/* End Content */}
        {/* Start Footer */}
        <Footer/>
        {/* End Footer */}
      </div>
      {/* ========================
			End Page Content
		========================= */}
      <ModalAgents onSuccess={handleRefresh} />
    </>
  );
};

export default AgentsComponent;
