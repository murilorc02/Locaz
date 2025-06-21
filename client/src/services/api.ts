import axios from 'axios';

const TEMP_AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwiaWF0IjoxNzUwNDc5MDAwfQ.NnYA8yawKXzOwqtRg9wdMkN0HMhCCd7pjaUwoAAB8zA';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', 
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TEMP_AUTH_TOKEN}`
  },
});

export default api;