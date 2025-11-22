import { mockApi } from '../services/mockApi';
import { taskService } from '../services/api';

const TaskList = ({ tasks, onRefresh, isAdmin }) => {
  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      const response = await taskService.deleteTask(taskId);
      if (response.success) {
        onRefresh();
      }
    }
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

  return (
    <div className="task-list">
      <div className="task-list-header">
        <h2>All Tasks</h2>
        <button onClick={onRefresh} className="refresh-btn">Refresh</button>
      </div>

      {tasks.length === 0 ? (
        <p className="no-tasks">No tasks found</p>
      ) : (
        <div className="table-container">
          <table className="tasks-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Category</th>
                <th>Task Name</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th>Updated Till</th>
                <th>Approval</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
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
                    <span className={`badge ${getApprovalBadge(task.approvalStatus)}`}>
                      {task.approvalStatus.replace('_', ' ')}
                    </span>
                  </td>
                  {isAdmin && (
                    <td>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TaskList;
