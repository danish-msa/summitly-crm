"use client";
/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import { all_routes } from "@/router/all_routes";
import Link from "next/link";
import {
  createPipeline,
  updatePipeline,
  Pipeline,
} from "@/core/services/pipelines.service";
import { PipelineStage } from "@/core/data/interface/pipeline.interface";

interface ModalPipelineProps {
  pipeline?: Pipeline | null;
  onSuccess?: () => void;
}

const ModalPipeline = ({ pipeline, onSuccess }: ModalPipelineProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Active' as 'Active' | 'Inactive',
    accessType: 'All' as 'All' | 'Selected',
  });
  const [stages, setStages] = useState<Array<{ name: string; order: number; color?: string }>>([]);
  const [accessUserIds, setAccessUserIds] = useState<string[]>([]);
  const [newStageName, setNewStageName] = useState('');
  const [editingStageIndex, setEditingStageIndex] = useState<number | null>(null);
  const [stageToDelete, setStageToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (pipeline) {
      setFormData({
        name: pipeline.name || '',
        description: pipeline.description || '',
        status: pipeline.status || 'Active',
        accessType: pipeline.accessType || 'All',
      });
      setStages(
        pipeline.stages?.map((s) => ({
          name: s.name,
          order: s.order,
          color: s.color,
        })) || []
      );
      setAccessUserIds(pipeline.accessUsers?.map((u) => u.userId) || []);
    } else {
      // Reset form for new pipeline
      setFormData({
        name: '',
        description: '',
        status: 'Active',
        accessType: 'All',
      });
      setStages([]);
      setAccessUserIds([]);
    }
  }, [pipeline]);

  // Helper function to close offcanvas
  const closeOffcanvas = (offcanvasId: string) => {
    const offcanvas = document.getElementById(offcanvasId);
    if (offcanvas) {
      const Bootstrap = (window as any).bootstrap;
      if (Bootstrap && Bootstrap.Offcanvas) {
        const bsOffcanvas = Bootstrap.Offcanvas.getInstance(offcanvas);
        if (bsOffcanvas) {
          bsOffcanvas.hide();
        } else {
          // Fallback: hide manually
          offcanvas.classList.remove('show');
          offcanvas.style.visibility = 'hidden';
          document.body.classList.remove('offcanvas-backdrop');
          const backdrop = document.querySelector('.offcanvas-backdrop');
          if (backdrop) {
            backdrop.remove();
          }
        }
      } else {
        // Fallback: hide manually
        offcanvas.classList.remove('show');
        offcanvas.style.visibility = 'hidden';
        document.body.classList.remove('offcanvas-backdrop');
        const backdrop = document.querySelector('.offcanvas-backdrop');
        if (backdrop) {
          backdrop.remove();
        }
      }
    }
  };

  // Helper function to close modal
  const closeModal = (modalId: string) => {
    const modal = document.getElementById(modalId);
    if (modal) {
      const Bootstrap = (window as any).bootstrap;
      if (Bootstrap && Bootstrap.Modal) {
        const bsModal = Bootstrap.Modal.getInstance(modal);
        if (bsModal) {
          bsModal.hide();
        } else {
          // Fallback: hide manually
          modal.classList.remove('show');
          modal.style.display = 'none';
          document.body.classList.remove('modal-open');
          const backdrop = document.querySelector('.modal-backdrop');
          if (backdrop) {
            backdrop.remove();
          }
        }
      } else {
        // Fallback: hide manually
        modal.classList.remove('show');
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
          backdrop.remove();
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Pipeline name is required');
      return;
    }

    if (stages.length === 0) {
      alert('Please add at least one pipeline stage');
      return;
    }

    setIsSubmitting(true);
    try {
      const pipelineData = {
        ...formData,
        stages: stages.map((s, index) => ({
          name: s.name,
          order: s.order !== undefined ? s.order : index,
          color: s.color,
        })),
        accessUserIds: formData.accessType === 'Selected' ? accessUserIds : [],
      };

      const response = pipeline
        ? await updatePipeline(pipeline.id, pipelineData)
        : await createPipeline(pipelineData);

      if (response.success) {
        // Close modal
        const offcanvasId = pipeline ? 'offcanvas_edit' : 'offcanvas_add';
        const offcanvas = document.getElementById(offcanvasId);
        if (offcanvas) {
          const bsOffcanvas = (window as any).bootstrap?.Offcanvas.getInstance(offcanvas);
          if (bsOffcanvas) {
            bsOffcanvas.hide();
          }
        }

        // Show success modal
        const successModal = document.getElementById('create_success');
        if (successModal) {
          const Bootstrap = (window as any).bootstrap;
          if (Bootstrap && Bootstrap.Modal) {
            let bsModal = Bootstrap.Modal.getInstance(successModal);
            if (!bsModal) {
              bsModal = new Bootstrap.Modal(successModal);
            }
            bsModal.show();
          } else {
            // Fallback: show modal manually
            successModal.classList.add('show');
            successModal.style.display = 'block';
            document.body.classList.add('modal-open');
            const backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop fade show';
            document.body.appendChild(backdrop);
          }
        }

        // Reset form
        if (!pipeline) {
          setFormData({
            name: '',
            description: '',
            status: 'Active',
            accessType: 'All',
          });
          setStages([]);
          setAccessUserIds([]);
        }

        if (onSuccess) {
          onSuccess();
        }
      } else {
        alert(response.error || 'Failed to save pipeline');
      }
    } catch (error: any) {
      console.error('Error saving pipeline:', error);
      alert('Failed to save pipeline. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddStage = () => {
    if (!newStageName.trim()) {
      alert('Stage name is required');
      return;
    }

    const newStage = {
      name: newStageName.trim(),
      order: stages.length,
      color: undefined,
    };

    setStages([...stages, newStage]);
    setNewStageName('');
    closeModal('add_stage');
  };

  const handleEditStage = (index: number) => {
    setEditingStageIndex(index);
    setNewStageName(stages[index].name);

    // Close edit stage modal if open
    const modal = document.getElementById('edit_stage');
    if (modal) {
      const bsModal = (window as any).bootstrap?.Modal.getInstance(modal);
      if (bsModal) {
        bsModal.hide();
      }
    }
  };

  const handleSaveStageEdit = () => {
    if (editingStageIndex === null || !newStageName.trim()) {
      return;
    }

    const updatedStages = [...stages];
    updatedStages[editingStageIndex] = {
      ...updatedStages[editingStageIndex],
      name: newStageName.trim(),
    };

    setStages(updatedStages);
    setEditingStageIndex(null);
    setNewStageName('');
  };

  const handleDeleteStage = () => {
    if (stageToDelete === null) return;

    const updatedStages = stages.filter((_, index) => index !== stageToDelete);
    // Reorder stages
    const reorderedStages = updatedStages.map((stage, index) => ({
      ...stage,
      order: index,
    }));
    setStages(reorderedStages);
    setStageToDelete(null);
    closeModal('delete_stage');
  };

  const handleRemoveAccessUser = (userId: string) => {
    setAccessUserIds(accessUserIds.filter((id) => id !== userId));
  };

  // Mock users - in real app, fetch from user service
  const mockUsers = [
    { id: '1', name: 'Vaughan Lewis', email: 'vaughan@example.com' },
    { id: '2', name: 'Katherine Brooks', email: 'katherine@example.com' },
  ];

  const availableUsers = mockUsers.filter(
    (user) => !accessUserIds.includes(user.id)
  );

  const selectedUsers = mockUsers.filter((user) =>
    accessUserIds.includes(user.id)
  );

  return (
    <>
      {/* Add New Pipeline */}
      <div
        className="offcanvas offcanvas-end offcanvas-large"
        tabIndex={-1}
        id="offcanvas_add"
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="mb-0">Add New Pipeline</h5>
          <button
            type="button"
            className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
          <form onSubmit={handleSubmit}>
            <div>
              <div className="mb-3">
                <label className="form-label">
                  Pipeline Name <span className="text-danger">*</span>
                </label>
                <input
                  className="form-control"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Sales Pipeline, Marketing Pipeline"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe this pipeline..."
                />
              </div>
              <div className="mb-3">
                <div className="pipe-title d-flex align-items-center justify-content-between mb-2">
                  <label className="form-label m-0">Pipeline Stages</label>
                  <Link
                    href="#"
                    className="add-stage link-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#add_stage"
                  >
                    <i className="ti ti-plus me-1" />
                    Add New
                  </Link>
                </div>
                <div className="pipeline-listing">
                  {stages.length === 0 ? (
                    <p className="text-muted">No stages added yet. Click "Add New" to add stages.</p>
                  ) : (
                    stages.map((stage, index) => (
                      <div
                        key={index}
                        className="pipeline-item d-flex align-items-center justify-content-between p-2 shadow-sm bg-white mb-1 border-start border-3 border-warning"
                      >
                        <p className="mb-0 fw-semibold me-3 text-dark">
                          <i className="ti ti-grip-vertical text-body" /> {stage.name}
                        </p>
                        <div className="action-pipeline">
                          <Link
                            href="#"
                            className="btn btn-sm btn-outline-light border-0"
                            onClick={(e) => {
                              e.preventDefault();
                              handleEditStage(index);
                              const modal = document.getElementById('edit_stage');
                              if (modal) {
                                const Bootstrap = (window as any).bootstrap;
                                if (Bootstrap && Bootstrap.Modal) {
                                  let bsModal = Bootstrap.Modal.getInstance(modal);
                                  if (!bsModal) {
                                    bsModal = new Bootstrap.Modal(modal);
                                  }
                                  bsModal.show();
                                } else {
                                  // Fallback: show modal manually
                                  modal.classList.add('show');
                                  modal.style.display = 'block';
                                  document.body.classList.add('modal-open');
                                  const backdrop = document.createElement('div');
                                  backdrop.className = 'modal-backdrop fade show';
                                  document.body.appendChild(backdrop);
                                }
                              }
                            }}
                          >
                            <i className="ti ti-edit me-1" />
                            Edit
                          </Link>
                          <Link
                            href="#"
                            className="btn btn-sm btn-outline-light border-0"
                            onClick={(e) => {
                              e.preventDefault();
                              setStageToDelete(index);
                              const modal = document.getElementById('delete_stage');
                              if (modal) {
                                const Bootstrap = (window as any).bootstrap;
                                if (Bootstrap && Bootstrap.Modal) {
                                  let bsModal = Bootstrap.Modal.getInstance(modal);
                                  if (!bsModal) {
                                    bsModal = new Bootstrap.Modal(modal);
                                  }
                                  bsModal.show();
                                } else {
                                  // Fallback: show modal manually
                                  modal.classList.add('show');
                                  modal.style.display = 'block';
                                  document.body.classList.add('modal-open');
                                  const backdrop = document.createElement('div');
                                  backdrop.className = 'modal-backdrop fade show';
                                  document.body.appendChild(backdrop);
                                }
                              }
                            }}
                          >
                            <i className="ti ti-trash me-1" />
                            Delete
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Access</label>
                <div className="d-flex flex-wrap access-item nav mb-3">
                  <div
                    className="radio-btn me-2"
                    data-bs-toggle="tab"
                    data-bs-target="#all"
                  >
                    <input
                      type="radio"
                      className="status-radio"
                      id="all"
                      name="access"
                      checked={formData.accessType === 'All'}
                      onChange={() => setFormData({ ...formData, accessType: 'All' })}
                    />
                    <label htmlFor="all">All</label>
                  </div>
                  <div
                    className="radio-btn"
                    data-bs-toggle="tab"
                    data-bs-target="#select-person"
                  >
                    <input
                      type="radio"
                      className="status-radio"
                      id="select"
                      name="access"
                      checked={formData.accessType === 'Selected'}
                      onChange={() => setFormData({ ...formData, accessType: 'Selected' })}
                    />
                    <label htmlFor="select">Select Person</label>
                  </div>
                </div>
                <div className="tab-content">
                  <div
                    className={`tab-pane fade ${formData.accessType === 'Selected' ? 'show active' : ''}`}
                    id="select-person"
                  >
                    {formData.accessType === 'Selected' && (
                      <div className="access-wrapper">
                        {selectedUsers.map((user) => (
                          <div
                            key={user.id}
                            className="d-flex align-items-center mb-1 justify-content-between shadow-sm rounded p-2 bg-white border"
                          >
                            <div className="d-flex align-items-center gap-2">
                              <div className="avatar avatar-sm">
                                <span className="avatar-inner bg-primary">
                                  <i className="ti ti-user fs-14" />
                                </span>
                              </div>
                              <span>{user.name}</span>
                            </div>
                            <Link
                              href="#"
                              className="link-primary"
                              onClick={(e) => {
                                e.preventDefault();
                                handleRemoveAccessUser(user.id);
                              }}
                            >
                              Remove
                            </Link>
                          </div>
                        ))}
                        {selectedUsers.length === 0 && (
                          <p className="text-muted">No users selected</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="d-flex align-items-center justify-content-end">
              <button
                type="button"
                data-bs-dismiss="offcanvas"
                className="btn btn-light me-2"
                onClick={() => closeOffcanvas('offcanvas_add')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create New'}
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* /Add New Pipeline */}

      {/* Edit Pipeline */}
      <div
        className="offcanvas offcanvas-end offcanvas-large"
        tabIndex={-1}
        id="offcanvas_edit"
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="mb-0">Edit Pipeline</h5>
          <button
            type="button"
            className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
            onClick={() => closeOffcanvas('offcanvas_edit')}
          ></button>
        </div>
        <div className="offcanvas-body">
          <form onSubmit={handleSubmit}>
            <div>
              <div className="mb-3">
                <label className="form-label">
                  Pipeline Name <span className="text-danger">*</span>
                </label>
                <input
                  className="form-control"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="mb-3">
                <div className="pipe-title d-flex align-items-center justify-content-between mb-2">
                  <label className="form-label m-0">Pipeline Stages</label>
                  <Link
                    href="#"
                    className="add-stage link-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#add_stage"
                  >
                    <i className="ti ti-plus me-1" />
                    Add New
                  </Link>
                </div>
                <div className="pipeline-listing">
                  {stages.length === 0 ? (
                    <p className="text-muted">No stages added yet.</p>
                  ) : (
                    stages.map((stage, index) => (
                      <div
                        key={index}
                        className="pipeline-item d-flex align-items-center justify-content-between p-2 shadow-sm bg-white mb-1 border-start border-3 border-warning"
                      >
                        <p className="mb-0 fw-semibold me-3 text-dark">
                          <i className="ti ti-grip-vertical text-body" /> {stage.name}
                        </p>
                        <div className="action-pipeline">
                          <Link
                            href="#"
                            className="btn btn-sm btn-outline-light border-0"
                            onClick={(e) => {
                              e.preventDefault();
                              handleEditStage(index);
                              const modal = document.getElementById('edit_stage');
                              if (modal) {
                                const Bootstrap = (window as any).bootstrap;
                                if (Bootstrap && Bootstrap.Modal) {
                                  let bsModal = Bootstrap.Modal.getInstance(modal);
                                  if (!bsModal) {
                                    bsModal = new Bootstrap.Modal(modal);
                                  }
                                  bsModal.show();
                                } else {
                                  // Fallback: show modal manually
                                  modal.classList.add('show');
                                  modal.style.display = 'block';
                                  document.body.classList.add('modal-open');
                                  const backdrop = document.createElement('div');
                                  backdrop.className = 'modal-backdrop fade show';
                                  document.body.appendChild(backdrop);
                                }
                              }
                            }}
                          >
                            <i className="ti ti-edit me-1" />
                            Edit
                          </Link>
                          <Link
                            href="#"
                            className="btn btn-sm btn-outline-light border-0"
                            onClick={(e) => {
                              e.preventDefault();
                              setStageToDelete(index);
                              const modal = document.getElementById('delete_stage');
                              if (modal) {
                                const Bootstrap = (window as any).bootstrap;
                                if (Bootstrap && Bootstrap.Modal) {
                                  let bsModal = Bootstrap.Modal.getInstance(modal);
                                  if (!bsModal) {
                                    bsModal = new Bootstrap.Modal(modal);
                                  }
                                  bsModal.show();
                                } else {
                                  // Fallback: show modal manually
                                  modal.classList.add('show');
                                  modal.style.display = 'block';
                                  document.body.classList.add('modal-open');
                                  const backdrop = document.createElement('div');
                                  backdrop.className = 'modal-backdrop fade show';
                                  document.body.appendChild(backdrop);
                                }
                              }
                            }}
                          >
                            <i className="ti ti-trash me-1" />
                            Delete
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Access</label>
                <div className="d-flex flex-wrap access-item nav mb-3">
                  <div
                    className="radio-btn me-2"
                    data-bs-toggle="tab"
                    data-bs-target="#all2"
                  >
                    <input
                      type="radio"
                      className="status-radio"
                      id="all2"
                      name="access2"
                      checked={formData.accessType === 'All'}
                      onChange={() => setFormData({ ...formData, accessType: 'All' })}
                    />
                    <label htmlFor="all2">All</label>
                  </div>
                  <div
                    className="radio-btn"
                    data-bs-toggle="tab"
                    data-bs-target="#select-person2"
                  >
                    <input
                      type="radio"
                      className="status-radio"
                      id="select2"
                      name="access2"
                      checked={formData.accessType === 'Selected'}
                      onChange={() => setFormData({ ...formData, accessType: 'Selected' })}
                    />
                    <label htmlFor="select2">Select Person</label>
                  </div>
                </div>
                <div className="tab-content">
                  <div
                    className={`tab-pane fade ${formData.accessType === 'Selected' ? 'show active' : ''}`}
                    id="select-person2"
                  >
                    {formData.accessType === 'Selected' && (
                      <div className="access-wrapper">
                        {selectedUsers.map((user) => (
                          <div
                            key={user.id}
                            className="d-flex align-items-center mb-1 justify-content-between shadow-sm rounded p-2 bg-white border"
                          >
                            <div className="d-flex align-items-center gap-2">
                              <div className="avatar avatar-sm">
                                <span className="avatar-inner bg-primary">
                                  <i className="ti ti-user fs-14" />
                                </span>
                              </div>
                              <span>{user.name}</span>
                            </div>
                            <Link
                              href="#"
                              className="link-primary"
                              onClick={(e) => {
                                e.preventDefault();
                                handleRemoveAccessUser(user.id);
                              }}
                            >
                              Remove
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="d-flex align-items-center justify-content-end">
              <button
                type="button"
                data-bs-dismiss="offcanvas"
                className="btn btn-light me-2"
                onClick={() => closeOffcanvas('offcanvas_edit')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* /Edit Pipeline */}

      {/* Add New Stage */}
      <div className="modal custom-modal fade" id="add_stage" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title mb-0">Add New Stage</h5>
              <button
                className="btn-close custom-btn-close border p-1 me-0 text-dark"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={() => closeModal('add_stage')}
              ></button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddStage();
              }}
            >
              <div className="modal-body">
                <div className="mb-0">
                  <label className="form-label">
                    Stage Name<span className="ms-1 text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={newStageName}
                    onChange={(e) => setNewStageName(e.target.value)}
                    placeholder="e.g., Lead, Qualified, Proposal"
                  />
                </div>
              </div>
              <div className="modal-btn text-end p-3 border-top">
                <Link
                  href="#"
                  className="btn btn-light me-2"
                  data-bs-dismiss="modal"
                  onClick={(e) => {
                    e.preventDefault();
                    closeModal('add_stage');
                  }}
                >
                  Cancel
                </Link>
                <button type="submit" className="btn btn-danger">
                  Create New
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Add New Stage */}

      {/* Edit Stage */}
      <div className="modal custom-modal fade" id="edit_stage" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title mb-0">Edit Stage</h5>
              <button
                className="btn-close custom-btn-close border p-1 me-0 text-dark"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={() => closeModal('edit_stage')}
              ></button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveStageEdit();
                closeModal('edit_stage');
              }}
            >
              <div className="modal-body">
                <div className="mb-0">
                  <label className="form-label">
                    Edit Stage<span className="ms-1 text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={newStageName}
                    onChange={(e) => setNewStageName(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-btn text-end p-3 border-top">
                <Link
                  href="#"
                  className="btn btn-light me-2"
                  data-bs-dismiss="modal"
                  onClick={(e) => {
                    e.preventDefault();
                    closeModal('edit_stage');
                  }}
                >
                  Cancel
                </Link>
                <button type="submit" className="btn btn-danger">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Edit Stage */}

      {/* Delete Stage */}
      <div className="modal fade" id="delete_stage">
        <div className="modal-dialog modal-dialog-centered modal-sm rounded-0">
          <div className="modal-content rounded-0">
            <div className="modal-body p-4 text-center position-relative">
              <div className="mb-3 position-relative z-1">
                <span className="avatar avatar-xl badge-soft-danger border-0 text-danger rounded-circle">
                  <i className="ti ti-trash fs-24" />
                </span>
              </div>
              <h5 className="mb-1">Remove Stage</h5>
              <p className="mb-3">
                Are you sure you want to remove the selected stage?
              </p>
              <div className="d-flex justify-content-center">
                <Link
                  href="#"
                  className="btn btn-light position-relative z-1 me-2 w-100"
                  data-bs-dismiss="modal"
                  onClick={(e) => {
                    e.preventDefault();
                    closeModal('delete_stage');
                  }}
                >
                  Cancel
                </Link>
                <Link
                  href="#"
                  className="btn btn-primary position-relative z-1 w-100"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDeleteStage();
                  }}
                >
                  Yes, Delete
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Delete Stage */}

      {/* Success Modal */}
      <div className="modal fade" id="create_success">
        <div className="modal-dialog modal-dialog-centered modal-sm rounded-0">
          <div className="modal-content rounded-0">
            <div className="modal-body p-4 text-center position-relative">
              <div className="mb-3 position-relative z-1">
                <span className="avatar avatar-xl badge-soft-success border-0 text-success rounded-circle">
                  <i className="ti ti-timeline-event-exclamation fs-24" />
                </span>
              </div>
              <h5 className="mb-1">Pipeline {pipeline ? 'Updated' : 'Created'} Successfully!!!</h5>
              <p className="mb-3">View the details of the pipeline</p>
              <div className="d-flex justify-content-center">
                <Link
                  href="#"
                  className="btn btn-light position-relative z-1 me-2 w-100"
                  data-bs-dismiss="modal"
                  onClick={(e) => {
                    e.preventDefault();
                    closeModal('create_success');
                  }}
                >
                  Cancel
                </Link>
                <Link
                  href={all_routes.pipeline}
                  className="btn btn-primary position-relative z-1 w-100"
                  onClick={(e) => {
                    e.preventDefault();
                    closeModal('create_success');
                  }}
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Success Modal */}
    </>
  );
};

export default ModalPipeline;
