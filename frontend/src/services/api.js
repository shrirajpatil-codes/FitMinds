/**
 * FITMINDS API Service Client
 * Connects Frontend to Node.js/Express + PostgreSQL API
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('FITMINDS_TOKEN');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const result = await response.json();

    if (!response.ok) {
      const errorMsg = result.message || `HTTP error ${response.status}`;
      const err = new Error(errorMsg);
      err.status = response.status;
      err.data = result;
      throw err;
    }

    return result;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // Auth
  auth: {
    register: (name, email, password) =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      }),
    login: (email, password) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    me: () => request('/auth/me'),
  },

  // User Profile
  profile: {
    get: () => request('/users/profile'),
    update: (data) =>
      request('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  // Check-ins
  checkins: {
    create: (data) =>
      request('/checkins', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    today: () => request('/checkins/today'),
    history: () => request('/checkins/history'),
  },

  // Workouts
  workouts: {
    today: () => request('/workouts/today'),
    list: () => request('/workouts'),
    get: (id) => request(`/workouts/${id}`),
    start: (id) =>
      request(`/workouts/${id}/start`, {
        method: 'POST',
      }),
    complete: (id) =>
      request(`/workouts/${id}/complete`, {
        method: 'POST',
      }),
    skip: (id, reason) =>
      request(`/workouts/${id}/skip`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    modify: (id, data) =>
      request(`/workouts/${id}/modify`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Sessions
  sessions: {
    start: (workoutId) =>
      request('/sessions/start', {
        method: 'POST',
        body: JSON.stringify({ workoutId }),
      }),
    complete: (id, data) =>
      request(`/sessions/${id}/complete`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    feedback: (id, data) =>
      request(`/sessions/${id}/feedback`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    history: () => request('/sessions/history'),
  },

  // Progress
  progress: {
    summary: () => request('/progress/summary'),
    weekly: () => request('/progress/weekly'),
    monthly: () => request('/progress/monthly'),
  },

  // Reflections
  reflections: {
    create: (data) =>
      request('/reflections/weekly', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    list: () => request('/reflections'),
    latest: () => request('/reflections/latest'),
  },

  // Strategy Health
  strategy: {
    health: () => request('/strategy/health'),
  },

  // Decision History
  decisions: {
    list: () => request('/decisions'),
    get: (id) => request(`/decisions/${id}`),
  },

  // Experiments
  experiments: {
    list: () => request('/experiments'),
    get: (id) => request(`/experiments/${id}`),
    create: (data) =>
      request('/experiments', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    end: (id, data) =>
      request(`/experiments/${id}/end`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // AI Coach Context
  coach: {
    context: () => request('/coach/context'),
  },

  // Health
  health: () => request('/health'),
};

export default api;
