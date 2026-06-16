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

  const handleLogin = async () => {
    if (!email || !password) { setError('이메일과 비밀번호를 입력해주세요.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.accessToken);
      localStorage.setItem('role',  res.data.role);
      localStorage.setItem('name',  res.data.name);
      navigate(res.data.role === 'admin' ? '/admin' : '/main');
    } catch {
      setError('이메일 또는 비밀번호가 틀렸어요.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (e, pw) => {
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email: e, password: pw });
      localStorage.setItem('token', res.data.accessToken);
      localStorage.setItem('role',  res.data.role);
      localStorage.setItem('name',  res.data.name);
      navigate(res.data.role === 'admin' ? '/admin' : '/main');
    } catch {
      setError('로그인 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-5">

      {/* 로고 */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-[18px] bg-[#6F4E37] mb-5">
          <span className="text-white text-xl font-black tracking-wider">B</span>
        </div>
        <h1 className="text-[22px] font-bold text-[#1D1D1F] tracking-tight">BREWY에 로그인</h1>
        <p className="text-[15px] text-[#6E6E73] mt-1">계정을 사용하여 계속하세요</p>
      </div>

      {/* 폼 */}
      <div className="w-full max-w-[340px]">

        {/* 인풋 그룹 — Apple 스타일: 위아래 이어진 박스 */}
        <div className="rounded-2xl border border-[#D2D2D7] overflow-hidden mb-4 bg-white">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full px-4 py-4 text-[15px] text-[#1D1D1F] placeholder:text-[#AEAEB2] outline-none bg-transparent border-b border-[#D2D2D7]"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full px-4 py-4 text-[15px] text-[#1D1D1F] placeholder:text-[#AEAEB2] outline-none bg-transparent"
          />
        </div>

        {/* 에러 */}
        {error && (
          <p className="text-[13px] text-red-500 text-center mb-4">{error}</p>
        )}

        {/* 로그인 버튼 */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-4 bg-[#6F4E37] hover:bg-[#5C3D28] active:scale-[0.98] text-white text-[15px] font-semibold rounded-2xl transition-all duration-150 disabled:opacity-50 mb-3"
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>

        {/* 구분선 */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-[#E8E8ED]" />
          <span className="text-[12px] text-[#AEAEB2] font-medium">테스트 계정으로 체험</span>
          <div className="flex-1 h-px bg-[#E8E8ED]" />
        </div>

        {/* 테스트 계정 */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => quickLogin('test@brewy.com', '12341234')}
            disabled={loading}
            className="py-3.5 bg-[#F5F5F7] hover:bg-[#EBEBF0] active:scale-[0.98] text-[#1D1D1F] text-[13px] font-medium rounded-xl transition-all"
          >
            관리자로 체험
          </button>
          <button
            onClick={() => quickLogin('user1@brewy.com', '12341234')}
            disabled={loading}
            className="py-3.5 bg-[#F5F5F7] hover:bg-[#EBEBF0] active:scale-[0.98] text-[#1D1D1F] text-[13px] font-medium rounded-xl transition-all"
          >
            일반 유저로 체험
          </button>
        </div>

        {/* 푸터 */}
        <p className="text-center text-[12px] text-[#AEAEB2] mt-12">
          © 2026 BREWY. 박용희
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
