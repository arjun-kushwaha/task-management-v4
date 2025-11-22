import { useState, useEffect } from 'react';
import { taskService } from '../services/api';
import Toast from './Toast';

const ApprovalQueue = ({ onApprovalChange }) => {
  const [pendingTasks, setPendingTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadPendingTasks();
  }, []);

  const loadPendingTasks = async () => {
    setLoading(true);
    const response = await taskService.getTasks({ approvalStatus: 'pending' });
    if (response.success) {
      setPendingTasks(response.data.filter(t => t.status == 'pending'));
    }
    setLoading(false);
  };

  const handleApproval = async (taskId, approvalStatus) => {
    setApproving(taskId);
    const response = await taskService.approveTask(taskId, approvalStatus);
    if (response.success) {
      setToast({
        message: `Task ${approvalStatus === 'approved' ? 'approved' : 'rejected'} successfully`,
        type: 'success'
      });
      loadPendingTasks();
      onApprovalChange();
    } else {
      setToast({ message: response.message || 'Operation failed', type: 'error' });
    }
    setApproving(null);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'badge-pending',
      in_progress: 'badge-progress',
      completed: 'badge-completed'
    };
    return statusColors[status] || 'badge-pending';
  };

  return (
    <div className="approval-queue">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <h2>Pending Approvals</h2>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading approvals...</p>
        </div>
      ) : pendingTasks.length === 0 ? (
        <p className="no-tasks">No pending approvals</p>
      ) : (
        <div className="table-container">
          <table className="tasks-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Category</th>
                <th>Task Name</th>
                <th>Employee</th>
                <th>Status</th>
                <th>Updated Till</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingTasks.map(task => (
                <tr key={task.id}>
                  <td>{task.clientName}</td>
                  <td>{task.taskCategory}</td>
                  <td>{task.taskName}</td>
                  <td>{task.employeeName}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{task.updatedTill || '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleApproval(task.id, 'approved')}
                        className="approve-btn"
                        disabled={approving === task.id}
                      >
                        {approving === task.id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleApproval(task.id, 'rejected')}
                        className="reject-btn"
                        disabled={approving === task.id}
                      >
                        {approving === task.id ? 'Processing...' : 'Reject'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ApprovalQueue;
