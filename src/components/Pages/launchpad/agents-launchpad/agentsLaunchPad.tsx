"use client";
/* eslint-disable @next/next/no-img-element */

import Footer from "@/core/common/footer/footer";
import CollapseIcons from "@/core/common/collapse-icons/collapseIcons";
import Link from "next/link";
import PredefinedDatePicker from "@/core/common/common-dateRangePicker/PredefinedDatePicker";
import { all_routes } from "@/router/all_routes";
import { useEffect, useState } from "react";
import ImageWithBasePath from "@/core/common/imageWithBasePath";

interface OnboardingStats {
  stats: {
    newHiresToday: number;
    newHiresThisMonth: number;
    newHiresLastMonth: number;
    agentsOnFile: number;
  };
  pendingActions: {
    newHiresToOnboard: number;
    incomingOnboardingRecords: number;
    convertToAgent: number;
  };
  onboardingStatus: {
    newHiresInQueue: number;
    incompleteOnboarding: number;
    pastDue: number;
  };
  newHiresThisMonth: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
    onboardingStatus: string;
    onboardingId: string | null;
  }>;
}

const AgentsLaunchPadComponent = () => {
  const [stats, setStats] = useState<OnboardingStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/onboarding/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        console.error('Failed to fetch stats:', data.error);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOnboardingStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return 'badge-soft-success';
      case 'Awaiting Approval':
        return 'badge-soft-warning';
      case 'Compliance Pending':
        return 'badge-soft-info';
      case 'Onboarding Started':
        return 'badge-soft-primary';
      case 'Invited':
        return 'badge-soft-secondary';
      case 'Not Started':
        return 'badge-soft-danger';
      default:
        return 'badge-soft-secondary';
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
              <h4 className="mb-0">Agents LaunchPad</h4>
              <p className="text-muted mb-0">Onboarding overview and management</p>
            </div>
            <div className="gap-2 d-flex align-items-center flex-wrap">
              <PredefinedDatePicker />
              <CollapseIcons />
            </div>
          </div>
          {/* End Page Header */}

          {/* Stats Cards */}
          <div className="row mb-4">
            <div className="col-xl-3 col-sm-6 mb-3">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div className="avatar avatar-md">
                        <span className="avatar-inner bg-primary">
                          <i className="ti ti-calendar-event fs-20" />
                        </span>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="mb-1">New Hires (Today)</h6>
                      <h4 className="mb-0">{loading ? '...' : stats?.stats.newHiresToday || 0}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-sm-6 mb-3">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div className="avatar avatar-md">
                        <span className="avatar-inner bg-success">
                          <i className="ti ti-calendar-check fs-20" />
                        </span>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="mb-1">New Hires (This Month)</h6>
                      <h4 className="mb-0">{loading ? '...' : stats?.stats.newHiresThisMonth || 0}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-sm-6 mb-3">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div className="avatar avatar-md">
                        <span className="avatar-inner bg-info">
                          <i className="ti ti-calendar-minus fs-20" />
                        </span>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="mb-1">New Hires (Last Month)</h6>
                      <h4 className="mb-0">{loading ? '...' : stats?.stats.newHiresLastMonth || 0}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-sm-6 mb-3">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div className="avatar avatar-md">
                        <span className="avatar-inner bg-warning">
                          <i className="ti ti-users fs-20" />
                        </span>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="mb-1">Agents (On File)</h6>
                      <h4 className="mb-0">{loading ? '...' : stats?.stats.agentsOnFile || 0}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* End Stats Cards */}

          {/* My Pending Actions */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h6 className="mb-0">
                    <i className="ti ti-alert-circle me-2" />
                    My Pending Actions
                  </h6>
                </div>
                <div className="card-body">
                  <p className="text-muted mb-3">
                    Please complete your pending tasks before due.
                  </p>
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <div className="card border border-warning">
                        <div className="card-body">
                          <div className="d-flex align-items-center justify-content-between">
                            <div>
                              <h6 className="mb-1">New Hire to Onboard</h6>
                              <h4 className="mb-0 text-warning">
                                {loading ? '...' : stats?.pendingActions.newHiresToOnboard || 0}
                              </h4>
                            </div>
                            <Link
                              href={all_routes.agentsList}
                              className="btn btn-warning btn-sm"
                            >
                              Review Now
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4 mb-3">
                      <div className="card border border-info">
                        <div className="card-body">
                          <div className="d-flex align-items-center justify-content-between">
                            <div>
                              <h6 className="mb-1">Incoming Onboarding Records</h6>
                              <h4 className="mb-0 text-info">
                                {loading ? '...' : stats?.pendingActions.incomingOnboardingRecords || 0}
                              </h4>
                            </div>
                            <Link
                              href={all_routes.agentsList}
                              className="btn btn-info btn-sm"
                            >
                              Review Now
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4 mb-3">
                      <div className="card border border-success">
                        <div className="card-body">
                          <div className="d-flex align-items-center justify-content-between">
                            <div>
                              <h6 className="mb-1">Convert to Agent</h6>
                              <h4 className="mb-0 text-success">
                                {loading ? '...' : stats?.pendingActions.convertToAgent || 0}
                              </h4>
                            </div>
                            <Link
                              href={all_routes.agentsList}
                              className="btn btn-success btn-sm"
                            >
                              Convert Now
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* End My Pending Actions */}

          {/* Onboarding Status */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h6 className="mb-0">
                    <i className="ti ti-chart-bar me-2" />
                    Onboarding Status
                  </h6>
                  <p className="text-muted mb-0 small">Quick glance on your Onboarding status</p>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded">
                        <div>
                          <h6 className="mb-1 text-muted">New Hires in Queue</h6>
                          <h3 className="mb-0 text-primary">
                            {loading ? '...' : stats?.onboardingStatus.newHiresInQueue || 0}
                          </h3>
                          <small className="text-muted">Not started</small>
                        </div>
                        <div className="avatar avatar-lg bg-primary">
                          <i className="ti ti-clock fs-24" />
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4 mb-3">
                      <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded">
                        <div>
                          <h6 className="mb-1 text-muted">Incomplete Onboarding</h6>
                          <h3 className="mb-0 text-warning">
                            {loading ? '...' : stats?.onboardingStatus.incompleteOnboarding || 0}
                          </h3>
                          <small className="text-muted">In progress</small>
                        </div>
                        <div className="avatar avatar-lg bg-warning">
                          <i className="ti ti-file-incomplete fs-24" />
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4 mb-3">
                      <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded">
                        <div>
                          <h6 className="mb-1 text-muted">Past Due</h6>
                          <h3 className="mb-0 text-danger">
                            {loading ? '...' : stats?.onboardingStatus.pastDue || 0}
                          </h3>
                          <small className="text-muted">Requires attention</small>
                        </div>
                        <div className="avatar avatar-lg bg-danger">
                          <i className="ti ti-alert-triangle fs-24" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* End Onboarding Status */}

          {/* New Hires This Month Table */}
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                  <h6 className="mb-0">New Hires This Month</h6>
                  <Link
                    href={all_routes.agentsList}
                    className="btn btn-outline-light btn-sm"
                  >
                    View All Agents
                  </Link>
                </div>
                <div className="card-body">
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : !stats?.newHiresThisMonth || stats.newHiresThisMonth.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <i className="ti ti-users-off fs-48 mb-3 d-block" />
                      <p>No new hires this month</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>Agent Name</th>
                            <th>Email</th>
                            <th>Onboarding Status</th>
                            <th>Date Added</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.newHiresThisMonth.map((hire) => (
                            <tr key={hire.id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="avatar avatar-sm me-2">
                                    <span className="avatar-inner bg-primary">
                                      <i className="ti ti-user fs-14" />
                                    </span>
                                  </div>
                                  <div>
                                    <Link
                                      href={`${all_routes.agentsDetails}?id=${hire.id}`}
                                      className="fw-medium"
                                    >
                                      {hire.firstName} {hire.lastName}
                                    </Link>
                                  </div>
                                </div>
                              </td>
                              <td>{hire.email}</td>
                              <td>
                                <span className={`badge ${getOnboardingStatusBadge(hire.onboardingStatus)}`}>
                                  {hire.onboardingStatus}
                                </span>
                              </td>
                              <td>
                                {new Date(hire.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </td>
                              <td>
                                <Link
                                  href={`${all_routes.agentsDetails}?id=${hire.id}`}
                                  className="btn btn-sm btn-outline-light"
                                  title="View Details"
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
          </div>
          {/* End New Hires This Month Table */}
        </div>
        {/* End Content */}
        <Footer />
      </div>
      {/* ========================
			End Page Content
		========================= */}
    </>
  );
};

export default AgentsLaunchPadComponent;
