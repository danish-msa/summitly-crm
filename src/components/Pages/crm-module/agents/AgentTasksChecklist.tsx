"use client";
import { useState, useEffect } from "react";
import { getAgentTasks, toggleTaskCompletion, Task } from "@/core/services/tasks.service";
import { TaskResponse } from "@/core/data/interface/task.interface";

interface AgentTasksChecklistProps {
  agentId: string;
}

interface OnboardingStageData {
  agentId: string;
  agent: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  pipeline: {
    id: string;
    name: string;
    description: string | null;
    stages?: Array<{
      id: string;
      name: string;
      order: number;
      color: string | null;
    }>;
  } | null;
  currentStage: {
    id: string;
    name: string;
    order: number;
    color: string | null;
    taskSets: Array<{
      id: string;
      name: string;
      order: number;
      isRequired: boolean;
      defaultDueDays: number | null;
    }>;
  } | null;
  stageEnteredAt: string | null;
  stageCompletedAt: string | null;
  tasks: Array<{
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    isCompleted: boolean;
    dueDate: string | null;
    completedAt: string | null;
  }>;
  progress: {
    tasksTotal: number;
    tasksCompleted: number;
    tasksRemaining: number;
    stageComplete: boolean;
    currentStageIndex: number | null;
    totalStages: number;
  };
  onboardingStatus: string;
}

const AgentTasksChecklist = ({ agentId }: AgentTasksChecklistProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [onboardingData, setOnboardingData] = useState<OnboardingStageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completingStage, setCompletingStage] = useState(false);
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (agentId) {
      fetchData();
    }
  }, [agentId]);

  const fetchData = async () => {
    if (!agentId) return;
    
    setLoading(true);
    setError(null);
    try {
      // Fetch both tasks and onboarding data in parallel
      const [tasksResponse, onboardingResponse] = await Promise.all([
        getAgentTasks(agentId),
        fetch(`/api/onboarding/${agentId}/current-stage`).then(r => r.json())
      ]);

      // Handle tasks
      if (tasksResponse.success && tasksResponse.data) {
        const tasksData = Array.isArray(tasksResponse.data) ? tasksResponse.data : [tasksResponse.data];
        setTasks(tasksData);
      }

      // Handle onboarding data
      if (onboardingResponse.success && onboardingResponse.data) {
        setOnboardingData(onboardingResponse.data);
        // Auto-expand current stage
        if (onboardingResponse.data.currentStage?.id) {
          setExpandedStages(new Set([onboardingResponse.data.currentStage.id]));
        }
      } else if (!onboardingResponse.success && onboardingResponse.error?.includes('not found')) {
        // Agent not enrolled in pipeline - that's okay, just show tasks
        setOnboardingData(null);
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching data');
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
        // Refresh onboarding data to update progress
        if (onboardingData?.currentStage?.id) {
          const onboardingResponse = await fetch(`/api/onboarding/${agentId}/current-stage`).then(r => r.json());
          if (onboardingResponse.success) {
            setOnboardingData(onboardingResponse.data);
          }
        }
      } else {
        alert(response.error || 'Failed to update task');
      }
    } catch (err: any) {
      alert(err.message || 'Error updating task');
    }
  };

  const handleCompleteStage = async () => {
    if (!agentId || !onboardingData?.currentStage) return;
    
    if (!confirm(`Are you sure you want to complete "${onboardingData.currentStage.name}" and move to the next stage?`)) {
      return;
    }

    setCompletingStage(true);
    try {
      const response = await fetch(`/api/onboarding/${agentId}/complete-stage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvedBy: 'admin', // TODO: Get actual user ID
          moveToNextStage: true
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(`Stage "${onboardingData.currentStage.name}" completed successfully!`);
        // Refresh data
        await fetchData();
      } else {
        alert(data.error || 'Failed to complete stage');
      }
    } catch (err: any) {
      alert(err.message || 'Error completing stage');
    } finally {
      setCompletingStage(false);
    }
  };

  const toggleStageExpansion = (stageId: string) => {
    setExpandedStages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stageId)) {
        newSet.delete(stageId);
      } else {
        newSet.add(stageId);
      }
      return newSet;
    });
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

  // Group tasks by stage
  const tasksByStage = new Map<string, Task[]>();
  tasks.forEach((task) => {
    const stageId = (task as any).stageId || 'no-stage';
    if (!tasksByStage.has(stageId)) {
      tasksByStage.set(stageId, []);
    }
    tasksByStage.get(stageId)!.push(task);
  });

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const totalCount = tasks.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading tasks...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger mb-0">
        <i className="ti ti-alert-circle me-2" />
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Pipeline Onboarding Status */}
      {onboardingData?.pipeline && (
        <div className="card mb-4 border-primary">
          <div className="card-header bg-primary bg-opacity-10">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h6 className="mb-1 fw-semibold">
                  <i className="ti ti-route me-2" />
                  {onboardingData.pipeline.name}
                </h6>
                {onboardingData.currentStage && (
                  <p className="mb-0 text-muted small">
                    Current Stage: <span className="fw-semibold">{onboardingData.currentStage.name}</span>
                  </p>
                )}
              </div>
              <span className={`badge badge-soft-${onboardingData.progress.stageComplete ? 'success' : 'warning'}`}>
                {onboardingData.progress.stageComplete ? 'Stage Complete' : 'In Progress'}
              </span>
            </div>
          </div>
          <div className="card-body">
            {/* Pipeline Progress */}
            {onboardingData.progress.totalStages > 0 && (
              <div className="mb-3">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-muted small">Pipeline Progress</span>
                  <span className="text-muted small fw-semibold">
                    Stage {((onboardingData.progress.currentStageIndex ?? 0) + 1)} of {onboardingData.progress.totalStages}
                  </span>
                </div>
                <div className="progress" style={{ height: '10px' }}>
                  <div
                    className="progress-bar bg-primary"
                    role="progressbar"
                    style={{
                      width: `${((onboardingData.progress.currentStageIndex ?? 0) + 1) / onboardingData.progress.totalStages * 100}%`
                    }}
                  />
                </div>
              </div>
            )}

            {/* Current Stage Progress */}
            {onboardingData.currentStage && (
              <div className="mb-3">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-muted small">Current Stage Tasks</span>
                  <span className="text-muted small fw-semibold">
                    {onboardingData.progress.tasksCompleted}/{onboardingData.progress.tasksTotal} completed
                  </span>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div
                    className="progress-bar bg-success"
                    role="progressbar"
                    style={{
                      width: `${onboardingData.progress.tasksTotal > 0 
                        ? (onboardingData.progress.tasksCompleted / onboardingData.progress.tasksTotal * 100) 
                        : 0}%`
                    }}
                  />
                </div>
              </div>
            )}

            {/* Complete Stage Button */}
            {onboardingData.currentStage && onboardingData.progress.stageComplete && (
              <button
                className="btn btn-primary btn-sm"
                onClick={handleCompleteStage}
                disabled={completingStage}
              >
                {completingStage ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Completing...
                  </>
                ) : (
                  <>
                    <i className="ti ti-check me-2" />
                    Complete Stage & Move to Next
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Overall Tasks Progress */}
      {totalCount > 0 && (
        <div className="card mb-4">
          <div className="card-header d-flex align-items-center justify-content-between">
            <h6 className="mb-0 fw-semibold">
              <i className="ti ti-checklist me-2" />
              All Tasks
            </h6>
            <span className="badge badge-soft-primary">
              {completedCount}/{totalCount}
            </span>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted small">Overall Progress</span>
                <span className="text-muted small fw-semibold">{completionPercentage}%</span>
              </div>
              <div className="progress" style={{ height: '8px' }}>
                <div
                  className="progress-bar bg-primary"
                  role="progressbar"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tasks by Stage */}
      {onboardingData?.pipeline ? (
        <div className="card">
          <div className="card-header">
            <h6 className="mb-0 fw-semibold">
              <i className="ti ti-list me-2" />
              Tasks by Stage
            </h6>
          </div>
          <div className="card-body">
            {/* Show all pipeline stages */}
            {onboardingData.pipeline?.stages && onboardingData.pipeline.stages.length > 0 ? (
              onboardingData.pipeline.stages.map((stage) => {
                const stageTasks = tasks.filter((t: any) => (t as any).stageId === stage.id);
                const isCurrentStage = onboardingData.currentStage?.id === stage.id;
                const isExpanded = expandedStages.has(stage.id);
                const stageCompleted = stageTasks.length > 0 && stageTasks.every(t => t.isCompleted);
                const stageCompletedCount = stageTasks.filter(t => t.isCompleted).length;
                const stageOrder = stage.order ?? 0;
                const isPastStage = onboardingData.progress.currentStageIndex !== null && stageOrder < onboardingData.progress.currentStageIndex;

                return (
                  <div key={stage.id} className={`mb-4 ${isCurrentStage ? 'border-start border-primary border-3 ps-3' : ''}`}>
                    <div
                      className="d-flex align-items-center justify-content-between p-3 bg-light rounded cursor-pointer"
                      onClick={() => toggleStageExpansion(stage.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex align-items-center">
                        <i className={`ti ti-chevron-${isExpanded ? 'down' : 'right'} me-2`} />
                        <div>
                          <h6 className="mb-0 fw-semibold">
                            {stage.name}
                            {isCurrentStage && (
                              <span className="badge badge-soft-primary ms-2">Current</span>
                            )}
                          </h6>
                          <p className="mb-0 text-muted small">
                            {stageTasks.length > 0 
                              ? `${stageCompletedCount}/${stageTasks.length} tasks completed`
                              : 'No tasks assigned'}
                          </p>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        {isPastStage && (
                          <span className="badge badge-soft-success">
                            <i className="ti ti-check me-1" />
                            Completed
                          </span>
                        )}
                        {stageCompleted && stageTasks.length > 0 && !isPastStage && (
                          <span className="badge badge-soft-info">
                            <i className="ti ti-check me-1" />
                            All Tasks Done
                          </span>
                        )}
                      </div>
                    </div>

                  {isExpanded && (
                    <div className="mt-3">
                      {stageTasks.map((task) => (
                        <div
                          key={task.id}
                          className={`d-flex align-items-start mb-3 p-3 border rounded ${task.isCompleted ? 'bg-light opacity-75' : 'bg-white'}`}
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
                              className={`form-check-label fw-semibold mb-1 cursor-pointer ${task.isCompleted ? 'text-decoration-line-through' : ''}`}
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
                );
              })
            ) : (
              <div className="text-center py-3">
                <p className="text-muted mb-0">No stages found in pipeline.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Fallback: Show all tasks if no pipeline */
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
            {totalCount === 0 ? (
              <div className="text-center py-4">
                <i className="ti ti-checklist fs-48 text-muted mb-3 d-block" />
                <p className="text-muted mb-0">No tasks assigned to this agent yet.</p>
              </div>
            ) : (
              <div className="task-list">
                {tasks
                  .filter((t) => !t.isCompleted)
                  .map((task) => (
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
                {tasks
                  .filter((t) => t.isCompleted)
                  .map((task) => (
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
                        {task.completedAt && (
                          <span className="text-muted small">
                            <i className="ti ti-check me-1" />
                            Completed: {new Date(task.completedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentTasksChecklist;
