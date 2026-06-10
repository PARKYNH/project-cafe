// src/pages/LoginPage.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function LoginPage() {
  const navigate = useNavigate();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  // 입력창 포커스 효과용
  const [focusEmail, setFocusEmail]       = useState(false);
  const [focusPassword, setFocusPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/login', { email, password });

      localStorage.setItem('token', res.data.accessToken);
      localStorage.setItem('role',  res.data.role);
      localStorage.setItem('name',  res.data.name);

      if (res.data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/main');
      }
    } catch (err) {
      setError('이메일 또는 비밀번호가 틀렸어요!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>

      {/* ── 왼쪽: 브랜드 영역 ── */}
      <div style={styles.left}>
        <div style={styles.overlay} />
        <div style={styles.brand}>
          <h1 style={styles.brandName}>BREWY</h1>
          <p style={styles.brandTagline}>
            당신의 하루를 향기롭게,<br />
            브루이 카페 픽업 주문 서비스
          </p>
          <div style={styles.features}>
            <div style={styles.featureItem}>✓ 간편한 사전 주문</div>
            <div style={styles.featureItem}>✓ 대기 없이 바로 픽업</div>
            <div style={styles.featureItem}>✓ 스탬프 적립 & 쿠폰 혜택</div>
          </div>
        </div>
      </div>

      {/* ── 오른쪽: 로그인 폼 ── */}
      <div style={styles.right}>
        <div style={styles.formWrap}>

          {/* 모바일용 로고 */}
          <div style={styles.mobileLogo}>☕ BREWY</div>

          <h2 style={styles.formTitle}>로그인</h2>
          <p style={styles.formSub}>계정에 로그인하여 주문을 시작하세요</p>

          {/* 이메일 */}
          <div style={styles.inputWrap}>
            <label style={styles.label}>이메일</label>
            <input
              style={{
                ...styles.input,
                borderColor: focusEmail ? '#6f4e37' : '#e0e0e0',
                boxShadow: focusEmail
                  ? '0 0 0 3px rgba(111,78,55,0.15)'
                  : 'none'
              }}
              type="email"
              placeholder="example@brewy.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocusEmail(true)}
              onBlur={() => setFocusEmail(false)}
            />
          </div>

          {/* 비밀번호 */}
          <div style={styles.inputWrap}>
            <label style={styles.label}>비밀번호</label>
            <input
              style={{
                ...styles.input,
                borderColor: focusPassword ? '#6f4e37' : '#e0e0e0',
                boxShadow: focusPassword
                  ? '0 0 0 3px rgba(111,78,55,0.15)'
                  : 'none'
              }}
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={() => setFocusPassword(true)}
              onBlur={() => setFocusPassword(false)}
              onKeyPress={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div style={styles.errorBox}>
              ⚠️ {error}
            </div>
          )}

          {/* 로그인 버튼 */}
          <button
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>

          {/* 구분선 */}
          <div style={styles.divider}>
            <span style={styles.dividerLine} />
            <span style={styles.dividerText}>테스트 계정</span>
            <span style={styles.dividerLine} />
          </div>

          {/* 테스트 계정 안내 */}
          <div style={styles.testAccounts}>
            <div
              style={styles.testBtn}
              onClick={() => {
                setEmail('test@brewy.com');
                setPassword('12341234');
              }}
            >
              👨‍💼 관리자로 체험
            </div>
            <div
              style={styles.testBtn}
              onClick={() => {
                setEmail('user1@brewy.com');
                setPassword('12341234');
              }}
            >
              👤 일반 유저로 체험
            </div>
          </div>

          <p style={styles.copyright}>© 2026 BREWY. 박용희</p>
        </div>
      </div>

    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    fontFamily: "'Segoe UI', sans-serif"
  },

  /* ── 왼쪽 브랜드 영역 ── */
  left: {
    flex: 1,
    position: 'relative',
    backgroundImage: 'url(https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '@media (max-width: 768px)': { display: 'none' }
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(63,32,10,0.72)'
  },
  brand: {
    position: 'relative',
    zIndex: 1,
    color: 'white',
    textAlign: 'center',
    padding: '40px'
  },
  brandLogo: {
    fontSize: '72px',
    marginBottom: '16px'
  },
  brandName: {
    fontSize: '52px',
    fontWeight: '800',
    letterSpacing: '8px',
    margin: '0 0 16px',
    color: '#f5ede6'
  },
  brandTagline: {
    fontSize: '18px',
    lineHeight: '1.8',
    color: 'rgba(255,255,255,0.85)',
    marginBottom: '40px'
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    alignItems: 'flex-start',
    display: 'inline-flex'
  },
  featureItem: {
    fontSize: '15px',
    color: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    padding: '8px 20px',
    borderRadius: '20px',
    backdropFilter: 'blur(4px)'
  },

  /* ── 오른쪽 폼 영역 ── */
  right: {
    width: '440px',
    backgroundColor: '#fafafa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px'
  },
  formWrap: {
    width: '100%',
    maxWidth: '360px'
  },
  mobileLogo: {
    display: 'none',
    fontSize: '24px',
    fontWeight: '800',
    color: '#6f4e37',
    textAlign: 'center',
    marginBottom: '24px'
  },
  formTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 8px'
  },
  formSub: {
    fontSize: '14px',
    color: '#888',
    margin: '0 0 32px'
  },
  inputWrap: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#444',
    marginBottom: '8px'
  },
  input: {
    width: '100%',
    padding: '13px 16px',
    borderRadius: '10px',
    border: '1.5px solid #e0e0e0',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
    backgroundColor: 'white'
  },
  errorBox: {
    backgroundColor: '#fff0f0',
    border: '1px solid #ffcccc',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    color: '#d32f2f',
    marginBottom: '16px'
  },
  button: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#6f4e37',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background 0.2s',
    marginBottom: '24px',
    letterSpacing: '1px'
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px'
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#e0e0e0'
  },
  dividerText: {
    fontSize: '12px',
    color: '#aaa',
    whiteSpace: 'nowrap'
  },
  testAccounts: {
    display: 'flex',
    gap: '10px',
    marginBottom: '32px'
  },
  testBtn: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#f5ede6',
    border: '1px solid #e8d5c4',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#6f4e37',
    fontWeight: '600',
    textAlign: 'center',
    cursor: 'pointer'
  },
  copyright: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#ccc',
    margin: 0
  }
};

export default LoginPage;
