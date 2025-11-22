import { useState, useEffect } from 'react';
import { employeeService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import EmployeeTaskList from '../components/EmployeeTaskList';
import '../styles/Dashboard.css';

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('assigned');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0
  });

  const loadTasks = async () => {
    setLoading(true);
    const response = await employeeService.getEmployeeTasks(user.id);
    if (response.success) {
      setTasks(response.data);
      calculateStats(response.data);
    }
    setLoading(false);
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
    if (activeTab === 'assigned') {
      return tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
    } else if (activeTab === 'completed') {
      return tasks.filter(t => t.status === 'completed');
    } else if (activeTab === 'pending') {
      return tasks.filter(t => t.status === 'pending');
    }
    return tasks;
  };

  useEffect(() => {
    if (user?.id) {
      loadTasks();
    }
  }, [user]);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Employee Dashboard</h1>
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
          className={activeTab === 'assigned' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('assigned')}
        >
          Assigned Tasks
        </button>
        <button
          className={activeTab === 'completed' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('completed')}
        >
          Completed Tasks
        </button>
        <button
          className={activeTab === 'pending' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('pending')}
        >
          Pending Tasks
        </button>
      </div>

      <div className="dashboard-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading tasks...</p>
          </div>
        ) : (
          <EmployeeTaskList
            tasks={getFilteredTasks()}
            onRefresh={loadTasks}
            activeTab={activeTab}
          />
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
