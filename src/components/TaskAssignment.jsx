import { useState, useEffect } from 'react';
import { clientService, employeeService, taskService, userService } from '../services/api';
import Toast from './Toast';

const TaskAssignment = ({ onTaskCreated }) => {
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const loggedInUser = userService.get_logged_in_user();
  const [formData, setFormData] = useState({
    client_id: '',
    task_category: '',
    task_name: '',
    assigned_to: '',
    created_by: loggedInUser.id
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoadingData(true);
    const [clientsRes, employeesRes] = await Promise.all([
      clientService.getClients(),
      employeeService.getEmployees()
    ]);

    if (clientsRes.success) setClients(clientsRes.data);
    if (employeesRes.success) setEmployees(employeesRes.data);
    setLoadingData(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const taskData = {
      ...formData,
      client_id: parseInt(formData.client_id),
      assigned_to: parseInt(formData.assigned_to)
    };

    const response = await taskService.createTask(taskData);

    if (response.success) {
      setToast({ message: 'Task assigned successfully!', type: 'success' });
      setFormData({
        client_id: '',
        task_category: '',
        task_name: '',
        assigned_to: '',
        created_by: loggedInUser.id
      });
      //  onTaskCreated();    // this comment make the toast to show properly
    } else {
      setToast({ message: response.message || 'Failed to create task', type: 'error' });
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loadingData) {
    return (
      <div className="task-assignment">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="task-assignment">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <h2>Assign New Task</h2>
      <form onSubmit={handleSubmit} className="assignment-form">
        <div className="form-row">
          <div className="form-group">
            <label>Client *</label>
            <select
              name="client_id"
              value={formData.client_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.code})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Task Category *</label>
            <input
              type="text"
              name="task_category"
              value={formData.task_category}
              onChange={handleChange}
              placeholder="e.g., Bank Statement, Return File, Audit"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Task Name *</label>
            <input
              type="text"
              name="task_name"
              value={formData.task_name}
              onChange={handleChange}
              placeholder="e.g., Bank A, GST Return"
              required
            />
          </div>

          <div className="form-group">
            <label>Assign To *</label>
            <select
              name="assigned_to"
              value={formData.assigned_to}
              onChange={handleChange}
              required
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Assigning...' : 'Assign Task'}
        </button>
      </form>
    </div>
  );
};

export default TaskAssignment;
