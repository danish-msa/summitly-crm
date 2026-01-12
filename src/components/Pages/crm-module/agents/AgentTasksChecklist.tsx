"use client";
import { useState, useEffect } from "react";
import { getAgentTasks, toggleTaskCompletion, Task } from "@/core/services/tasks.service";
import { TaskResponse } from "@/core/data/interface/task.interface";

interface AgentTasksChecklistProps {
  agentId: string;
}

const AgentTasksChecklist = ({ agentId }: AgentTasksChecklistProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (agentId) {
      fetchTasks();
    }
  }, [agentId]);

  const fetchTasks = async () => {
    if (!agentId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response: TaskResponse = await getAgentTasks(agentId);
      if (response.success && response.data) {
        const tasksData = Array.isArray(response.data) ? response.data : [response.data];
        setTasks(tasksData);
      } else {
        setError(response.error || 'Failed to fetch tasks');
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    try {
      const response = await toggleTaskCompletion(taskId, !currentStatus);
      if (response.success) {
        // Update local state
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  isCompleted: !currentStatus,
                  completedAt: !currentStatus ? new Date().toISOString() : undefined,
                }
              : task
          )
        );
      } else {
        alert(response.error || 'Failed to update task');
      }
    } catch (err: any) {
      alert(err.message || 'Error updating task');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'danger';
      case 'High':
        return 'warning';
      case 'Medium':
        return 'info';
      case 'Low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'In Progress':
        return 'info';
      case 'Pending':
        return 'warning';
      case 'Cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const totalCount = tasks.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Separate tasks into completed and pending
  const pendingTasks = tasks.filter((t) => !t.isCompleted);
  const completedTasks = tasks.filter((t) => t.isCompleted);

  if (loading) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading tasks...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="alert alert-danger mb-0">
            <i className="ti ti-alert-circle me-2" />
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header d-flex align-items-center justify-content-between">
        <h6 className="mb-0 fw-semibold">
          <i className="ti ti-checklist me-2" />
          Tasks Checklist
        </h6>
        <span className="badge badge-soft-primary">
          {completedCount}/{totalCount}
        </span>
      </div>
      <div className="card-body">
        {/* Progress Bar */}
        {totalCount > 0 && (
          <div className="mb-4">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small">Progress</span>
              <span className="text-muted small fw-semibold">{completionPercentage}%</span>
            </div>
            <div className="progress" style={{ height: '8px' }}>
              <div
                className="progress-bar bg-primary"
                role="progressbar"
                style={{ width: `${completionPercentage}%` }}
                aria-valuenow={completionPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        )}

        {/* Tasks List */}
        {totalCount === 0 ? (
          <div className="text-center py-4">
            <i className="ti ti-checklist fs-48 text-muted mb-3 d-block" />
            <p className="text-muted mb-0">No tasks assigned to this agent yet.</p>
          </div>
        ) : (
          <div className="task-list">
            {/* Pending Tasks */}
            {pendingTasks.length > 0 && (
              <div className="mb-4">
                <h6 className="mb-3 fw-semibold text-muted small text-uppercase">
                  Pending Tasks ({pendingTasks.length})
                </h6>
                {pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="d-flex align-items-start mb-3 p-3 border rounded bg-light"
                  >
                    <div className="form-check form-check-md me-3 mt-1">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={task.isCompleted}
                        onChange={() => handleToggleTask(task.id, task.isCompleted)}
                        id={`task-${task.id}`}
                      />
                    </div>
                    <div className="flex-grow-1">
                      <label
                        htmlFor={`task-${task.id}`}
                        className="form-check-label fw-semibold mb-1 cursor-pointer"
                        style={{ cursor: 'pointer' }}
                      >
                        {task.title}
                      </label>
                      {task.description && (
                        <p className="text-muted small mb-2">{task.description}</p>
                      )}
                      <div className="d-flex align-items-center flex-wrap gap-2">
                        {task.category && (
                          <span className="badge badge-soft-secondary small">
                            {task.category}
                          </span>
                        )}
                        {task.priority && (
                          <span className={`badge badge-soft-${getPriorityColor(task.priority)} small`}>
                            {task.priority}
                          </span>
                        )}
                        {task.status && (
                          <span className={`badge badge-soft-${getStatusColor(task.status)} small`}>
                            {task.status}
                          </span>
                        )}
                        {task.dueDate && (
                          <span className="text-muted small">
                            <i className="ti ti-calendar me-1" />
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div>
                <h6 className="mb-3 fw-semibold text-muted small text-uppercase">
                  Completed Tasks ({completedTasks.length})
                </h6>
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="d-flex align-items-start mb-3 p-3 border rounded bg-light opacity-75"
                  >
                    <div className="form-check form-check-md me-3 mt-1">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={task.isCompleted}
                        onChange={() => handleToggleTask(task.id, task.isCompleted)}
                        id={`task-${task.id}`}
                      />
                    </div>
                    <div className="flex-grow-1">
                      <label
                        htmlFor={`task-${task.id}`}
                        className="form-check-label fw-semibold mb-1 text-decoration-line-through cursor-pointer"
                        style={{ cursor: 'pointer' }}
                      >
                        {task.title}
                      </label>
                      {task.description && (
                        <p className="text-muted small mb-2">{task.description}</p>
                      )}
                      <div className="d-flex align-items-center flex-wrap gap-2">
                        {task.category && (
                          <span className="badge badge-soft-secondary small">
                            {task.category}
                          </span>
                        )}
                        {task.completedAt && (
                          <span className="text-muted small">
                            <i className="ti ti-check me-1" />
                            Completed: {new Date(task.completedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentTasksChecklist;
