// src/api/axios.js

import axios from 'axios';

// 백엔드 서버 주소!
const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json'
  }
});

// 요청할 때마다 토큰 자동 추가!
// 더존 dews.api 헤더 설정이랑 같은것!
api.interceptors.request.use((config) => {
  const token = localStorage
    .getItem('token');
  if (token) {
    config.headers.Authorization
      = `Bearer ${token}`;
  }
  return config;
});

export default api;
