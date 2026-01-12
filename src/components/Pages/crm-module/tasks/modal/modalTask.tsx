"use client";
import { Category, Priority } from "../../../../../core/json/selectOption";

// Task-specific status options
const TaskStatus = [
  { value: "Pending", label: "Pending" },
  { value: "In Progress", label: "In Progress" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" },
];
import CommonSelect, { Option } from "@/core/common/common-select/commonSelect";
import ImageWithBasePath from "@/core/common/imageWithBasePath";
import { useState, useEffect } from "react";
import MultipleSelect from "@/core/common/multiple-Select/multipleSelect";
import CommonDatePicker from "@/core/common/common-datePicker/commonDatePicker";
import CommonTagInputs from "@/core/common/common-tagInput/commonTagInputs";
import Link from "next/link";
import { createTask } from "@/core/services/tasks.service";
import { getAgents } from "@/core/services/agents.service";
import { Agent } from "@/core/data/interface/agent.interface";

interface ModalTaskProps {
  onSuccess?: () => void;
}

const ModalTask = ({ onSuccess }: ModalTaskProps) => {
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "Medium",
    status: "Pending",
    dueDate: "",
    tags: [] as string[],
  });

  const [tags, setTags] = useState<string[]>([]);

  // Fetch agents on mount
  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoadingAgents(true);
    try {
      const response = await getAgents({ limit: 100 });
      if (response.success && response.data) {
        setAgents(response.data);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoadingAgents(false);
    }
  };

  const handleChange = (value: string[]) => {
    setSelectedAgentIds(value);
  };

  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags);
    setFormData({ ...formData, tags: newTags });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string) => (option: Option | null) => {
    const value = option?.value || "";
    // Skip "Select" placeholder
    if (value === "Select") return;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (date: any, field: "dueDate") => {
    // antd DatePicker returns a Dayjs object
    const dateString = date ? date.format("YYYY-MM-DD") : "";
    setFormData({ ...formData, [field]: dateString });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    if (!formData.title.trim()) {
      alert("Please enter a task title");
      setIsSubmitting(false);
      return;
    }

    // Validate agent selection
    if (selectedAgentIds.length === 0) {
      alert("Please select at least one agent");
      setIsSubmitting(false);
      return;
    }

    try {
      // Create task for the first selected agent (or you can create multiple tasks)
      const agentId = selectedAgentIds[0];
      
      const taskData = {
        title: formData.title,
        description: formData.description || undefined,
        category: formData.category || undefined,
        priority: (formData.priority !== "Select" ? formData.priority : "Medium") as "Low" | "Medium" | "High" | "Urgent",
        status: (formData.status !== "Select" ? formData.status : "Pending") as "Pending" | "In Progress" | "Completed" | "Cancelled",
        agentId: agentId,
        dueDate: formData.dueDate || undefined,
        tags: tags.length > 0 ? tags : undefined,
      };

      const response = await createTask(taskData);

      if (response.success) {
        // Reset form
        setFormData({
          title: "",
          description: "",
          category: "",
          priority: "Medium",
          status: "Pending",
          dueDate: "",
          tags: [],
        });
        setTags([]);
        setSelectedAgentIds([]);
        
        // Close modal
        const offcanvas = document.getElementById("offcanvas_add");
        if (offcanvas) {
          const bsOffcanvas = (window as any).bootstrap?.Offcanvas?.getInstance(offcanvas);
          if (bsOffcanvas) {
            bsOffcanvas.hide();
          }
        }

        // Refresh task list
        if (onSuccess) {
          onSuccess();
        }

        alert("Task created successfully!");
      } else {
        alert(response.error || "Failed to create task");
      }
    } catch (error: any) {
      console.error("Error creating task:", error);
      alert(error.message || "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Convert agents to MultipleSelect options format
  const agentOptions = agents.map((agent) => ({
    label: (
      <div className="d-flex align-items-center gap-2">
        <div
          style={{
            borderRadius: "50%",
            overflow: "hidden",
            width: 24,
            height: 24,
            backgroundColor: "#f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {agent.image ? (
            <ImageWithBasePath
              src={agent.image}
              alt={agent.firstName}
              width={24}
              height={24}
            />
          ) : (
            <span style={{ fontSize: "10px", color: "#666" }}>
              {agent.firstName?.[0]}{agent.lastName?.[0]}
            </span>
          )}
        </div>
        {agent.firstName} {agent.lastName}
      </div>
    ),
    value: agent.id,
  }));

  // Filter out "Select" from options and add Urgent
  const priorityOptions = [
    ...Priority.filter((opt) => opt.value !== "Select"),
    { value: "Urgent", label: "Urgent" },
  ];
  const statusOptions = TaskStatus;
  const categoryOptions = Category.filter((opt) => opt.value !== "Select");

  return (
    <>
      {/* Add task */}
      <div
        className="offcanvas offcanvas-end offcanvas-large"
        tabIndex={-1}
        id="offcanvas_add"
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="mb-0">Add New Task</h5>
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
              <div className="row">
                <div className="col-md-12">
                  <div className="mb-3">
                    <label className="form-label">
                      Title<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Category</label>
                    <CommonSelect
                      options={categoryOptions}
                      className="select"
                      defaultValue={categoryOptions[0]}
                      onChange={handleSelectChange("category")}
                    />
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="mb-3">
                    <label className="form-label">
                      Assign to Agent <span className="text-danger">*</span>
                    </label>
                    {loadingAgents ? (
                      <div className="text-muted">Loading agents...</div>
                    ) : (
                      <MultipleSelect
                        value={selectedAgentIds}
                        onChange={handleChange}
                        options={agentOptions}
                        placeholder="Select an agent"
                      />
                    )}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Due Date</label>
                    <div className="input-group w-auto input-group-flat">
                      <CommonDatePicker
                        placeholder="dd/mm/yyyy"
                        onChange={(date) => handleDateChange(date, "dueDate")}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Priority</label>
                    <CommonSelect
                      options={priorityOptions}
                      className="select"
                      defaultValue={priorityOptions.find((opt) => opt.value === "Medium") || priorityOptions[0]}
                      onChange={handleSelectChange("priority")}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <CommonSelect
                      options={statusOptions}
                      className="select"
                      defaultValue={statusOptions.find((opt) => opt.value === "Pending") || statusOptions[0]}
                      onChange={handleSelectChange("status")}
                    />
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="mb-3">
                    <label className="form-label">Tags</label>
                    <CommonTagInputs
                      initialTags={tags}
                      onTagsChange={handleTagsChange}
                    />
                    <span className="fs-13 mb-0">
                      Enter value separated by comma
                    </span>
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="d-flex align-items-center justify-content-end">
              <button
                type="button"
                data-bs-dismiss="offcanvas"
                className="btn btn-light me-2"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* /Add task */}
      {/* edit task */}
      <div
        className="offcanvas offcanvas-end offcanvas-large"
        tabIndex={-1}
        id="offcanvas_edit"
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="mb-0">Edit Task</h5>
          <button
            type="button"
            className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
          <form>
            <div>
              <div className="row">
                <div className="col-md-12">
                  <div className="mb-3">
                    <label className="form-label">
                      Title<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      defaultValue="Truelysell"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Category</label>
                    <CommonSelect
                      options={Category}
                      className="select"
                      defaultValue={Category[1]}
                    />
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="mb-3">
                    <label className="form-label">
                      Responsible Persons <span className="text-danger">*</span>
                    </label>
                    <MultipleSelect
                      value={selectedAgentIds}
                      onChange={handleChange}
                      options={agentOptions}
                      placeholder="Select"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      Start Date<span className="text-danger"> *</span>
                    </label>
                    <div className="input-group w-auto input-group-flat">
                      <CommonDatePicker placeholder="dd/mm/yyyy" />
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      Due Date <span className="text-danger">*</span>
                    </label>
                    <div className="input-group w-auto input-group-flat">
                      <CommonDatePicker placeholder="dd/mm/yyyy" />
                    </div>
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="mb-3">
                    <label className="form-label">Tags</label>
                    <CommonTagInputs
                      initialTags={tags}
                      onTagsChange={handleTagsChange}
                    />
                    <span className="fs-13 mb-0">
                      Enter value separated by comma
                    </span>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Priority</label>
                    <CommonSelect
                      options={Priority}
                      className="select"
                      defaultValue={Priority[1]}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <CommonSelect
                      options={TaskStatus}
                      className="select"
                      defaultValue={TaskStatus[0]}
                    />
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="mb-3">
                    <label className="form-label">
                      Description <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      rows={3}
                      defaultValue={
                        "Coordinate a product demo session with the client to walk them through key CRM features"
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="d-flex align-items-center justify-content-end">
              <button
                type="button"
                data-bs-dismiss="offcanvas"
                className="btn btn-light me-2"
              >
                Cancel
              </button>
              <button type="button" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* edit task */}
      {/* delete modal */}
      <div className="modal fade" id="delete_task">
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
                Are you sure you want to remove tasks you selected.
              </p>
              <div className="d-flex justify-content-center">
                <Link
                  href="#"
                  className="btn btn-light position-relative z-1 me-2 w-100"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </Link>
                <Link
                  href="#"
                  className="btn btn-primary position-relative z-1 w-100"
                  data-bs-dismiss="modal"
                >
                  Yes, Delete
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* delete modal */}
    </>
  );
};

export default ModalTask;
