"use client";
/* eslint-disable @next/next/no-img-element */
import Footer from "@/core/common/footer/footer";
import PageHeader from "@/core/common/page-header/pageHeader";
import PredefinedDatePicker from "@/core/common/common-dateRangePicker/PredefinedDatePicker";
import { useState, useEffect } from "react";
import SearchInput from "@/core/common/dataTable/dataTableSearch";
import Datatable from "@/core/common/dataTable";
import ModalPipeline from "./modal/modalPipeline";
import Link from "next/link";
import { all_routes } from "@/router/all_routes";
import { getPipelines, deletePipeline, Pipeline } from "@/core/services/pipelines.service";

const PipelineComponent = () => {
  const [searchText, setSearchText] = useState<string>("");
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPipeline, setEditingPipeline] = useState<Pipeline | null>(null);
  const [pipelineToDelete, setPipelineToDelete] = useState<Pipeline | null>(null);

  useEffect(() => {
    fetchPipelines();
  }, []);

  const fetchPipelines = async () => {
    try {
      setLoading(true);
      const response = await getPipelines({
        search: searchText || undefined,
        includeStages: true,
      });

      if (response.success && response.data) {
        const pipelinesData = Array.isArray(response.data) ? response.data : [response.data];
        setPipelines(pipelinesData);
      }
    } catch (error) {
      console.error('Error fetching pipelines:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchText !== undefined) {
      const timeoutId = setTimeout(() => {
        fetchPipelines();
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [searchText]);

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleEdit = (pipeline: Pipeline) => {
    setEditingPipeline(pipeline);
    const offcanvas = document.getElementById('offcanvas_edit');
    if (offcanvas) {
      const bsOffcanvas = new (window as any).bootstrap.Offcanvas(offcanvas);
      bsOffcanvas.show();
    }
  };

  const handleDelete = async () => {
    if (!pipelineToDelete) return;

    try {
      const response = await deletePipeline(pipelineToDelete.id);
      if (response.success) {
        fetchPipelines();
        const modal = document.getElementById('delete_modal');
        if (modal) {
          const bsModal = (window as any).bootstrap?.Modal.getInstance(modal);
          if (bsModal) {
            bsModal.hide();
          }
        }
        setPipelineToDelete(null);
      } else {
        alert(response.error || 'Failed to delete pipeline');
      }
    } catch (error) {
      console.error('Error deleting pipeline:', error);
      alert('Failed to delete pipeline');
    }
  };

  const handleSuccess = () => {
    fetchPipelines();
    setEditingPipeline(null);
  };

  // Format data for table
  const data = pipelines.map((pipeline) => ({
    key: pipeline.id,
    PipelineName: pipeline.name,
    TotalDealValue: pipeline.totalDealValue || '$0',
    NoofDeals: pipeline.numberOfDeals?.toString() || '0',
    Stages: pipeline.stages?.length?.toString() || '0',
    CreatedDate: new Date(pipeline.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    Status: pipeline.status,
  }));
  const columns = [
    {
      title: "Pipeline Name",
      dataIndex: "PipelineName",
      sorter: (a: any, b: any) => a.PipelineName.length - b.PipelineName.length,
    },
    {
      title: "Total Deal Value",
      dataIndex: "TotalDealValue",
      sorter: (a: any, b: any) =>
        a.TotalDealValue.length - b.TotalDealValue.length,
    },
    {
      title: "No of Deals",
      dataIndex: "NoofDeals",
      sorter: (a: any, b: any) => a.NoofDeals.length - b.NoofDeals.length,
    },
    {
      title: "Stages",
      dataIndex: "Stages",
      render: (text: any) => (
        <span className="badge badge-soft-primary">{text} stage{text !== '1' ? 's' : ''}</span>
      ),
      sorter: (a: any, b: any) => parseInt(a.Stages) - parseInt(b.Stages),
    },
    {
      title: "Created Date",
      dataIndex: "CreatedDate",

      sorter: (a: any, b: any) => a.CreatedDate.length - b.CreatedDate.length,
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text: string) => (
        <span
          className={`badge badge-pill badge-status ${
            text === "Active" ? "bg-success" : "bg-danger"
          } `}
        >
          {text}
        </span>
      ),
      sorter: (a: any, b: any) => a.Status.length - b.Status.length,
    },

    {
      title: "Action",
      dataIndex: "Action",
      render: (_: any, record: any) => {
        const pipeline = pipelines.find((p) => p.id === record.key);
        return (
          <div className="dropdown table-action">
            <Link
              href="#"
              className="action-icon btn btn-xs shadow btn-icon btn-outline-light"
              data-bs-toggle="dropdown"
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
                  if (pipeline) handleEdit(pipeline);
                }}
              >
                <i className="ti ti-edit text-blue" /> Edit
              </Link>
              <Link
                className="dropdown-item"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (pipeline) {
                    setPipelineToDelete(pipeline);
                    const modal = document.getElementById('delete_modal');
                    if (modal) {
                      const bsModal = new (window as any).bootstrap.Modal(modal);
                      bsModal.show();
                    }
                  }
                }}
              >
                <i className="ti ti-trash" /> Delete
              </Link>
            </div>
          </div>
        );
      },
      sorter: (a: any, b: any) => a.Action.length - b.Action.length,
    },
  ];
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
            title="Pipeline"
            badgeCount={125}
            showModuleTile={false}
            showExport={true}
          />
          {/* End Page Header */}
          {/* card start */}
          <div className="card border-0 rounded-0">
            <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
              <div className="input-icon input-icon-start position-relative">
                <span className="input-icon-addon text-dark">
                  <i className="ti ti-search" />
                </span>
                <SearchInput value={searchText} onChange={handleSearch} />
              </div>
              <Link
                href="#"
                className="btn btn-primary"
                data-bs-toggle="offcanvas"
                data-bs-target="#offcanvas_add"
              >
                <i className="ti ti-square-rounded-plus-filled me-1" />
                Add Pipeline
              </Link>
            </div>
            <div className="card-body">
              {/* table header */}
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                <div className="d-flex align-items-center gap-2 flex-wrap">
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
                  <PredefinedDatePicker/>
                </div>
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
                    <div className="filter-dropdown-menu dropdown-menu dropdown-menu-lg p-0">
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
                          <div className="filter-set-content">
                            <div className="filter-set-content-head">
                              <Link
                                href="#"
                                className="collapsed"
                                data-bs-toggle="collapse"
                                data-bs-target="#collapseThree"
                                aria-expanded="false"
                                aria-controls="collapseThree"
                              >
                                Pipeline Name
                              </Link>
                            </div>
                            <div
                              className="filter-set-contents accordion-collapse collapse"
                              id="collapseThree"
                              data-bs-parent="#accordionExample"
                            >
                              <div className="filter-content-list bg-light rounded border p-2 shadow mt-2">
                                <ul>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Sales
                                    </label>
                                  </li>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Marketing
                                    </label>
                                  </li>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Email
                                    </label>
                                  </li>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Chats
                                    </label>
                                  </li>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Operational
                                    </label>
                                  </li>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Collaborative
                                    </label>
                                  </li>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Differentiate
                                    </label>
                                  </li>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Interact
                                    </label>
                                  </li>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Deals
                                    </label>
                                  </li>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Onboarding
                                    </label>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                          <div className="filter-set-content">
                            <div className="filter-set-content-head">
                              <Link
                                href="#"
                                className="collapsed"
                                data-bs-toggle="collapse"
                                data-bs-target="#Status"
                                aria-expanded="false"
                                aria-controls="Status"
                              >
                                Status
                              </Link>
                            </div>
                            <div
                              className="filter-set-contents accordion-collapse collapse"
                              id="Status"
                              data-bs-parent="#accordionExample"
                            >
                              <div className="filter-content-list bg-light rounded border p-2 shadow mt-2">
                                <ul>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Active
                                    </label>
                                  </li>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Inactive
                                    </label>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                          <div className="filter-set-content">
                            <div className="filter-set-content-head">
                              <Link
                                href="#"
                                className="collapsed"
                                data-bs-toggle="collapse"
                                data-bs-target="#date"
                                aria-expanded="false"
                                aria-controls="date"
                              >
                                Created Date
                              </Link>
                            </div>
                            <div
                              className="filter-set-contents accordion-collapse collapse"
                              id="date"
                              data-bs-parent="#accordionExample"
                            >
                              <div className="filter-content-list bg-light rounded border p-2 shadow mt-2">
                                <div className="reportrange-picker reportrange d-flex align-items-center shadow">
                                  <i className="ti ti-calendar-due text-dark fs-14 me-1" />
                                  <span className="reportrange-picker-field" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <Link href="#" className="btn btn-outline-light w-100">
                            Reset
                          </Link>
                          <Link
                            href={all_routes.pipeline}
                            className="btn btn-primary w-100"
                          >
                            Filter
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="dropdown">
                    <Link
                      href="#"
                      className="btn bg-soft-indigo px-2 border-0"
                      data-bs-toggle="dropdown"
                      data-bs-auto-close="outside"
                    >
                      <i className="ti ti-columns-3 me-2" />
                      Manage Columns
                    </Link>
                    <div className="dropdown-menu dropdown-menu-md dropdown-md p-3">
                      <ul>
                        <li className="gap-1 d-flex align-items-center mb-2">
                          <i className="ti ti-columns me-1" />
                          <div className="form-check form-switch w-100 ps-0">
                            <label className="form-check-label d-flex align-items-center gap-2 w-100">
                              <span>Pipeline Name</span>
                              <input
                                className="form-check-input switchCheckDefault ms-auto"
                                type="checkbox"
                                role="switch"
                                defaultChecked
                              />
                            </label>
                          </div>
                        </li>
                        <li className="gap-1 d-flex align-items-center mb-2">
                          <i className="ti ti-columns me-1" />
                          <div className="form-check form-switch w-100 ps-0">
                            <label className="form-check-label d-flex align-items-center gap-2 w-100">
                              <span>Deal Value</span>
                              <input
                                className="form-check-input switchCheckDefault ms-auto"
                                type="checkbox"
                                role="switch"
                                defaultChecked
                              />
                            </label>
                          </div>
                        </li>
                        <li className="gap-1 d-flex align-items-center mb-2">
                          <i className="ti ti-columns me-1" />
                          <div className="form-check form-switch w-100 ps-0">
                            <label className="form-check-label d-flex align-items-center gap-2 w-100">
                              <span>No of Deals</span>
                              <input
                                className="form-check-input switchCheckDefault ms-auto"
                                type="checkbox"
                                role="switch"
                              />
                            </label>
                          </div>
                        </li>
                        <li className="gap-1 d-flex align-items-center mb-2">
                          <i className="ti ti-columns me-1" />
                          <div className="form-check form-switch w-100 ps-0">
                            <label className="form-check-label d-flex align-items-center gap-2 w-100">
                              <span>Stages</span>
                              <input
                                className="form-check-input switchCheckDefault ms-auto"
                                type="checkbox"
                                role="switch"
                                defaultChecked
                              />
                            </label>
                          </div>
                        </li>
                        <li className="gap-1 d-flex align-items-center mb-2">
                          <i className="ti ti-columns me-1" />
                          <div className="form-check form-switch w-100 ps-0">
                            <label className="form-check-label d-flex align-items-center gap-2 w-100">
                              <span>Created Date</span>
                              <input
                                className="form-check-input switchCheckDefault ms-auto"
                                type="checkbox"
                                role="switch"
                                defaultChecked
                              />
                            </label>
                          </div>
                        </li>
                        <li className="gap-1 d-flex align-items-center mb-2">
                          <i className="ti ti-columns me-1" />
                          <div className="form-check form-switch w-100 ps-0">
                            <label className="form-check-label d-flex align-items-center gap-2 w-100">
                              <span>Action</span>
                              <input
                                className="form-check-input switchCheckDefault ms-auto"
                                type="checkbox"
                                role="switch"
                                defaultChecked
                              />
                            </label>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              {/* table header */}
              {/* Pipeline List */}
              <div className=" custom-table table-nowrap">
                <Datatable
                  columns={columns}
                  dataSource={data}
                  Selection={true}
                  searchText={searchText}
                />
              </div>
              {/* /Pipeline List */}
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
        <ModalPipeline pipeline={editingPipeline} onSuccess={handleSuccess} />
        
        {/* Delete Confirmation Modal */}
        <div className="modal fade" id="delete_modal">
          <div className="modal-dialog modal-dialog-centered modal-sm rounded-0">
            <div className="modal-content rounded-0">
              <div className="modal-body p-4 text-center position-relative">
                <div className="mb-3 position-relative z-1">
                  <span className="avatar avatar-xl badge-soft-danger border-0 text-danger rounded-circle">
                    <i className="ti ti-trash fs-24" />
                  </span>
                </div>
                <h5 className="mb-1">Delete Confirmation</h5>
                <p className="mb-3">
                  Are you sure you want to remove the pipeline "{pipelineToDelete?.name}"?
                </p>
                <div className="d-flex justify-content-center">
                  <Link
                    href="#"
                    className="btn btn-light position-relative z-1 me-2 w-100"
                    data-bs-dismiss="modal"
                    onClick={() => setPipelineToDelete(null)}
                  >
                    Cancel
                  </Link>
                  <Link
                    href="#"
                    className="btn btn-primary position-relative z-1 w-100"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete();
                    }}
                  >
                    Yes, Delete
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* /Delete Confirmation Modal */}
    </>
  );
};

export default PipelineComponent;
