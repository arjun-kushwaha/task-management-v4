import { useState, useEffect } from 'react';
import { taskService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TaskAssignment from '../components/TaskAssignment';
import TaskListWithPagination from '../components/TaskListWithPagination';
import ApprovalQueue from '../components/ApprovalQueue';
import ClientReports from '../components/ClientReports';
import UserManagement from '../components/UserManagement';
import ClientManagement from '../components/ClientManagement';
import '../styles/Dashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0
  });

  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    try {
       const response = await taskService.getTasks();
      if (response.success) {
        setTasks(response.data);
        calculateStats(response.data);
      } else {
        setError(response.message || 'Failed to load tasks');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while loading tasks');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (tasksData) => {
    setStats({
      total: tasksData.length,
      pending: tasksData.filter(t => t.status === 'pending').length,
      inProgress: tasksData.filter(t => t.status === 'in_progress').length,
      completed: tasksData.filter(t => t.status === 'completed').length
    });
  };

  const getFilteredTasks = () => {
    if (activeTab === 'pending') {
      return tasks.filter(t => t.status === 'pending');
    } else if (activeTab === 'in_progress') {
      return tasks.filter(t => t.status === 'in_progress');
    } else if (activeTab === 'completed') {
      return tasks.filter(t => t.status === 'completed');
    } else if (activeTab === 'all') {
      return tasks;
    }
    return [];
  };

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <div className="dashboard">
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Master Data</h3>
          <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>×</button>
        </div>
        <nav className="sidebar-nav">
          <button
            className={activeTab === 'users' ? 'nav-item active' : 'nav-item'}
            onClick={() => { setActiveTab('users'); setSidebarOpen(false); }}
          >
            User Management
          </button>
          <button
            className={activeTab === 'clients' ? 'nav-item active' : 'nav-item'}
            onClick={() => { setActiveTab('clients'); setSidebarOpen(false); }}
          >
            Client Management
          </button>
        </nav>
      </div>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
              <span></span>
              <span></span>
              <span></span>
            </button>
            <h1>Admin Dashboard</h1>
          </div>
          <div className="user-info">
            <div className="user-avatar">
              <span className="avatar-icon">{user?.name?.charAt(0).toUpperCase()}</span>
              <span className="user-name">{user?.name}</span>
            </div>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <div className="stats-cards-container">
        <div className="stats-cards">
          <div className="stat-card">
            <h3>Total Tasks</h3>
            <p className="stat-number">{stats.total}</p>
          </div>
          <div className="stat-card pending">
            <h3>Pending</h3>
            <p className="stat-number">{stats.pending}</p>
          </div>
          <div className="stat-card progress">
            <h3>In Progress</h3>
            <p className="stat-number">{stats.inProgress}</p>
          </div>
          <div className="stat-card completed">
            <h3>Completed</h3>
            <p className="stat-number">{stats.completed}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={activeTab === 'pending' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('pending')}
        >
          Pending
        </button>
        <button
          className={activeTab === 'in_progress' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('in_progress')}
        >
          In Progress
        </button>
        <button
          className={activeTab === 'completed' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('completed')}
        >
          Completed
        </button>
        <button
          className={activeTab === 'all' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('all')}
        >
          All Tasks
        </button>
        <button
          className={activeTab === 'assign' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('assign')}
        >
          Assign Task
        </button>
        <button
          className={activeTab === 'approvals' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('approvals')}
        >
          Approvals
        </button>
        <button
          className={activeTab === 'reports' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('reports')}
        >
          Reports
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="dashboard-content">
        {loading && <div className="loading">Loading...</div>}
        {!loading && activeTab === 'pending' && (
          <TaskListWithPagination tasks={getFilteredTasks()} onRefresh={loadTasks} isAdmin={true} title="Pending Tasks" />
        )}
        {!loading && activeTab === 'in_progress' && (
          <TaskListWithPagination tasks={getFilteredTasks()} onRefresh={loadTasks} isAdmin={true} title="In Progress Tasks" />
        )}
        {!loading && activeTab === 'completed' && (
          <TaskListWithPagination tasks={getFilteredTasks()} onRefresh={loadTasks} isAdmin={true} title="Completed Tasks" />
        )}
        {!loading && activeTab === 'all' && (
          <TaskListWithPagination tasks={getFilteredTasks()} onRefresh={loadTasks} isAdmin={true} title="All Tasks" />
        )}
        {!loading && activeTab === 'assign' && (
          <TaskAssignment onTaskCreated={loadTasks} />
        )}
        {!loading && activeTab === 'approvals' && (
          <ApprovalQueue onApprovalChange={loadTasks} />
        )}
        {!loading && activeTab === 'reports' && (
          <ClientReports />
        )}
        {!loading && activeTab === 'users' && (
          <UserManagement />
        )}
        {!loading && activeTab === 'clients' && (
          <ClientManagement />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
