"use client";
/* eslint-disable @next/next/no-img-element */
import ImageWithBasePath from "@/core/common/imageWithBasePath";
import { useState, useEffect } from "react";
import SearchInput from "@/core/common/dataTable/dataTableSearch";
import Datatable from "@/core/common/dataTable";
import Footer from "@/core/common/footer/footer";
import PageHeader from "@/core/common/page-header/pageHeader";
import PredefinedDatePicker from "@/core/common/common-dateRangePicker/PredefinedDatePicker";
import ModalAgents from "./modals/modalAgents";
import Link from "next/link";
import { all_routes } from "@/router/all_routes";
import { getAgents, transformAgentToListData, deleteAgent } from "@/core/services/agents.service";
import { AgentListData } from "@/core/data/interface/agent.interface";

const AgentsListComponent = () => {
  const [filledStars, setFilledStars] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [data, setData] = useState<AgentListData[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [searchText, setSearchText] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleClick = (key: string) => {
    setFilledStars((prev) => ({
      ...prev,
      [key]: !prev[key], // toggle on/off
    }));
  };

  // Fetch agents from API
  useEffect(() => {
    fetchAgents();
  }, [searchText, refreshKey]);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const response = await getAgents({
        search: searchText || undefined,
        limit: 100,
        offset: 0,
      });

      if (response.success && response.data) {
        const transformedData = response.data.map(transformAgentToListData);
        setData(transformedData);
        setTotal(response.total || 0);
      } else {
        console.error('Failed to fetch agents:', response.error);
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this agent?')) {
      const response = await deleteAgent(id);
      if (response.success) {
        // Refresh the list
        setRefreshKey(prev => prev + 1);
      } else {
        alert(response.error || 'Failed to delete agent');
      }
    }
  };
  const columns = [
    {
      title: "",
      dataIndex: "Name",
      render: (_: any, record: any) => (
        <div
          className={`set-star rating-select ${
            filledStars[record.Name] ? "filled" : ""
          }`}
          onClick={() => handleClick(record.Name)}
        >
          <i className="ti ti-star-filled fs-16" />
        </div>
      ),
      sorter: (a: any, b: any) => a.Name.length - b.Name.length,
    },
    {
      title: "Name",
      dataIndex: "Name",
      render: (text: string, render: any) => (
        <h6 className="d-flex align-items-center fs-14 fw-medium mb-0">
          <Link href={`${all_routes.agentsDetails}?id=${render.key}`} className="avatar me-2">
            <ImageWithBasePath
              className="img-fluid rounded-circle"
              src={`assets/img/profiles/${render.Image}`}
              alt="Agent Image"
            />
          </Link>
          <Link href={`${all_routes.agentsDetails}?id=${render.key}`} className="d-flex flex-column">
            {text}{" "}
            <span className="text-body fs-13 fw-normal mt-1">
              {render.Role}{" "}
            </span>
          </Link>
        </h6>
      ),
      sorter: (a: any, b: any) => a.Name.length - b.Name.length,
    },
    {
      title: "Tags",
      dataIndex: "Tags",
      render: (text: any) => (
        <span
          className={`badge badge-tag ${
            text === "Collab"
              ? "badge-soft-success"
              : text === "VIP"
              ? "badge-soft-warning"
              : "badge-soft-danger"
          } `}
        >{text}</span>
      ),
      sorter: (a: any, b: any) => a.Tags.length - b.Tags.length,
    },
    {
      title: "Location",
      dataIndex: "Location",
      render: (text: any, render: any) => (
        <div className="d-flex align-items-center mb-0">
          <Link
            href={all_routes.agentsDetails}
            className="avatar avatar-xss me-2"
          >
            <ImageWithBasePath
              className="img-fluid rounded-circle"
              src={`assets/img/flags/${render.Flags}`}
              alt="Flag Image"
            />
          </Link>
          {text}
        </div>
      ),
      sorter: (a: any, b: any) => a.Location.length - b.Location.length,
    },
    {
      title: "Rating",
      dataIndex: "Rating",
      render: (text: any) => (
        <div className="set-star">
          <span>
            <i className="ti ti-star-filled text-warning" /> {text}{" "}
          </span>
        </div>
      ),
      sorter: (a: any, b: any) => a.Rating.length - b.Rating.length,
    },
    {
      title: "Contact",
      dataIndex: "Contact",
      render: () => (
        <ul className="social-links d-flex align-items-center">
          <li>
            <Link href="#">
              <i className="ti ti-mail" />
            </Link>
          </li>
          <li>
            <Link href="#">
              <i className="ti ti-phone-check" />
            </Link>
          </li>
          <li>
            <Link href="#">
              <i className="ti ti-message-circle-share" />
            </Link>
          </li>
          <li>
            <Link href="#">
              <i className="ti ti-brand-facebook " />
            </Link>
          </li>
        </ul>
      ),
      sorter: (a: any, b: any) => a.Contact?.length - b.Contact?.length,
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text: any) => (
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
      render: (_: any, record: any) => (
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
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvas_edit"
            >
              <i className="ti ti-edit text-blue" /> Edit
            </Link>
            <Link
              className="dropdown-item"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleDelete(record.key);
              }}
            >
              <i className="ti ti-trash" /> Delete
            </Link>
            <Link className="dropdown-item" href={`${all_routes.agentsDetails}?id=${record.key}`}>
              <i className="ti ti-eye text-blue-light" /> Preview
            </Link>
          </div>
        </div>
      ),
      sorter: (a: any, b: any) => a.Action?.length - b.Action?.length,
    },
  ];

  const handleSearch = (value: string) => {
    setSearchText(value);
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
        <div className="content pb-0">
          {/* Page Header */}
         <PageHeader title="Agents" badgeCount={total} showModuleTile={false} showExport={true}/>
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
                Add Agent
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
                  <div className="d-flex align-items-center shadow p-1 rounded border view-icons bg-white">
                    <Link
                      href={all_routes.agentsList}
                      className="btn btn-sm p-1 border-0 fs-14 active"
                    >
                      <i className="ti ti-list-tree" />
                    </Link>
                    <Link
                      href={all_routes.agentsGrid}
                      className="flex-shrink-0 btn btn-sm p-1 border-0 ms-1 fs-14"
                    >
                      <i className="ti ti-grid-dots" />
                    </Link>
                  </div>
                </div>
              </div>
              {/* table header */}
              {/* Agents List */}
                {loading ? (
                  <div className="text-center p-4">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <Datatable
                    columns={columns}
                    dataSource={data}
                    Selection={true}
                    searchText={searchText}
                  />
                )}
              {/* /Agents List */}
            </div>
          </div>
          {/* card end */}
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

export default AgentsListComponent;
