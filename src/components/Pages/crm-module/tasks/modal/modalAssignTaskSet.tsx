"use client";
import { useState, useEffect } from "react";
import { assignTaskSetToAgent } from "@/core/services/tasks.service";
import { getAgents, AgentsResponse } from "@/core/services/agents.service";
import { Agent } from "@/core/data/interface/agent.interface";
import CommonSelect from "@/core/common/common-select/commonSelect";

interface ModalAssignTaskSetProps {
  taskSetId: string;
  taskSetName: string;
  onSuccess?: () => void;
}

const ModalAssignTaskSet = ({ taskSetId, taskSetName, onSuccess }: ModalAssignTaskSetProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response: AgentsResponse = await getAgents({ limit: 1000 });
      if (response.success && response.data) {
        setAgents(response.data);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAgentId) {
      alert('Please select an agent');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await assignTaskSetToAgent(taskSetId, {
        taskSetId: taskSetId,
        agentId: selectedAgentId,
      });

      if (response.success) {
        // Close modal
        const offcanvas = document.getElementById(`offcanvas_assign_task_set_${taskSetId}`);
        if (offcanvas) {
          const bsOffcanvas = (window as any).bootstrap?.Offcanvas.getInstance(offcanvas);
          if (bsOffcanvas) {
            bsOffcanvas.hide();
          }
        }
        
        // Reset form
        setSelectedAgentId('');
        
        alert(`Successfully assigned "${taskSetName}" to agent!`);
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        alert(response.error || 'Failed to assign task set');
      }
    } catch (error: any) {
      console.error('Error assigning task set:', error);
      alert('Failed to assign task set. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const agentOptions = agents.map(agent => ({
    value: agent.id,
    label: `${agent.firstName} ${agent.lastName}${agent.email ? ` (${agent.email})` : ''}`,
  }));

  return (
    <>
      {/* Assign Task Set Modal */}
      <div
        className="offcanvas offcanvas-end"
        tabIndex={-1}
        id={`offcanvas_assign_task_set_${taskSetId}`}
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="mb-0">Assign Task Set to Agent</h5>
          <button
            type="button"
            className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
          <div className="alert alert-info mb-3">
            <i className="ti ti-info-circle me-2" />
            Assigning <strong>"{taskSetName}"</strong> will create tasks for all templates in this set.
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">
                Select Agent <span className="text-danger">*</span>
              </label>
              <CommonSelect
                options={agentOptions}
                className="select"
                placeholder="Choose an agent..."
                onChange={(value) => setSelectedAgentId(value?.value || '')}
              />
            </div>

            <div className="d-flex align-items-center justify-content-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-outline-light"
                data-bs-dismiss="offcanvas"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || !selectedAgentId}
              >
                {isSubmitting ? 'Assigning...' : 'Assign Task Set'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ModalAssignTaskSet;
