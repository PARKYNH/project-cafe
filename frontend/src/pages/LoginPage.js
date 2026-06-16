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
    <div className="flex min-h-screen font-sans">

      {/* ── 왼쪽 — 커피 이미지 패널 ── */}
      <div
        className="hidden lg:flex lg:w-[52%] relative flex-col items-center justify-center overflow-hidden"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200&q=85&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* 오버레이 — 위쪽은 투명, 아래쪽만 어둡게 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* 브랜드 텍스트 — 하단 고정 */}
        <div className="absolute bottom-12 left-10 right-10 text-white">
          <h1 className="text-[15px] font-black tracking-[8px] mb-6 opacity-90">BREWY</h1>
          <p className="text-[28px] font-bold leading-snug tracking-tight mb-3">
            당신의 하루를<br />향기롭게
          </p>
          <p className="text-[14px] text-white/60 leading-relaxed">
            브루이 카페 픽업 주문 서비스
          </p>
        </div>
      </div>

      {/* ── 오른쪽 — Apple ID 스타일 폼 ── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-[340px]">

          {/* 로고 (모바일에서만 표시) */}
          <div className="lg:hidden text-center mb-10">
            <h1 className="text-[20px] font-black tracking-[8px] text-[#1D1D1F]">BREWY</h1>
          </div>

          {/* 타이틀 */}
          <div className="mb-8">
            <h2 className="text-[26px] font-bold text-[#1D1D1F] tracking-tight mb-1">로그인</h2>
            <p className="text-[15px] text-[#6E6E73]">계정을 사용하여 계속하세요</p>
          </div>

          {/* 인풋 그룹 — 위아래 이어진 박스 */}
          <div className="rounded-2xl border border-[#D2D2D7] overflow-hidden mb-4 bg-[#FAFAFA]">
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-4 text-[15px] text-[#1D1D1F] placeholder:text-[#C7C7CC] outline-none bg-transparent border-b border-[#D2D2D7] focus:bg-white transition-colors"
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-4 text-[15px] text-[#1D1D1F] placeholder:text-[#C7C7CC] outline-none bg-transparent focus:bg-white transition-colors"
            />
          </div>

          {/* 에러 */}
          {error && (
            <p className="text-[13px] text-[#FF3B30] mb-4 px-1">{error}</p>
          )}

          {/* 로그인 버튼 */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-[14px] bg-[#1D1D1F] hover:bg-[#3A3A3C] active:scale-[0.99] text-white text-[15px] font-semibold rounded-2xl transition-all duration-150 disabled:opacity-40 mb-3"
          >
            {loading ? '로그인 중...' : '계속'}
          </button>

          {/* 구분선 */}
          <div className="flex items-center gap-3 my-7">
            <div className="flex-1 h-px bg-[#E8E8ED]" />
            <span className="text-[12px] text-[#C7C7CC]">테스트 계정</span>
            <div className="flex-1 h-px bg-[#E8E8ED]" />
          </div>

          {/* 테스트 계정 */}
          <div className="grid grid-cols-2 gap-2">
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

          <p className="text-center text-[12px] text-[#C7C7CC] mt-10">
            © 2026 BREWY. 박용희
          </p>
        </div>
      </div>

    </div>
  );
}

export default LoginPage;
