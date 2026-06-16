// src/pages/KakaoCallback.js
// 카카오 로그인 성공 후 백엔드가 리다이렉트하는 페이지
// URL: /auth/kakao/success?token=JWT&name=이름&role=user|admin
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function KakaoCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get('token');
    const name   = params.get('name');
    const role   = params.get('role');
    const error  = params.get('error');

    if (error || !token) {
      navigate('/login?error=kakao_failed');
      return;
    }

    localStorage.setItem('token', token);
    localStorage.setItem('name',  name  || '');
    localStorage.setItem('role',  role  || 'user');

    navigate(role === 'admin' ? '/admin' : '/main', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-[#FEE500] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[15px] text-[#6E6E73]">카카오 로그인 처리 중...</p>
      </div>
    </div>
  );
}

export default KakaoCallback;
