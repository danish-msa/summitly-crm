"use client";
import { useState, useEffect } from "react";
import { getTaskSets, deleteTaskSet, TaskSet } from "@/core/services/tasks.service";
import { TaskSetResponse } from "@/core/data/interface/task.interface";
import ModalTaskSet from "./modal/modalTaskSet";
import ModalAssignTaskSet from "./modal/modalAssignTaskSet";
import Link from "next/link";
import { all_routes } from "@/router/all_routes";

interface TaskSetsListProps {
  searchQuery?: string;
  refreshKey?: number;
}

const TaskSetsList = ({ searchQuery = "", refreshKey = 0 }: TaskSetsListProps) => {
  const [taskSets, setTaskSets] = useState<TaskSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTaskSets();
  }, [searchQuery, refreshKey]);

  const fetchTaskSets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response: TaskSetResponse = await getTaskSets({
        search: searchQuery || undefined,
        includeTemplates: true,
      });
      if (response.success && response.data) {
        const setsData = Array.isArray(response.data) ? response.data : [response.data];
        setTaskSets(setsData);
      } else {
        setError(response.error || 'Failed to fetch task sets');
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching task sets');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTaskSet = async (taskSetId: string, taskSetName: string) => {
    if (!confirm(`Are you sure you want to delete the task set "${taskSetName}"?`)) {
      return;
    }

    try {
      const response = await deleteTaskSet(taskSetId);
      if (response.success) {
        setTaskSets((prevSets) => prevSets.filter((set) => set.id !== taskSetId));
      } else {
        alert(response.error || 'Failed to delete task set');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting task set');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <i className="ti ti-alert-circle me-2" />
        {error}
      </div>
    );
  }

  if (taskSets.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="ti ti-folder-off fs-48 text-muted mb-3" />
        <p className="text-muted">No task sets found. Create your first task set to get started.</p>
      </div>
    );
  }

  const handleRefresh = () => {
    fetchTaskSets();
  };

  return (
    <>
      <div className="row">
        {taskSets.map((taskSet) => (
        <div key={taskSet.id} className="col-md-6 col-lg-4 mb-4">
          <div className="card h-100">
            <div className="card-header d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <span className="avatar avatar-md bg-primary me-2">
                  <i className="ti ti-folder fs-20" />
                </span>
                <div>
                  <h6 className="mb-0 fw-semibold">{taskSet.name}</h6>
                  {taskSet.category && (
                    <span className="badge badge-soft-info">{taskSet.category}</span>
                  )}
                </div>
              </div>
              <div className="dropdown">
                <Link
                  href="#"
                  className="action-icon btn btn-icon btn-sm btn-outline-light shadow"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="ti ti-dots-vertical" />
                </Link>
                <div className="dropdown-menu dropdown-menu-end">
                  <Link
                    href="#"
                    className="dropdown-item"
                    data-bs-toggle="offcanvas"
                    data-bs-target={`#offcanvas_edit_task_set_${taskSet.id}`}
                  >
                    <i className="ti ti-edit me-1" />
                    Edit
                  </Link>
                  <Link
                    href="#"
                    className="dropdown-item"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDeleteTaskSet(taskSet.id, taskSet.name);
                    }}
                  >
                    <i className="ti ti-trash me-1" />
                    Delete
                  </Link>
                </div>
              </div>
            </div>
            <div className="card-body">
              {taskSet.description && (
                <p className="text-muted small mb-3">{taskSet.description}</p>
              )}
              
              <div className="mb-3">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-muted small">Templates in Set:</span>
                  <span className="badge badge-soft-primary">
                    {taskSet.templates?.length || 0} tasks
                  </span>
                </div>
                
                {taskSet.templates && taskSet.templates.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {taskSet.templates.slice(0, 5).map((template) => (
                      <div key={template.id} className="list-group-item px-0 py-2 border-0">
                        <div className="d-flex align-items-center">
                          <i className="ti ti-checkbox text-success me-2" />
                          <span className="small">{template.name}</span>
                          {template.priority && (
                            <span className={`badge badge-soft-${template.priority === 'Urgent' ? 'danger' : template.priority === 'High' ? 'warning' : 'info'} ms-auto`}>
                              {template.priority}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {taskSet.templates.length > 5 && (
                      <div className="list-group-item px-0 py-2 border-0">
                        <span className="text-muted small">
                          +{taskSet.templates.length - 5} more tasks
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted small mb-0">No templates in this set</p>
                )}
              </div>

              <div className="d-flex align-items-center justify-content-between">
                <div>
                  {taskSet.isActive ? (
                    <span className="badge badge-soft-success">Active</span>
                  ) : (
                    <span className="badge badge-soft-secondary">Inactive</span>
                  )}
                </div>
                <Link
                  href="#"
                  className="btn btn-sm btn-primary"
                  data-bs-toggle="offcanvas"
                  data-bs-target={`#offcanvas_assign_task_set_${taskSet.id}`}
                >
                  <i className="ti ti-user-plus me-1" />
                  Assign to Agent
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}
      </div>
      
      {/* Modals for each task set */}
      {taskSets.map((taskSet) => (
        <div key={`modals-${taskSet.id}`}>
          <ModalTaskSet taskSet={taskSet} onSuccess={handleRefresh} />
          <ModalAssignTaskSet 
            taskSetId={taskSet.id} 
            taskSetName={taskSet.name}
            onSuccess={handleRefresh}
          />
        </div>
      ))}
    </>
  );
};

export default TaskSetsList;
