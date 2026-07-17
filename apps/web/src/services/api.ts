import axios from 'axios';

const backendUrl =
  import.meta.env['VITE_BACKEND-URL'] ||
  import.meta.env.VITE_BACKEND_URL ||
  'http://localhost:3000';

export const api = axios.create({
  baseURL: `${backendUrl}/api/v1`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
