"use client";
import { useState, useEffect } from "react";
import { 
  createTaskSet, 
  updateTaskSet, 
  getTaskTemplates
} from "@/core/services/tasks.service";
import { TaskSet, TaskTemplate, TaskSetResponse, TaskTemplateResponse } from "@/core/data/interface/task.interface";
import MultipleSelect from "@/core/common/multiple-Select/multipleSelect";

interface ModalTaskSetProps {
  taskSet?: TaskSet | null;
  onSuccess?: () => void;
}

const ModalTaskSet = ({ taskSet, onSuccess }: ModalTaskSetProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    fetchTemplates();
    if (taskSet) {
      setFormData({
        name: taskSet.name || '',
        description: taskSet.description || '',
        category: taskSet.category || '',
        isActive: taskSet.isActive !== undefined ? taskSet.isActive : true,
        order: taskSet.order || 0,
      });
      setSelectedTemplateIds(taskSet.templates?.map(t => t.id) || []);
    }
  }, [taskSet]);

  const fetchTemplates = async () => {
    try {
      const response: TaskTemplateResponse = await getTaskTemplates({ isActive: true });
      if (response.success && response.data) {
        const templatesData = Array.isArray(response.data) ? response.data : [response.data];
        setTemplates(templatesData);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Task set name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const response: TaskSetResponse = taskSet
        ? await updateTaskSet(taskSet.id, {
            ...formData,
            templateIds: selectedTemplateIds,
          })
        : await createTaskSet({
            ...formData,
            templateIds: selectedTemplateIds,
          });

      if (response.success) {
        // Close modal
        const offcanvas = document.getElementById(taskSet ? `offcanvas_edit_task_set_${taskSet.id}` : 'offcanvas_add_task_set');
        if (offcanvas) {
          const bsOffcanvas = (window as any).bootstrap?.Offcanvas.getInstance(offcanvas);
          if (bsOffcanvas) {
            bsOffcanvas.hide();
          }
        }
        
        // Reset form
        setFormData({
          name: '',
          description: '',
          category: '',
          isActive: true,
          order: 0,
        });
        setSelectedTemplateIds([]);
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        alert(response.error || 'Failed to save task set');
      }
    } catch (error: any) {
      console.error('Error saving task set:', error);
      alert('Failed to save task set. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const templateOptions = templates.map(template => ({
    value: template.id,
    label: `${template.name}${template.category ? ` (${template.category})` : ''}`,
  }));

  return (
    <>
      {/* Add/Edit Task Set Modal */}
      <div
        className="offcanvas offcanvas-end"
        tabIndex={-1}
        id={taskSet ? `offcanvas_edit_task_set_${taskSet.id}` : 'offcanvas_add_task_set'}
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="mb-0">{taskSet ? 'Edit Task Set' : 'Create Task Set'}</h5>
          <button
            type="button"
            className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">
                Task Set Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Onboarding Set, Compliance Set"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this task set is for..."
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Category</label>
              <input
                type="text"
                className="form-control"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Onboarding, Compliance, Training"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                Select Tasks <span className="text-danger">*</span>
              </label>
              <MultipleSelect
                options={templateOptions}
                value={selectedTemplateIds}
                onChange={(value: string[]) => setSelectedTemplateIds(value)}
                placeholder="Select tasks to include in this set..."
              />
              <small className="text-muted">
                Select multiple task templates to include in this set. {selectedTemplateIds.length} selected.
              </small>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Display Order</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={formData.isActive ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
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
                disabled={isSubmitting || selectedTemplateIds.length === 0}
              >
                {isSubmitting ? 'Saving...' : taskSet ? 'Update Task Set' : 'Create Task Set'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ModalTaskSet;
