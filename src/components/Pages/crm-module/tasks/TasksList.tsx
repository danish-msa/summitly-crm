"use client";
import { useState, useEffect } from "react";
import { getTasks, toggleTaskCompletion, deleteTask } from "@/core/services/tasks.service";
import { Task, TaskResponse } from "@/core/data/interface/task.interface";
import ImageWithBasePath from "@/core/common/imageWithBasePath";
import Link from "next/link";
import { all_routes } from "@/router/all_routes";

interface TasksListProps {
  searchQuery?: string;
  statusFilter?: string;
  isCompletedFilter?: boolean;
  refreshKey?: number;
}

const TasksList = ({ searchQuery = "", statusFilter, isCompletedFilter, refreshKey = 0 }: TasksListProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, [searchQuery, statusFilter, isCompletedFilter, refreshKey]);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response: TaskResponse = await getTasks({
        search: searchQuery || undefined,
        status: statusFilter || undefined,
        isCompleted: isCompletedFilter,
      });
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

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const response = await deleteTask(taskId);
      if (response.success) {
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      } else {
        alert(response.error || 'Failed to delete task');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting task');
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

  const getBorderColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'border-success';
      case 'In Progress':
        return 'border-info';
      case 'Pending':
        return 'border-warning';
      case 'Cancelled':
        return 'border-danger';
      default:
        return 'border-info';
    }
  };

  // Group tasks by date
  const groupTasksByDate = (tasks: Task[]) => {
    const groups: { [key: string]: Task[] } = {};
    
    tasks.forEach((task) => {
      const date = task.createdAt 
        ? new Date(task.createdAt).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })
        : 'No Date';
      
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(task);
    });

    return groups;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading tasks...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <i className="ti ti-alert-circle me-2" />
        {error}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="ti ti-checklist fs-48 text-muted mb-3 d-block" />
        <p className="text-muted mb-0">No tasks found.</p>
      </div>
    );
  }

  const groupedTasks = groupTasksByDate(tasks);
  const dates = Object.keys(groupedTasks).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  return (
    <div>
      {dates.map((date, dateIndex) => (
        <div key={date} className="task-wrap border-bottom mb-3">
          <Link
            href="#"
            className="d-flex align-items-center justify-content-between mb-3"
            data-bs-toggle="collapse"
            data-bs-target={`#task_${dateIndex}`}
          >
            <h6 className="fs-16 mb-0">
              {date}
              <span className="badge badge-avatar text-dark bg-soft-dark rounded-circle ms-2 fw-medium">
                {groupedTasks[date].length}
              </span>
            </h6>
            <i className="ti ti-chevron-up arrow-rotate" />
          </Link>
          <div className="collapse show" id={`task_${dateIndex}`}>
            {groupedTasks[date].map((task) => (
              <div
                key={task.id}
                className={`card rounded-start-0 mb-3 border-start border-3 ${getBorderColor(task.status || 'Pending')}`}
              >
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                    <div className="d-flex align-items-center flex-wrap row-gap-2">
                      <span className="me-3">
                        <i className="ti ti-grip-vertical" />
                      </span>
                      <div className="form-check form-check-md me-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={task.isCompleted}
                          onChange={() => handleToggleTask(task.id, task.isCompleted)}
                        />
                      </div>
                      <h6 className={`fw-semibold mb-0 fs-14 me-3 ${task.isCompleted ? 'text-decoration-line-through' : ''}`}>
                        {task.title}
                      </h6>
                      {task.category && (
                        <span className={`badge badge-soft-${getPriorityColor(task.priority || 'Medium')} border-0 me-2`}>
                          <i className="ti ti-subtask me-1" />
                          {task.category}
                        </span>
                      )}
                      {task.status && (
                        <span className={`badge badge-soft-${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      )}
                    </div>
                    <div className="d-flex align-items-center flex-wrap row-gap-2">
                      {task.priority && (
                        <div className="me-2">
                          <span className={`badge badge-soft-${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                      )}
                      {task.dueDate && (
                        <div className="me-2">
                          <i className="ti ti-calendar-exclamation me-1" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      )}
                      {task.agent && (
                        <div 
                          className="avatar avatar-xs avatar-rounded me-2"
                          title={`${task.agent.firstName} ${task.agent.lastName}`}
                        >
                          <ImageWithBasePath
                            src="assets/img/profiles/avatar-14.jpg"
                            alt={`${task.agent.firstName} ${task.agent.lastName}`}
                          />
                        </div>
                      )}
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
                            href={`${all_routes.agentsDetails}?id=${task.agentId}`}
                          >
                            <i className="ti ti-user text-blue" /> View Agent
                          </Link>
                          <Link
                            className="dropdown-item"
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeleteTask(task.id);
                            }}
                          >
                            <i className="ti ti-trash" /> Delete
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  {task.description && (
                    <p className="text-muted small mt-2 mb-0">{task.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TasksList;
