// src/pages/MainPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ChatBot from '../components/ChatBot';

function MainPage() {
  const navigate  = useNavigate();
  const [products,  setProducts]  = useState([]);
  const [branches,  setBranches]  = useState([]);
  const [user,      setUser]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('전체');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [userRes, productsRes, branchesRes] = await Promise.all([
        api.get('/api/users/me'),
        api.get('/api/products'),
        api.get('/api/branches'),
      ]);
      setUser(userRes.data.user);
      setProducts(productsRes.data.products);
      setBranches(branchesRes.data.branches);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    navigate('/login');
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('/uploads')) {
      return process.env.NODE_ENV === 'production' ? url : `http://localhost:8080${url}`;
    }
    return url;
  };

  const categories      = ['전체', '커피', '논커피', '디저트'];
  const filteredProducts = activeTab === '전체'
    ? products
    : products.filter(p => p.category_name === activeTab);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="text-[22px] font-black tracking-[10px] text-[#1D1D1F] mb-2">BREWY</div>
          <p className="text-[13px] text-[#AEAEB2]">잠시만 기다려주세요...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ────────────────────────────────────────
          네비게이션 — Apple 44px 극미니멀
      ──────────────────────────────────────── */}
      <header className="sticky top-0 z-50 h-11 bg-[rgba(255,255,255,0.72)] backdrop-blur-2xl border-b border-[#D2D2D7]/30"
        style={{ WebkitBackdropFilter: 'saturate(180%) blur(20px)', backdropFilter: 'saturate(180%) blur(20px)' }}
      >
        <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center justify-between">
          <span className="text-[13px] font-black tracking-[6px] text-[#1D1D1F]">BREWY</span>
          <nav className="flex items-center gap-6">
            <span className="hidden sm:block text-[13px] text-[#6E6E73]">{user?.name}님</span>
            <button onClick={() => navigate('/mypage')}
              className="text-[13px] text-[#1D1D1F] hover:text-[#6F4E37] transition-colors">
              마이페이지
            </button>
            {localStorage.getItem('role') === 'admin' && (
              <button onClick={() => navigate('/admin')}
                className="text-[13px] text-[#0071E3] hover:opacity-70 transition-opacity">
                관리자
              </button>
            )}
            <button onClick={handleLogout}
              className="text-[13px] text-[#6E6E73] hover:text-[#1D1D1F] transition-colors">
              로그아웃
            </button>
          </nav>
        </div>
      </header>

      {/* ────────────────────────────────────────
          히어로 — 컬러 커피 이미지 + 그라데이션
      ──────────────────────────────────────── */}
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          minHeight: '620px',
          backgroundImage: 'url(https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1800&q=80&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* 상단 얇게 → 하단 진하게 — 텍스트만 읽히도록 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/40 to-black/70" />

        <div className="relative z-10 text-center text-white px-6 py-28">
          <p className="text-[11px] font-semibold tracking-[6px] text-white/40 uppercase mb-8">
            BREWY CAFE
          </p>
          <h2 className="text-[64px] sm:text-[80px] md:text-[96px] font-bold leading-[1.02] tracking-tight mb-6">
            오늘의 한 잔.
          </h2>
          <p className="text-[19px] text-white/55 font-light mb-12 max-w-[500px] mx-auto leading-relaxed">
            미리 주문하고 대기 없이<br className="sm:hidden" /> 바로 픽업하세요
          </p>
          <a href="#menu"
            className="inline-flex items-center gap-1.5 text-[17px] text-white/70 hover:text-white transition-colors group">
            메뉴 보기
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">›</span>
          </a>
        </div>
      </div>

      {/* ────────────────────────────────────────
          지점 안내 — 순백 배경, 대형 헤드라인
      ──────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="max-w-[1200px] mx-auto px-6">

          <div className="mb-12">
            <h2 className="text-[34px] font-bold text-[#1D1D1F] tracking-tight mb-2">
              지점 안내
            </h2>
            <p className="text-[16px] text-[#6E6E73]">
              브루이 카페 전국 지점에서 픽업 주문이 가능합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {branches.map(b => (
              <div key={b.branch_id}
                className="bg-[#F5F5F7] rounded-[20px] p-8 hover:shadow-[0_8px_40px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-300 cursor-default">
                <h3 className="text-[16px] font-semibold text-[#1D1D1F] mb-1.5">{b.name}</h3>
                <p className="text-[13px] text-[#6E6E73] leading-relaxed mb-4">{b.address}</p>
                <div className="space-y-1 mb-5">
                  <p className="text-[13px] text-[#AEAEB2]">{b.phone}</p>
                  <p className="text-[13px] text-[#AEAEB2]">{b.open_time} – {b.close_time}</p>
                </div>
                <span className="inline-block px-3 py-1 bg-green-50 text-green-600 text-[12px] font-medium rounded-full">
                  영업중
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────
          메뉴 — 연회색 배경, 깔끔한 카드
      ──────────────────────────────────────── */}
      <section id="menu" className="bg-[#F5F5F7] py-20">
        <div className="max-w-[1200px] mx-auto px-6">

          <div className="mb-10">
            <h2 className="text-[34px] font-bold text-[#1D1D1F] tracking-tight mb-2">
              메뉴
            </h2>
            <p className="text-[16px] text-[#6E6E73]">
              브루이의 시그니처 메뉴를 만나보세요.
            </p>
          </div>

          {/* 카테고리 탭 */}
          <div className="flex gap-2 mb-10 flex-wrap">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveTab(cat)}
                className={`px-5 py-2 rounded-full text-[14px] font-medium transition-all duration-200 ${
                  activeTab === cat
                    ? 'bg-[#1D1D1F] text-white'
                    : 'bg-white text-[#6E6E73] hover:text-[#1D1D1F] shadow-[0_1px_4px_rgba(0,0,0,0.08)]'
                }`}>
                {cat}
              </button>
            ))}
          </div>

          {/* 메뉴 그리드 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredProducts.map(p => (
              <div key={p.product_id}
                className={`bg-white rounded-[20px] overflow-hidden hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)] transition-all duration-300 ${
                  p.is_sold_out === 1 ? 'opacity-50' : ''
                }`}>

                {/* 이미지 */}
                <div className="relative h-44 overflow-hidden">
                  {getImageUrl(p.image_url) ? (
                    <img
                      src={getImageUrl(p.image_url)}
                      alt={p.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#F5F5F7] flex items-center justify-center">
                      <span className="text-4xl opacity-20">☕</span>
                    </div>
                  )}
                  {p.is_sold_out === 1 && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                      <span className="bg-[#1D1D1F] text-white text-[11px] font-bold px-4 py-1.5 rounded-full tracking-wide">
                        SOLD OUT
                      </span>
                    </div>
                  )}
                </div>

                {/* 정보 */}
                <div className="p-4">
                  <h3 className="text-[14px] font-semibold text-[#1D1D1F] mb-1.5 leading-snug">
                    {p.name}
                  </h3>
                  <p className="text-[13px] text-[#6E6E73]">
                    {p.price?.toLocaleString()}원
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-[#F5F5F7] border-t border-[#D2D2D7]/30 py-10">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
          <span className="text-[12px] font-black tracking-[6px] text-[#1D1D1F]">BREWY</span>
          <p className="text-[12px] text-[#AEAEB2]">© 2026 BREWY. 박용희</p>
        </div>
      </footer>

      <ChatBot />
    </div>
  );
}

export default MainPage;
