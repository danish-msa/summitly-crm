import { useState, useEffect } from "react";
import CommonPhoneInput from "@/core/common/common-phoneInput/commonPhoneInput";
import { Location } from "../../../../../core/json/selectOption";
import CommonSelect from "@/core/common/common-select/commonSelect";
import Link from "next/link";
import { createUser, updateUser, getUser } from "@/core/services/users.service";
import { getRoles as fetchRoles } from "@/core/services/roles.service";
import { User, Role } from "@/core/data/interface/user.interface";

type PasswordField = "password" | "confirmPassword";

interface ModalUserManagementProps {
  userId?: string | null;
  onSuccess?: () => void;
  onClose?: () => void;
}

const ModalUserManagement = ({ userId, onSuccess, onClose }: ModalUserManagementProps) => {
    const [passwordVisibility, setPasswordVisibility] = useState({
        password: false,
        confirmPassword: false,
      });
    
      const togglePasswordVisibility = (field: PasswordField) => {
        setPasswordVisibility((prevState) => ({
          ...prevState,
          [field]: !prevState[field],
        }));
      };
    const [phone, setPhone] = useState<string | undefined>();
    const [phone2, setPhone2] = useState<string | undefined>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [roles, setRoles] = useState<Role[]>([]);
    const [formData, setFormData] = useState({
      username: '',
      email: '',
      emailOptOut: false,
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
      phone1: '',
      phone2: '',
      location: '',
      status: 'Active' as 'Active' | 'Inactive' | 'Suspended',
      roleId: '',
    });

    // Load roles for dropdown
    useEffect(() => {
      const loadRoles = async () => {
        const response = await fetchRoles({ isActive: true });
        if (response.success && response.data) {
          setRoles(response.data);
        }
      };
      loadRoles();
    }, []);

    // Load user data when editing
    useEffect(() => {
      if (userId) {
        loadUserData();
      } else {
        // Reset form for new user
        resetForm();
      }
    }, [userId]);

    const resetForm = () => {
      setFormData({
        username: '',
        email: '',
        emailOptOut: false,
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: '',
        phone1: '',
        phone2: '',
        location: '',
        status: 'Active',
        roleId: '',
      });
      setPhone(undefined);
      setPhone2(undefined);
    };

    const loadUserData = async () => {
      if (!userId) return;
      try {
        const response = await getUser(userId, true);
        if (response.success && response.data) {
          const user = response.data;
          setFormData({
            username: user.username,
            email: user.email,
            emailOptOut: user.emailOptOut || false,
            firstName: user.firstName,
            lastName: user.lastName || '',
            password: '',
            confirmPassword: '',
            phone1: user.phone1 || '',
            phone2: user.phone2 || '',
            location: user.location || '',
            status: user.status,
            roleId: user.roleId || '',
          });
          setPhone(user.phone1);
          setPhone2(user.phone2);
        }
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
        // Validate required fields for new users
        if (!userId) {
          if (!formData.username || !formData.username.trim()) {
            alert('Username is required');
            setIsSubmitting(false);
            return;
          }
          if (!formData.email || !formData.email.trim()) {
            alert('Email is required');
            setIsSubmitting(false);
            return;
          }
          if (!formData.firstName || !formData.firstName.trim()) {
            alert('First name is required');
            setIsSubmitting(false);
            return;
          }
          if (!formData.password || !formData.password.trim()) {
            alert('Password is required for new users');
            setIsSubmitting(false);
            return;
          }
          if (!formData.confirmPassword || !formData.confirmPassword.trim()) {
            alert('Please confirm your password');
            setIsSubmitting(false);
            return;
          }
          if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match');
            setIsSubmitting(false);
            return;
          }
        }

        let userData: any = {
          username: formData.username.trim(),
          email: formData.email.trim(),
          emailOptOut: formData.emailOptOut,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName?.trim() || undefined,
          phone1: phone || formData.phone1 || undefined,
          phone2: phone2 || formData.phone2 || undefined,
          location: formData.location || undefined,
          status: formData.status,
          roleId: formData.roleId || undefined,
        };

        let response;
        if (userId) {
          // For updates, only include password if it was provided
          if (formData.password && formData.password.trim()) {
            if (formData.password !== formData.confirmPassword) {
              alert('Passwords do not match');
              setIsSubmitting(false);
              return;
            }
            userData.password = formData.password;
            userData.confirmPassword = formData.confirmPassword;
          }
          response = await updateUser(userId, userData);
        } else {
          userData.password = formData.password;
          userData.confirmPassword = formData.confirmPassword;
          console.log('Creating user with data:', { ...userData, password: '***', confirmPassword: '***' });
          response = await createUser(userData);
        }

        console.log('User save response:', response);

        if (response && response.success) {
          // Close modal/offcanvas
          try {
            if (userId) {
              const offcanvas = document.getElementById('offcanvas_edit');
              if (offcanvas) {
                const bsOffcanvas = (window as any).bootstrap?.Offcanvas?.getInstance(offcanvas);
                if (bsOffcanvas) {
                  bsOffcanvas.hide();
                } else {
                  const newOffcanvas = new (window as any).bootstrap.Offcanvas(offcanvas);
                  newOffcanvas.hide();
                }
              }
            } else {
              const offcanvas = document.getElementById('offcanvas_add');
              if (offcanvas) {
                const bsOffcanvas = (window as any).bootstrap?.Offcanvas?.getInstance(offcanvas);
                if (bsOffcanvas) {
                  bsOffcanvas.hide();
                } else {
                  const newOffcanvas = new (window as any).bootstrap.Offcanvas(offcanvas);
                  newOffcanvas.hide();
                }
              }
            }
          } catch (modalError) {
            console.warn('Error closing modal:', modalError);
          }
          
          if (onSuccess) onSuccess();
          if (onClose) onClose();
          // Reset form after successful save
          if (!userId) {
            resetForm();
          }
        } else {
          const errorMsg = response?.error || 'Failed to save user';
          console.error('User save failed:', errorMsg);
          alert(errorMsg);
        }
      } catch (error) {
        console.error('Error saving user:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to save user';
        alert(`Error: ${errorMessage}`);
      } finally {
        setIsSubmitting(false);
      }
    };
  return (
  <>
  {/* Add User */}
  <div
    className="offcanvas offcanvas-end offcanvas-large"
    tabIndex={-1}
    id="offcanvas_add"
    onHidden={() => {
      if (!userId && onClose) {
        onClose();
        resetForm();
      }
    }}
  >
    <div className="offcanvas-header border-bottom">
      <h5 className="fw-semibold">Add New User</h5>
      <button
        type="button"
        className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
        data-bs-dismiss="offcanvas"
        aria-label="Close"
        onClick={() => {
          if (onClose) onClose();
          resetForm();
        }}
      >
        <i className="ti ti-x" />
      </button>
    </div>
    <div className="offcanvas-body">
      <form onSubmit={handleSubmit}>
        <div>
          {/* Basic Info */}
          <div>
            <div className="row">
              <div className="col-md-12">
                <div className="d-flex align-items-center mb-3">
                  <div className="avatar avatar-xxl border border-dashed me-3 flex-shrink-0">
                    <div className="position-relative d-flex align-items-center">
                      <i className="ti ti-photo text-dark fs-16" />
                    </div>
                  </div>
                  <div className="d-inline-flex flex-column align-items-start">
                    <div className="drag-upload-btn btn btn-sm btn-primary position-relative mb-2">
                      <i className="ti ti-file-broken me-1" />
                      Upload file
                      <input
                        type="file"
                        className="form-control image-sign"
                        multiple
                      />
                    </div>
                    <span>JPG, GIF or PNG. Max size of 800K</span>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    First Name <span className="text-danger">*</span>
                  </label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    User Name <span className="text-danger">*</span>
                  </label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <label className="form-label">
                      Email <span className="text-danger">*</span>
                    </label>
                    <div className="form-check form-switch form-check-reverse">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="switchCheckReverse"
                        checked={formData.emailOptOut}
                        onChange={(e) => setFormData({ ...formData, emailOptOut: e.target.checked })}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="switchCheckReverse"
                      >
                        Email Opt Out
                      </label>
                    </div>
                  </div>
                  <input 
                    type="email" 
                    className="form-control" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Role
                  </label>
                  <CommonSelect
                    options={roles.map(role => ({ value: role.id, label: role.name }))}
                    className="select"
                    value={formData.roleId ? { value: formData.roleId, label: roles.find(r => r.id === formData.roleId)?.name || '' } : undefined}
                    onChange={(value) => setFormData({ ...formData, roleId: value?.value || '' })}
                    placeholder="Select a role"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Phone 1
                  </label>
                 <CommonPhoneInput
                            value={phone}
                            onChange={setPhone}
                            placeholder="(201) 555-0123"
                          />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Phone 2</label>
                   <CommonPhoneInput
                            value={phone2}
                            onChange={(value) => {
                              setPhone2(value);
                              setFormData({ ...formData, phone2: value || '' });
                            }}
                            placeholder="(201) 555-0123"
                          />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Password {!userId && <span className="text-danger">*</span>}
                  </label>
                  <div className="input-group input-group-flat pass-group">
                    <input
                        type={passwordVisibility.password ? "text" : "password"}
                        className="form-control pass-input"
                        placeholder="****************"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required={!userId}
                      />
                      <span
                        className={`ti toggle-password input-group-text toggle-password ${
                          passwordVisibility.password ? "ti-eye" : "ti-eye-off"
                        }`}
                        onClick={() => togglePasswordVisibility("password")}
                      ></span>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Repeat Password <span className="text-danger">*</span>
                  </label>
                  <div className="input-group input-group-flat pass-group">
                    <input
                        type={passwordVisibility.confirmPassword ? "text" : "password"}
                        className="form-control pass-input"
                        placeholder="****************"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required={!userId}
                      />
                      <span
                        className={`ti toggle-password input-group-text toggle-password ${
                          passwordVisibility.confirmPassword ? "ti-eye" : "ti-eye-off"
                        }`}
                        onClick={() => togglePasswordVisibility("confirmPassword")}
                      ></span>
                  </div>
                </div>
              </div>
              <div className="col-md-12">
                <div className="mb-3">
                  <label className="form-label">
                    Location
                  </label>
                  <CommonSelect
                            options={Location}
                            className="select"
                            value={formData.location ? { value: formData.location, label: formData.location } : undefined}
                            onChange={(value) => setFormData({ ...formData, location: value?.value || '' })}
                            placeholder="Select location"
                          />
                </div>
              </div>
            </div>
          </div>
          {/* /Basic Info */}
        </div>
        <div className="d-flex align-items-center justify-content-end">
          <button
            type="button"
            className="btn btn-light me-2"
            data-bs-dismiss="offcanvas"
            onClick={() => {
              if (onClose) onClose();
              resetForm();
            }}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  </div>
  {/* /Add User */}
  {/* Edit User */}
  <div
    className="offcanvas offcanvas-end offcanvas-large"
    tabIndex={-1}
    id="offcanvas_edit"
    onHidden={() => {
      if (userId && onClose) {
        onClose();
      }
    }}
  >
    <div className="offcanvas-header border-bottom">
      <h5 className="fw-semibold">Edit User</h5>
      <button
        type="button"
        className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
        data-bs-dismiss="offcanvas"
        aria-label="Close"
        onClick={() => {
          if (onClose) onClose();
        }}
      >
        <i className="ti ti-x" />
      </button>
    </div>
    <div className="offcanvas-body">
      <form onSubmit={handleSubmit}>
        <div>
          {/* Basic Info */}
          <div>
            <div className="row">
              <div className="col-md-12">
                <div className="d-flex align-items-center mb-3">
                  <div className="avatar avatar-xxl border border-dashed me-3 flex-shrink-0">
                    <div className="position-relative d-flex align-items-center">
                      <i className="ti ti-photo text-dark fs-16" />
                    </div>
                  </div>
                  <div className="d-inline-flex flex-column align-items-start">
                    <div className="drag-upload-btn btn btn-sm btn-primary position-relative mb-2">
                      <i className="ti ti-file-broken me-1" />
                      Upload file
                      <input
                        type="file"
                        className="form-control image-sign"
                        multiple
                      />
                    </div>
                    <span>JPG, GIF or PNG. Max size of 800K</span>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    First Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    User Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <label className="form-label">
                      Email <span className="text-danger">*</span>
                    </label>
                    <div className="form-check form-switch form-check-reverse">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="switchCheckReverse2"
                        checked={formData.emailOptOut}
                        onChange={(e) => setFormData({ ...formData, emailOptOut: e.target.checked })}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="switchCheckReverse2"
                      >
                        Email Opt Out
                      </label>
                    </div>
                  </div>
                  <input
                    type="email"
                    className="form-control"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Role
                  </label>
                  <CommonSelect
                    options={roles.map(role => ({ value: role.id, label: role.name }))}
                    className="select"
                    value={formData.roleId ? { value: formData.roleId, label: roles.find(r => r.id === formData.roleId)?.name || '' } : undefined}
                    onChange={(value) => setFormData({ ...formData, roleId: value?.value || '' })}
                    placeholder="Select a role"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Phone 1 <span className="text-danger">*</span>
                  </label>
                <CommonPhoneInput
                            value={phone}
                            onChange={(value) => {
                              setPhone(value);
                              setFormData({ ...formData, phone1: value || '' });
                            }}
                            placeholder="(201) 555-0123"
                          />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Phone 2</label>
                  <CommonPhoneInput
                            value={phone2}
                            onChange={(value) => {
                              setPhone2(value);
                              setFormData({ ...formData, phone2: value || '' });
                            }}
                            placeholder="(201) 555-0123"
                          />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <div className="input-group input-group-flat pass-group">
                    <input
                        type={passwordVisibility.password ? "text" : "password"}
                        className="form-control pass-input"
                        placeholder="****************"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                      <span
                        className={`ti toggle-password input-group-text toggle-password ${
                          passwordVisibility.password ? "ti-eye" : "ti-eye-off"
                        }`}
                        onClick={() => togglePasswordVisibility("password")}
                      ></span>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Repeat Password
                  </label>
                  <div className="input-group input-group-flat pass-group">
                    <input
                        type={passwordVisibility.confirmPassword ? "text" : "password"}
                        className="form-control pass-input"
                        placeholder="****************"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      />
                      <span
                        className={`ti toggle-password input-group-text toggle-password ${
                          passwordVisibility.confirmPassword ? "ti-eye" : "ti-eye-off"
                        }`}
                        onClick={() => togglePasswordVisibility("confirmPassword")}
                      ></span>
                  </div>
                </div>
              </div>
              <div className="col-md-12">
                <div className="mb-3">
                  <label className="form-label">
                    Location
                  </label>
                  <CommonSelect
                            options={Location}
                            className="select"
                            value={formData.location ? { value: formData.location, label: formData.location } : undefined}
                            onChange={(value) => setFormData({ ...formData, location: value?.value || '' })}
                            placeholder="Select location"
                          />
                </div>
              </div>
            </div>
          </div>
          {/* /Basic Info */}
        </div>
        <div className="d-flex align-items-center justify-content-end">
          <button
            type="button"
            className="btn btn-light me-2"
            data-bs-dismiss="offcanvas"
            onClick={() => {
              if (onClose) onClose();
              if (!userId) {
                resetForm();
              }
            }}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  </div>
  {/* /Edit User */}
</>

  )
}

export default ModalUserManagement