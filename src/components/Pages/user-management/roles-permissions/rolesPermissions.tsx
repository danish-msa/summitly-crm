"use client";
/* eslint-disable @next/next/no-img-element */
import Footer from "@/core/common/footer/footer";
import PageHeader from "@/core/common/page-header/pageHeader";
import SearchInput from "@/core/common/dataTable/dataTableSearch";
import { useState, useEffect } from "react";
import Datatable from "@/core/common/dataTable";
import Link from "next/link";
import { all_routes } from "@/router/all_routes";
import { getRoles, deleteRole } from "@/core/services/roles.service";
import { Role } from "@/core/data/interface/user.interface";
import dayjs from "dayjs";

const RolesPermissionsComponent = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRoles, setTotalRoles] = useState(0);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>("");

  useEffect(() => {
    fetchRoles();
  }, [searchText]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await getRoles({
        search: searchText || undefined,
        includeUserCount: true,
        limit: 100,
      });
      
      if (response.success && response.data) {
        setRoles(response.data);
        setTotalRoles(response.total || response.data.length);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (roleId: string) => {
    setSelectedRoleId(roleId);
    
    // Load role data
    try {
      const { getRole } = await import('@/core/services/roles.service');
      const response = await getRole(roleId);
      if (response.success && response.data) {
        const role = response.data;
        const nameInput = document.getElementById('editRoleName') as HTMLInputElement;
        const descInput = document.getElementById('editRoleDescription') as HTMLTextAreaElement;
        const isActiveInput = document.getElementById('editRoleIsActive') as HTMLInputElement;
        
        if (nameInput) nameInput.value = role.name;
        if (descInput) descInput.value = role.description || '';
        if (isActiveInput) isActiveInput.checked = role.isActive;
      }
    } catch (error) {
      console.error('Error loading role:', error);
    }

    const modal = document.getElementById('edit_role');
    if (modal) {
      const bsModal = new (window as any).bootstrap.Modal(modal);
      bsModal.show();
    }
  };

  const handleDelete = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    
    try {
      const response = await deleteRole(roleId);
      if (response.success) {
        fetchRoles();
      } else {
        alert(response.error || 'Failed to delete role');
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      alert('Failed to delete role');
    }
  };

  // Transform roles data for table
  const tableData = roles.map((role) => ({
    key: role.id,
    id: role.id,
    RoleName: role.name,
    Created: dayjs(role.createdAt).format('DD MMM YYYY, hh:mm A'),
    Description: role.description || '-',
    UserCount: role.userCount || 0,
    IsActive: role.isActive,
  }));

  const columns = [
    {
      title: "Role Name",
      dataIndex: "RoleName",
      render: (text: any, record: any) => (
        <div>
          <h6 className="fs-14 fw-medium mb-0">{text}</h6>
          {record.Description && record.Description !== '-' && (
            <span className="text-body fs-13">{record.Description}</span>
          )}
        </div>
      ),
      sorter: (a: any, b: any) => a.RoleName.localeCompare(b.RoleName),
    },
    {
      title: "Users",
      dataIndex: "UserCount",
      render: (count: number) => (
        <span className="badge badge-soft-info">{count} user(s)</span>
      ),
      sorter: (a: any, b: any) => a.UserCount - b.UserCount,
    },
    {
      title: "Created",
      dataIndex: "Created",
      sorter: (a: any, b: any) => a.Created.localeCompare(b.Created),
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
              onClick={(e) => {
                e.preventDefault();
                handleEdit(record.id);
              }}
            >
              <i className="ti ti-edit text-blue" /> Edit
            </Link>
            <Link 
              className="dropdown-item" 
              href={`${all_routes.permissions}?roleId=${record.id}`}
            >
              <i className="ti ti-shield" /> Permission
            </Link>
            <Link
              className="dropdown-item text-danger"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleDelete(record.id);
              }}
            >
              <i className="ti ti-trash" /> Delete
            </Link>
          </div>
        </div>
      ),
    },
  ];

  const handleSearch = (value: string) => {
    setSearchText(value);
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
            title="Roles & Permissions"
            badgeCount={totalRoles}
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
                data-bs-toggle="modal"
                data-bs-target="#add_role"
              >
                <i className="ti ti-square-rounded-plus-filled me-1" />
                Add New Role
              </Link>
            </div>
            <div className="card-body">
              {/* Contact List */}
              <div className="table-responsive custom-table">
                {loading ? (
                  <div className="text-center p-4">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <Datatable
                    columns={columns}
                    dataSource={tableData}
                    Selection={true}
                    searchText={searchText}
                  />
                )}
              </div>

              {/* /Contact List */}
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
      {/* Add Role Modal */}
      <div className="modal fade" id="add_role">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add New Role</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <div className="modal-body">
              <form id="addRoleForm">
                <div className="mb-3">
                  <label className="form-label">
                    Role Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="addRoleName"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    id="addRoleDescription"
                    rows={3}
                  />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-light"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={async () => {
                  const nameInput = document.getElementById('addRoleName') as HTMLInputElement;
                  const descInput = document.getElementById('addRoleDescription') as HTMLTextAreaElement;
                  
                  if (!nameInput?.value.trim()) {
                    alert('Role name is required');
                    return;
                  }

                  try {
                    const { createRole } = await import('@/core/services/roles.service');
                    const response = await createRole({
                      name: nameInput.value.trim(),
                      description: descInput?.value || undefined,
                      isActive: true,
                    });

                    console.log('Role creation response:', response);

                    if (response && response.success === true) {
                      // Success - close modal and refresh
                      try {
                        const modal = document.getElementById('add_role');
                        if (modal) {
                          const bsModal = (window as any).bootstrap?.Modal?.getInstance(modal);
                          if (bsModal) {
                            bsModal.hide();
                          } else {
                            // Fallback: create new modal instance and hide
                            const newModal = new (window as any).bootstrap.Modal(modal);
                            newModal.hide();
                          }
                        }
                      } catch (modalError) {
                        console.warn('Error closing modal:', modalError);
                        // Modal might already be closed, continue anyway
                      }

                      // Clear form
                      nameInput.value = '';
                      if (descInput) descInput.value = '';
                      
                      // Refresh the roles list
                      try {
                        await fetchRoles();
                      } catch (fetchError) {
                        console.warn('Error refreshing roles list:', fetchError);
                        // Still show success since role was created
                      }
                    } else {
                      // API returned an error response
                      const errorMsg = response?.error || 'Failed to create role';
                      console.error('Role creation failed:', errorMsg);
                      
                      // Check if error mentions timeout - if so, refresh and check
                      if (errorMsg.includes('timeout') || errorMsg.includes('may have been created')) {
                        // Refresh the list to see if role was created
                        await fetchRoles();
                        alert('Request may have timed out. Please check if the role was created in the list above.');
                      } else {
                        alert(errorMsg);
                      }
                    }
                  } catch (error) {
                    console.error('Error creating role:', error);
                    // Refresh list in case role was created despite error
                    try {
                      await fetchRoles();
                    } catch (fetchError) {
                      console.error('Error refreshing roles:', fetchError);
                    }
                    
                    // Check if the error message suggests the role might have been created
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    if (errorMessage.includes('timeout') || errorMessage.includes('may have been created') || errorMessage.includes('aborted')) {
                      alert('Request timed out, but the role may have been created. Please check the list above.');
                    } else {
                      alert('An error occurred. Please refresh the page to check if the role was created.');
                    }
                  }
                }}
              >
                Create Role
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Role Modal */}
      <div className="modal fade" id="edit_role">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Role</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <div className="modal-body">
              <form id="editRoleForm">
                <div className="mb-3">
                  <label className="form-label">
                    Role Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="editRoleName"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    id="editRoleDescription"
                    rows={3}
                  />
                </div>
                <div className="mb-3">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="editRoleIsActive"
                      defaultChecked
                    />
                    <label className="form-check-label" htmlFor="editRoleIsActive">
                      Active
                    </label>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-light"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={async () => {
                  if (!selectedRoleId) return;

                  const nameInput = document.getElementById('editRoleName') as HTMLInputElement;
                  const descInput = document.getElementById('editRoleDescription') as HTMLTextAreaElement;
                  const isActiveInput = document.getElementById('editRoleIsActive') as HTMLInputElement;
                  
                  if (!nameInput?.value.trim()) {
                    alert('Role name is required');
                    return;
                  }

                  try {
                    const { updateRole } = await import('@/core/services/roles.service');
                    const response = await updateRole(selectedRoleId, {
                      name: nameInput.value.trim(),
                      description: descInput?.value || undefined,
                      isActive: isActiveInput?.checked ?? true,
                    });

                    if (response.success) {
                      const modal = document.getElementById('edit_role');
                      if (modal) {
                        const bsModal = (window as any).bootstrap.Modal.getInstance(modal);
                        bsModal?.hide();
                      }
                      setSelectedRoleId(null);
                      fetchRoles();
                    } else {
                      alert(response.error || 'Failed to update role');
                    }
                  } catch (error) {
                    console.error('Error updating role:', error);
                    alert('Failed to update role');
                  }
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RolesPermissionsComponent;
