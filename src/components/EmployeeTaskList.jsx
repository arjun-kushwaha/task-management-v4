import { useState } from 'react';
import { taskService } from '../services/api';
import Toast from './Toast';

const EmployeeTaskList = ({ tasks, onRefresh, activeTab }) => {
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    status: '',
    updatedTill: '',
    employeeTaskComment: '',
    deadline: '',
    priority: ''
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const canUpdateTask = (task) => {
    return task.approvalStatus !== 'approved';
  };

  const handleEdit = (task) => {
    if (!canUpdateTask(task)) return;

    setEditingTask(task.id);
    setFormData({
      status: task.status,
      updatedTill: task.updatedTill || '',
      employeeTaskComment: '',
      deadline: task.deadline || '',
      priority: task.priority || 'medium'
    });
  };

  const handleCancel = () => {
    setEditingTask(null);
    setFormData({
      status: '',
      updatedTill: '',
      employeeTaskComment: '',
      deadline: '',
      priority: ''
    });
  };

  const handleSave = async (taskId) => {
    setLoading(true);
    const response = await taskService.updateTaskStatus(
      taskId,
      formData.status,
      formData.updatedTill,
      formData.employeeTaskComment,
      formData.deadline,
      formData.priority
    );

    if (response.success) {
      setToast({ message: 'Task updated successfully', type: 'success' });
      setEditingTask(null);
      onRefresh();
    } else {
      setToast({ message: response.message || 'Failed to update task', type: 'error' });
    }
    setLoading(false);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'badge-pending',
      in_progress: 'badge-progress',
      completed: 'badge-completed'
    };
    return statusColors[status] || 'badge-pending';
  };

  const getApprovalBadge = (status) => {
    const approvalColors = {
      pending: 'badge-approval-pending',
      approved: 'badge-approval-approved',
      rejected: 'badge-approval-rejected'
    };
    return approvalColors[status] || 'badge-approval-pending';
  };

  const getTabTitle = () => {
    if (activeTab === 'assigned') return 'Assigned Tasks';
    if (activeTab === 'completed') return 'Completed Tasks';
    if (activeTab === 'pending') return 'Pending Tasks';
    return 'My Tasks';
  };

  return (
    <div className="employee-task-list">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="task-list-header">
        <h2>{getTabTitle()}</h2>
        <button onClick={onRefresh} className="refresh-btn">Refresh</button>
      </div>

      {tasks.length === 0 ? (
        <p className="no-tasks">No tasks found</p>
      ) : (
        <div className="tasks-grid">
          {tasks.map(task => (
            <div key={task.id} className="task-card">
              <div className="task-card-header">
                <h3>{task.clientName}</h3>
                <div className="task-badges">
                  <span className={`badge ${getStatusBadge(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                  <span className={`badge ${getApprovalBadge(task.approvalStatus)}`}>
                    {task.approvalStatus.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <div className="task-card-body">
                <div className="task-detail">
                  <strong>Category:</strong> {task.taskCategory}
                </div>
                <div className="task-detail">
                  <strong>Task:</strong> {task.taskName}
                </div>
                <div className="task-detail">
                  <strong>Deadline:</strong> {task.deadline ? new Date(task.deadline).toLocaleString() : 'Not set'}
                </div>
                <div className="task-detail">
                  <strong>Priority:</strong> <span className={`priority-badge priority-${task.priority || 'medium'}`}>{task.priority || 'medium'}</span>
                </div>
                {task.employeeTaskComment && (
                  <div className="task-detail">
                    <strong>Comment:</strong> {task.employeeTaskComment}
                  </div>
                )}

                {editingTask === task.id ? (
                  <div className="edit-form">
                    <div className="form-group">
                      <label>Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        disabled={loading}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Updated Till</label>
                      <input
                        type="date"
                        value={formData.updatedTill}
                        onChange={(e) => setFormData({ ...formData, updatedTill: e.target.value })}
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label>Deadline</label>
                      <input
                        type="datetime-local"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label>Priority</label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        disabled={loading}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Comment</label>
                      <textarea
                        value={formData.employeeTaskComment}
                        onChange={(e) => setFormData({ ...formData, employeeTaskComment: e.target.value })}
                        placeholder="Add your comment here..."
                        rows="3"
                        disabled={loading}
                        className="comment-textarea"
                      />
                    </div>

                    <div className="edit-actions">
                      <button onClick={() => handleSave(task.id)} className="save-btn" disabled={loading}>
                        {loading ? 'Saving...' : 'Save'}
                      </button>
                      <button onClick={handleCancel} className="cancel-btn" disabled={loading}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="task-detail">
                      <strong>Updated Till:</strong> {task.updatedTill || 'Not updated'}
                    </div>
                    <div className="task-detail">
                      <strong>Last Updated:</strong> {task.updatedAt}
                    </div>

                    {task.approvalStatus === 'rejected' && (
                      <div className="rejection-notice">
                        Status update was rejected. Please update again.
                      </div>
                    )}

                    {task.approvalStatus === 'approved' && (
                      <div className="approval-notice">
                        This task has been approved. No further updates allowed.
                      </div>
                    )}

                    {canUpdateTask(task) ? (
                      <button onClick={() => handleEdit(task)} className="update-btn">
                        Update Status
                      </button>
                    ) : (
                      <button className="update-btn disabled" disabled>
                        Update Locked
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeTaskList;
