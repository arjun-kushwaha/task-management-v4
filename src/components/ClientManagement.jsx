import { useState, useEffect } from 'react';
import { clientService } from '../services/api';
import Toast from './Toast';

const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: ''
  });
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
     setToast({ message: 'Testing toast message', type: 'success' });
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    const response = await clientService.getClients();
    if (response.success) {
      setClients(response.data || []);
    }
    setLoading(false);
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Client name is required';
    if (formData.name.length < 2) return 'Name must be at least 2 characters';
    if (!formData.code.trim()) return 'Client code is required';
    if (!/^[A-Z0-9]+$/.test(formData.code)) return 'Code must be uppercase alphanumeric';
    if (formData.code.length > 15) return 'Code cannot exceed 15 characters';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const validationError = validateForm();
    if (validationError) {
      setToast({ message: validationError, type: 'error' });
      setLoading(false);
      return;
    }

    let response;
    if (editingClient) {
      response = await clientService.updateClient({
        id: editingClient.id,
        ...formData
      });
    } else {
      response = await clientService.createClient(formData);
    }

    if (response.success) {
      setToast({ message: response.message || 'Operation successful', type: 'success' });
      setShowForm(false);
      setEditingClient(null);
      setFormData({ name: '', code: '' });
      loadClients();
    } else {
      setToast({ message: response.message || 'Operation failed', type: 'error' });
    }
    setLoading(false);
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      code: client.code
    });
    setShowForm(true);
  };

  const handleDelete = async (clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      const response = await clientService.deleteClient(clientId);
      if (response.success) {
        setToast({ message: response.message || 'Client deleted successfully', type: 'success' });
        loadClients();
      } else {
        setToast({ message: response.message || 'Failed to delete client', type: 'error' });
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingClient(null);
    setFormData({ name: '', code: '' });
  };

  const filteredClients = clients.filter(client => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.name?.toLowerCase().includes(searchLower) ||
      client.code?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="client-management">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="management-header">
        <h2>Client Management</h2>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="add-btn">
            Add New Client
          </button>
        )}
      </div>

      {showForm ? (
        <div className="client-form-container">
          <h3>{editingClient ? 'Edit Client' : 'Add New Client'}</h3>
          <form onSubmit={handleSubmit} className="client-form">
            <div className="form-row">
              <div className="form-group">
                <label>Client Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter client name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Client Code/GSTIN *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Enter client code/GSTIN"
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Saving...' : editingClient ? 'Update Client' : 'Create Client'}
              </button>
              <button type="button" onClick={handleCancel} className="cancel-btn">
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by client name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="clients-table-container">
            {loading ? (
              <p>Loading...</p>
            ) : filteredClients.length === 0 ? (
              <p className="no-clients">No clients found</p>
            ) : (
              <table className="clients-table">
                <thead>
                  <tr>
                    <th>Client Name</th>
                    <th>Client Code/GSTIN</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map(client => (
                    <tr key={client.id}>
                      <td>{client.name}</td>
                      <td>
                        <span className="code-badge">{client.code}</span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button onClick={() => handleEdit(client)} className="edit-btn">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(client.id)} className="delete-btn">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ClientManagement;
