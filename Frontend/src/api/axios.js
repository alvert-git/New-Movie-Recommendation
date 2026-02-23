// src/api/axios.js
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:9000/api' });

// Automatically attach JWT to every request
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export default API;