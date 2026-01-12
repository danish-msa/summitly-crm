"use client";
/* eslint-disable @next/next/no-img-element */
import Footer from "@/core/common/footer/footer";
import PageHeader from "@/core/common/page-header/pageHeader";
import ImageWithBasePath from "@/core/common/imageWithBasePath";
import ModalTask from "./modal/modalTask";
import Link from "next/link";
import { all_routes } from "@/router/all_routes";
import CommonDatePicker from "@/core/common/common-datePicker/commonDatePicker";
import PredefinedDatePicker from "@/core/common/common-dateRangePicker/PredefinedDatePicker";
import TasksList from "./TasksList";
import TaskSetsList from "./TaskSetsList";
import ModalTaskSet from "./modal/modalTaskSet";
import { useState, useEffect } from "react";
import { getTasks, TaskResponse } from "@/core/services/tasks.service";

const TasksComponent = () => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'sets'>('tasks');
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [isCompletedFilter, setIsCompletedFilter] = useState<boolean | undefined>();
  const [totalTasks, setTotalTasks] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchTaskCount();
  }, [refreshKey]);

  const fetchTaskCount = async () => {
    try {
      const response: TaskResponse = await getTasks({ limit: 1 });
      if (response.success && response.total !== undefined) {
        setTotalTasks(response.total);
      }
    } catch (error) {
      console.error('Error fetching task count:', error);
    }
  };

  const handleTaskCreated = () => {
    // Refresh task list and count
    setRefreshKey(prev => prev + 1);
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
          <PageHeader
            title="Tasks"
            badgeCount={totalTasks}
            showModuleTile={false}
            showExport={true}
          />
          {/* End Page Header */}
          {/* Tabs Navigation */}
          <div className="card border-0 rounded-0 mb-3">
            <div className="card-body pb-0 pt-2">
              <ul className="nav nav-tabs nav-bordered mb-3" role="tablist">
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link border-3 ${activeTab === 'tasks' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tasks')}
                    type="button"
                  >
                    <span className="d-md-inline-block">
                      <i className="ti ti-checklist me-1" />
                      Tasks
                    </span>
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link border-3 ${activeTab === 'sets' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sets')}
                    type="button"
                  >
                    <span className="d-md-inline-block">
                      <i className="ti ti-folder me-1" />
                      Task Sets
                    </span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
          {/* card start */}
          <div className="card border-0 rounded-0">
            <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
              {activeTab === 'tasks' ? (
                <>
                  <div className="input-icon input-icon-start position-relative">
                    <span className="input-icon-addon text-dark">
                      <i className="ti ti-search" />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search tasks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Link
                    href="#"
                    className="btn btn-primary"
                    data-bs-toggle="offcanvas"
                    data-bs-target="#offcanvas_add"
                  >
                    <i className="ti ti-square-rounded-plus-filled me-1" />
                    Add New Task
                  </Link>
                </>
              ) : (
                <>
                  <div className="input-icon input-icon-start position-relative">
                    <span className="input-icon-addon text-dark">
                      <i className="ti ti-search" />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search task sets..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Link
                    href="#"
                    className="btn btn-primary"
                    data-bs-toggle="offcanvas"
                    data-bs-target="#offcanvas_add_task_set"
                  >
                    <i className="ti ti-square-rounded-plus-filled me-1" />
                    Create Task Set
                  </Link>
                </>
              )}
            </div>
            <div className="card-body">
              {/* Tab Content */}
              {activeTab === 'tasks' ? (
                <>
                  {/* table header */}
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <div className="dropdown">
                        <Link
                          className="dropdown-toggle btn btn-outline-light shadow"
                          data-bs-toggle="dropdown"
                          href="#"
                        >
                          All Tasks
                        </Link>
                        <div className="dropdown-menu dropdown-menu-end">
                          <Link 
                            href={all_routes.tasks} 
                            className="dropdown-item"
                            onClick={(e) => {
                              e.preventDefault();
                              setStatusFilter(undefined);
                              setIsCompletedFilter(undefined);
                            }}
                          >
                            All Tasks
                          </Link>
                          <Link 
                            href={all_routes.tasksImportant} 
                            className="dropdown-item"
                            onClick={(e) => {
                              e.preventDefault();
                              setStatusFilter(undefined);
                              setIsCompletedFilter(undefined);
                            }}
                          >
                            Important
                          </Link>
                          <Link 
                            href={all_routes.tasksCompleted} 
                            className="dropdown-item"
                            onClick={(e) => {
                              e.preventDefault();
                              setStatusFilter(undefined);
                              setIsCompletedFilter(true);
                            }}
                          >
                            Completed
                          </Link>
                        </div>
                      </div>
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
                        <div className="filter-dropdown-menu dropdown-menu dropdown-menu-xl p-0">
                          <div className="filter-header d-flex align-items-center justify-content-between border-bottom">
                            <h6 className="mb-0">
                              <i className="ti ti-filter me-1" />
                              Filter
                            </h6>
                            <button
                              type="button"
                              className="btn-close close-filter-btn"
                              data-bs-dismiss="dropdown-menu"
                              aria-label="Close"
                            />
                          </div>
                          <div className="filter-set-view p-3">
                            <div className="accordion" id="accordionExample">
                              {/* Filter content can be added here if needed */}
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <Link href="#" className="btn btn-outline-light w-100">
                                Reset
                              </Link>
                              <Link href="" className="btn btn-primary w-100">
                                Filter
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                      <PredefinedDatePicker/>
                    </div>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <div className="form-check form-check-md">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="select-all"
                        />
                        <label className="form-check-label" htmlFor="select-all">
                          Mark all as read
                        </label>
                      </div>
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
                  </div>
                  {/* Task List - Dynamic */}
                  <TasksList 
                    searchQuery={searchQuery}
                    statusFilter={statusFilter}
                    isCompletedFilter={isCompletedFilter}
                    refreshKey={refreshKey}
                  />
                </>
              ) : (
                <TaskSetsList 
                  searchQuery={searchQuery}
                  refreshKey={refreshKey}
                />
              )}
            </div>
          </div>
          {/* card end */}
        </div>
        {/* End Content */}
        {/* Start Footer */}
        <Footer />
        {/* End Footer */}
      </div>
      {/* ========================
			End Page Content
		========================= */}
        <ModalTask onSuccess={handleTaskCreated} />
        <ModalTaskSet onSuccess={handleTaskCreated} />
        {/* Modals for assigning task sets will be rendered by TaskSetsList */}
    </>
  );
};

export default TasksComponent;
