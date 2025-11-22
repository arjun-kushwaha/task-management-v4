const API_BASE_URL = 'https://capsk.co.in/api/task/endpoints';

export const authService = {
  async login(username, password) {
    const response = await fetch(`${API_BASE_URL}/login.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (data.success) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } else {
      throw new Error(data.message || 'Login failed');
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken() {
    return localStorage.getItem('token');
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!this.getToken();
  },
};

// Helper function for authenticated requests
const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${authService.getToken()}`
});

export const taskService = {
  async getTasks(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const url = queryString
        ? `${API_BASE_URL}/tasks.php?${queryString}`
        : `${API_BASE_URL}/tasks.php`;

      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      if (!data.success && data.message) {
        throw new Error(data.message);
      }
      return data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  async createTask(taskData) {
    const response = await fetch(`${API_BASE_URL}/create_task.php`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData),
    });
    return response.json();
  },

  async updateTask(taskData) {
    const response = await fetch(`${API_BASE_URL}/update_task.php`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData),
    });
    return response.json();
  },

  async updateTaskStatus(id, status, updatedTill, employeeTaskComment, deadline, priority) {
    const response = await fetch(`${API_BASE_URL}/tasks.php`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        id,
        status,
        updated_till: updatedTill,
        employee_task_comment: employeeTaskComment,
        deadline,
        priority
      }),
    });
    return response.json();
  },

  async approveTask(id, approvalStatus) {
    const response = await fetch(`${API_BASE_URL}/approve_task.php`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id, approvalStatus }),
    });
    return response.json();
  },

async deleteTask(id) {
  const response = await fetch(`${API_BASE_URL}/delete_task.php?id=${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const data = await response.json();
  return data;
},

  async getClientReport(clientId) {
    const response = await fetch(`${API_BASE_URL}/client_report.php?clientId=${clientId}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};

export const clientService = {
  async getClients() {
    try {
      const response = await fetch(`${API_BASE_URL}/clients.php`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      if (!data.success && data.message) {
        throw new Error(data.message);
      }
      return data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  async getClient(id) {
    const response = await fetch(`${API_BASE_URL}/get_client.php?id=${id}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  async createClient(clientData) {
    const response = await fetch(`${API_BASE_URL}/create_client.php`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(clientData),
    });
    return response.json();
  },

  async updateClient(clientData) {
    const response = await fetch(`${API_BASE_URL}/update_client.php`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(clientData),
    });
    return response.json();
  },

  async deleteClient(id) {
    const response = await fetch(`${API_BASE_URL}/delete_client.php?id=${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};

export const employeeService = {
  async getEmployees() {
    try {
      const response = await fetch(`${API_BASE_URL}/employees.php`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      if (!data.success && data.message) {
        throw new Error(data.message);
      }
      return data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
  async getEmployeeTasks(id) {
    const response = await fetch(`${API_BASE_URL}/get_employee_tasks.php?emp_id=${id}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  }
};

export const userService = {
  async getUsers() {
    try {
      const response = await fetch(`${API_BASE_URL}/get_users.php`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      if (!data.success && data.message) {
        throw new Error(data.message);
      }
      return data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  async getUser(id) {
    const response = await fetch(`${API_BASE_URL}/get_user.php?id=${id}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  async createUser(userData) {
    const response = await fetch(`${API_BASE_URL}/create_user.php`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  async updateUser(userData) {
    const response = await fetch(`${API_BASE_URL}/update_user.php`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return response.json();
  },

get_logged_in_user() {
  const data = localStorage.getItem('user');
  return data ? JSON.parse(data) : null;
},


  async deleteUser(id) {
    const response = await fetch(`${API_BASE_URL}/delete_user.php?id=${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};
