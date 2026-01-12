"use client";
/* eslint-disable @next/next/no-img-element */

import Footer from "../../../../core/common/footer/footer";
import CollapseIcons from "../../../../core/common/collapse-icons/collapseIcons";
import Link from "next/link";
import PredefinedDatePicker from "@/core/common/common-dateRangePicker/PredefinedDatePicker";
import { all_routes } from "@/router/all_routes";
import { useEffect, useState } from "react";
import { getAgents } from "@/core/services/agents.service";
import { Agent } from "@/core/data/interface/agent.interface";

const AgentsDashboardComponent = () => {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    suspended: 0,
    terminated: 0,
    pending: 0,
  });
  const [recentAgents, setRecentAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getAgents({ limit: 100 });
      
      if (response.success && response.data) {
        const agents = response.data;
        
        // Calculate stats
        const total = agents.length;
        const active = agents.filter(a => a.status === 'Active').length;
        const suspended = agents.filter(a => a.status === 'Suspended').length;
        const terminated = agents.filter(a => a.status === 'Terminated').length;
        const pending = agents.filter(a => 
          a.status === 'Invited' || 
          a.status === 'Onboarding Started' || 
          a.status === 'Profile Complete' || 
          a.status === 'Compliance Pending' || 
          a.status === 'Awaiting Approval'
        ).length;

        setStats({ total, active, suspended, terminated, pending });

        // Get recent agents (last 5)
        const sorted = [...agents].sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        setRecentAgents(sorted.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-success';
      case 'Suspended':
        return 'bg-warning';
      case 'Terminated':
        return 'bg-danger';
      default:
        return 'bg-info';
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
              <h4 className="mb-0">Agents Dashboard</h4>
            </div>
            <div className="gap-2 d-flex align-items-center flex-wrap">
              <PredefinedDatePicker />
              <CollapseIcons />
            </div>
          </div>
          {/* End Page Header */}

          {/* Stats Cards */}
          <div className="row">
            <div className="col-xl-3 col-sm-6">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div className="avatar avatar-md">
                        <span className="avatar-inner bg-primary">
                          <i className="ti ti-users fs-20" />
                        </span>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="mb-1">Total Agents</h6>
                      <h4 className="mb-0">{loading ? '...' : stats.total}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-sm-6">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div className="avatar avatar-md">
                        <span className="avatar-inner bg-success">
                          <i className="ti ti-user-check fs-20" />
                        </span>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="mb-1">Active Agents</h6>
                      <h4 className="mb-0">{loading ? '...' : stats.active}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-sm-6">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div className="avatar avatar-md">
                        <span className="avatar-inner bg-warning">
                          <i className="ti ti-user-pause fs-20" />
                        </span>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="mb-1">Suspended</h6>
                      <h4 className="mb-0">{loading ? '...' : stats.suspended}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-sm-6">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div className="avatar avatar-md">
                        <span className="avatar-inner bg-info">
                          <i className="ti ti-user-plus fs-20" />
                        </span>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="mb-1">Pending Onboarding</h6>
                      <h4 className="mb-0">{loading ? '...' : stats.pending}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* End Stats Cards */}

          {/* start row */}
          <div className="row">
            <div className="col-md-6 d-flex">
              <div className="card flex-fill">
                <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                  <h6 className="mb-0">Recently Added Agents</h6>
                  <Link
                    href={all_routes.agentsList}
                    className="btn btn-outline-light btn-sm"
                  >
                    View All
                  </Link>
                </div>
                <div className="card-body">
                  {loading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : recentAgents.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      No agents found
                    </div>
                  ) : (
                    <div className="table-responsive custom-table">
                      <table
                        className="table dataTable table-nowrap no-footer"
                        id="recent-agents"
                        style={{ width: '100%' }}
                      >
                        <thead className="table-light">
                          <tr>
                            <th className="sorting_disabled">Agent Name</th>
                            <th className="sorting_disabled">Email</th>
                            <th className="sorting_disabled">Status</th>
                            <th className="sorting_disabled">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentAgents.map((agent) => (
                            <tr key={agent.id}>
                              <td>
                                <Link
                                  href={`${all_routes.agentsDetails}?id=${agent.id}`}
                                  className="fw-medium"
                                >
                                  {agent.firstName} {agent.lastName}
                                </Link>
                              </td>
                              <td>{agent.email}</td>
                              <td>
                                <span className={`badge badge-pill ${getStatusBadgeClass(agent.status)}`}>
                                  {agent.status}
                                </span>
                              </td>
                              <td>
                                <Link
                                  href={`${all_routes.agentsDetails}?id=${agent.id}`}
                                  className="btn btn-sm btn-outline-light"
                                >
                                  <i className="ti ti-eye" />
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-6 d-flex">
              <div className="card flex-fill">
                <div className="card-header">
                  <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                    <h6 className="mb-0">Agents by Status</h6>
                  </div>
                </div>
                <div className="card-body">
                  <div className="d-flex flex-column gap-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-success">Active</span>
                        <span className="text-muted">Agents</span>
                      </div>
                      <h6 className="mb-0">{stats.active}</h6>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-warning">Suspended</span>
                        <span className="text-muted">Agents</span>
                      </div>
                      <h6 className="mb-0">{stats.suspended}</h6>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-danger">Terminated</span>
                        <span className="text-muted">Agents</span>
                      </div>
                      <h6 className="mb-0">{stats.terminated}</h6>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-info">Pending</span>
                        <span className="text-muted">Onboarding</span>
                      </div>
                      <h6 className="mb-0">{stats.pending}</h6>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* end row */}

          {/* Quick Actions */}
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h6 className="mb-0">Quick Actions</h6>
                </div>
                <div className="card-body">
                  <div className="d-flex flex-wrap gap-2">
                    <Link
                      href={all_routes.agentsList}
                      className="btn btn-primary"
                    >
                      <i className="ti ti-list me-1" />
                      View All Agents
                    </Link>
                    <Link
                      href={all_routes.agentsGrid}
                      className="btn btn-outline-primary"
                    >
                      <i className="ti ti-grid me-1" />
                      Agents Grid View
                    </Link>
                    <Link
                      href={all_routes.agentsDetails}
                      className="btn btn-outline-primary"
                    >
                      <i className="ti ti-user-plus me-1" />
                      Add New Agent
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* End Content */}
        <Footer />
      </div>
      {/* End Page Wrapper */}
    </>
  );
};

export default AgentsDashboardComponent;
