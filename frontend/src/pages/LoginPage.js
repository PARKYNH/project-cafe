// src/pages/LoginPage.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function LoginPage() {
  const navigate = useNavigate();

  // 더존 s_EMAIL 같은것!
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // 더존 버튼 클릭 이벤트랑 같은것!
  const handleLogin = async () => {
    try {
      const res = await api.post(
        '/api/auth/login',
        { email, password }
      );

      // 토큰 + 사용자 정보 저장!
      localStorage.setItem('token', res.data.accessToken);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('name', res.data.name);

      // admin이면 관리자 대시보드로!
      if (res.data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/main');
      }

    } catch (err) {
      setError(
        '이메일 또는 비밀번호가 틀렸어요!'
      );
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>

        {/* 로고 */}
        <h1 style={styles.logo}>☕ BREWY</h1>
        <p style={styles.sub}>
          브루이 카페 주문 서비스
        </p>

        {/* 이메일 입력 */}
        <input
          style={styles.input}
          type="email"
          placeholder="이메일"
          value={email}
          onChange={e =>
            setEmail(e.target.value)
          }
        />

        {/* 비밀번호 입력 */}
        <input
          style={styles.input}
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={e =>
            setPassword(e.target.value)
          }
          onKeyPress={e =>
            e.key === 'Enter' && handleLogin()
          }
        />

        {/* 에러 메시지 */}
        {error && (
          <p style={styles.error}>{error}</p>
        )}

        {/* 로그인 버튼 */}
        <button
          style={styles.button}
          onClick={handleLogin}
        >
          로그인
        </button>

      </div>
    </div>
  );
}

// 스타일
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f5f5f5'
  },
  box: {
    background: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '360px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  logo: {
    textAlign: 'center',
    color: '#6f4e37',
    margin: 0
  },
  sub: {
    textAlign: 'center',
    color: '#999',
    margin: 0,
    fontSize: '14px'
  },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '14px',
    outline: 'none'
  },
  button: {
    padding: '14px',
    backgroundColor: '#6f4e37',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  error: {
    color: 'red',
    fontSize: '13px',
    margin: 0,
    textAlign: 'center'
  }
};

export default LoginPage;