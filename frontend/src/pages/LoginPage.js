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
      if (res.data.role === 'admin') navigate('/admin');
      else navigate('/main');
    } catch {
      setError('이메일 또는 비밀번호가 틀렸어요!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F5F5F7] font-sans">

      {/* ── 왼쪽: 브랜드 패널 ── */}
      <div
        className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1400&q=90&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* 그라디언트 오버레이 — 아래로 갈수록 진하게 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/55" />

        {/* 브랜드 콘텐츠 */}
        <div className="relative z-10 text-white text-center px-16 max-w-md">
          <p className="text-xs font-semibold tracking-[5px] text-white/60 mb-6 uppercase">Premium Coffee</p>
          <h1 className="text-7xl font-black tracking-[12px] text-white mb-5 drop-shadow-lg">
            BREWY
          </h1>
          <p className="text-base text-white/75 leading-relaxed mb-12">
            당신의 하루를 향기롭게,<br />
            브루이 카페 픽업 주문 서비스
          </p>
          <div className="flex flex-col gap-3 items-center">
            {['간편한 사전 주문', '대기 없이 바로 픽업', '스탬프 적립 & 쿠폰 혜택'].map(f => (
              <div
                key={f}
                className="px-6 py-2.5 rounded-full text-sm text-white/85 bg-white/10 backdrop-blur-md border border-white/15 tracking-wide"
              >
                ✓ {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 오른쪽: 로그인 폼 ── */}
      <div className="w-full lg:w-[500px] flex items-center justify-center px-12 bg-white">
        <div className="w-full max-w-[380px]">

          {/* 모바일 로고 */}
          <div className="lg:hidden text-center text-2xl font-black tracking-widest text-[#1D1D1F] mb-10">
            BREWY
          </div>

          {/* 타이틀 */}
          <div className="mb-10">
            <h2 className="text-[2rem] font-bold text-[#1D1D1F] mb-2 tracking-tight">로그인</h2>
            <p className="text-sm text-[#86868B]">계정에 로그인하여 주문을 시작하세요</p>
          </div>

          {/* 이메일 */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-[#1D1D1F] mb-2">
              이메일
            </label>
            <input
              type="email"
              placeholder="example@brewy.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleLogin()}
              className="w-full px-5 py-4 rounded-2xl border border-[#D2D2D7] text-sm text-[#1D1D1F] outline-none transition-all duration-200 focus:border-[#6F4E37] focus:ring-4 focus:ring-[#6F4E37]/10 bg-[#F5F5F7] placeholder:text-[#AEAEB2]"
            />
          </div>

          {/* 비밀번호 */}
          <div className="mb-7">
            <label className="block text-sm font-semibold text-[#1D1D1F] mb-2">
              비밀번호
            </label>
            <input
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleLogin()}
              className="w-full px-5 py-4 rounded-2xl border border-[#D2D2D7] text-sm text-[#1D1D1F] outline-none transition-all duration-200 focus:border-[#6F4E37] focus:ring-4 focus:ring-[#6F4E37]/10 bg-[#F5F5F7] placeholder:text-[#AEAEB2]"
            />
          </div>

          {/* 에러 */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-2xl px-5 py-3.5 mb-5 text-sm text-red-600">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* 로그인 버튼 */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-4 bg-[#6F4E37] hover:bg-[#5C3D28] active:bg-[#4A2C17] text-white font-semibold text-base rounded-2xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mb-7 shadow-sm"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>

          {/* 구분선 */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-[#E8E8ED]" />
            <span className="text-xs text-[#AEAEB2] font-medium">테스트 계정</span>
            <div className="flex-1 h-px bg-[#E8E8ED]" />
          </div>

          {/* 테스트 버튼 */}
          <div className="flex gap-3 mb-10">
            <button
              onClick={() => { setEmail('test@brewy.com'); setPassword('12341234'); }}
              className="flex-1 py-3 bg-[#F5F5F7] hover:bg-[#EBEBF0] text-[#1D1D1F] text-xs font-semibold rounded-2xl border border-[#E8E8ED] transition-all duration-200"
            >
              👨‍💼 관리자로 체험
            </button>
            <button
              onClick={() => { setEmail('user1@brewy.com'); setPassword('12341234'); }}
              className="flex-1 py-3 bg-[#F5F5F7] hover:bg-[#EBEBF0] text-[#1D1D1F] text-xs font-semibold rounded-2xl border border-[#E8E8ED] transition-all duration-200"
            >
              👤 일반 유저로 체험
            </button>
          </div>

          <p className="text-center text-xs text-[#AEAEB2]">© 2026 BREWY. 박용희</p>
        </div>
      </div>

    </div>
  );
}

export default LoginPage;
