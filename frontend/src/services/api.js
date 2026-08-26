/**
 * FITMINDS API Service Client Placeholder
 * 
 * Configured for future REST API integration with Node.js/Express backend.
 * Do NOT mock or invent fake API endpoints in Step 2.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiClient = {
  baseUrl: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
};
