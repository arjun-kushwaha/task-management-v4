import { useState, useEffect } from 'react';
import { taskService } from '../services/api';

const TaskListWithPagination = ({ tasks, onRefresh, isAdmin, title = "Tasks" }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  const filteredTasks = tasks.filter(task => {
    const searchLower = searchTerm.toLowerCase();
    return (
      task.clientName?.toLowerCase().includes(searchLower) ||
      task.taskCategory?.toLowerCase().includes(searchLower) ||
      task.taskName?.toLowerCase().includes(searchLower) ||
      task.employeeName?.toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTasks = filteredTasks.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="task-list">
      <div className="task-list-header">
        <h2>{title}</h2>
        <div className="task-list-actions">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button onClick={onRefresh} className="refresh-btn">Refresh</button>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <p className="no-tasks">No tasks found</p>
      ) : (
        <>
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
                {paginatedTasks.map(task => (
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

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {currentPage} of {totalPages} ({filteredTasks.length} tasks)
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TaskListWithPagination;
