import { useState, useEffect } from 'react';
import { clientService } from '../services/api';
import Toast from './Toast';

const ClientReports = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingClients, setLoadingClients] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoadingClients(true);
    const response = await clientService.getClients();
    if (response.success) {
      setClients(response.data);
    } else {
      setToast({ message: 'Failed to load clients', type: 'error' });
    }
    setLoadingClients(false);
  };

  const generateReport = async () => {
    if (!selectedClient) {
      setToast({ message: 'Please select a client', type: 'error' });
      return;
    }

    setLoading(true);
    const response = await clientService.getClient(parseInt(selectedClient));
    if (response.success) {
      setReportData(response.data);
      setToast({ message: 'Report generated successfully', type: 'success' });
    } else {
      setToast({ message: response.message || 'Failed to generate report', type: 'error' });
    }
    setLoading(false);
  };

  const downloadReport = () => {
    if (!reportData) return;

    let reportText = `CLIENT REPORT\n`;
    reportText += `=====================================\n\n`;
    reportText += `Client: ${reportData.client.name}\n`;
    reportText += `Client Code: ${reportData.client.code}\n`;
    reportText += `Generated At: ${new Date(reportData.generatedAt).toLocaleString()}\n\n`;
    reportText += `=====================================\n\n`;

    Object.keys(reportData.tasks).forEach(category => {
      reportText += `${category}\n`;
      reportText += `-`.repeat(50) + `\n`;

      reportData.tasks[category].forEach(task => {
        reportText += `  • ${task.taskName}\n`;
        reportText += `    Status: ${task.status.replace('_', ' ')}\n`;
        reportText += `    Updated Till: ${task.updatedTill || 'Not updated'}\n`;
        reportText += `    Assigned To: ${task.employeeName}\n`;
        reportText += `    Approval: ${task.approvalStatus}\n\n`;
      });
      reportText += `\n`;
    });

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportData.client.name.replace(/\s+/g, '_')}_Report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
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

  if (loadingClients) {
    return (
      <div className="client-reports">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="client-reports">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <h2>Client Reports</h2>

      <div className="report-controls">
        <select
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
          className="client-select"
          disabled={loading}
        >
          <option value="">Select Client</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>
              {client.name} ({client.code})
            </option>
          ))}
        </select>

        <button
          onClick={generateReport}
          disabled={!selectedClient || loading}
          className="generate-btn"
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </button>

        {reportData && (
          <button onClick={downloadReport} className="download-btn">
            Download Report
          </button>
        )}
      </div>

      {reportData && (
        <div className="report-content">
          <div className="report-header">
            <h3>{reportData.client.name}</h3>
            <p>Client Code: {reportData.client.code}</p>
            <p>Generated: {new Date(reportData.generatedAt).toLocaleString()}</p>
          </div>

          {Object.keys(reportData.tasks).length === 0 ? (
            <p className="no-tasks">No tasks found for this client</p>
          ) : (
            <div className="report-categories">
              {Object.keys(reportData.tasks).map(category => (
                <div key={category} className="category-section">
                  <h4>{category}</h4>
                  <div className="category-tasks">
                    {reportData.tasks[category].map(task => (
                      <div key={task.id} className="report-task-card">
                        <div className="task-info">
                          <strong>{task.taskName}</strong>
                          <p>Assigned to: {task.employeeName}</p>
                        </div>
                        <div className="task-status">
                          <span className={`badge ${getStatusBadge(task.status)}`}>
                            {task.status.replace('_', ' ')}
                          </span>
                          <span className={`badge ${getApprovalBadge(task.approvalStatus)}`}>
                            {task.approvalStatus}
                          </span>
                        </div>
                        <div className="task-dates">
                          <p>Updated Till: <strong>{task.updatedTill || 'Not updated'}</strong></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientReports;
