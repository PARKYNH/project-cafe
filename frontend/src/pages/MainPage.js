// src/pages/MainPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ChatBot from '../components/ChatBot';

function MainPage() {
  const navigate = useNavigate();
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
        api.get('/api/branches')
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
      return process.env.NODE_ENV === 'production'
        ? url : `http://localhost:8080${url}`;
    }
    return url;
  };

  const categories = ['전체', '커피', '논커피', '디저트'];
  const filteredProducts = activeTab === '전체'
    ? products
    : products.filter(p => p.category_name === activeTab);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F5F5F7]">
        <div className="text-center">
          <div className="text-4xl font-black tracking-[10px] text-[#1D1D1F] mb-4">BREWY</div>
          <p className="text-sm text-[#86868B]">잠시만 기다려주세요...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] font-sans">

      {/* ── 헤더 — Apple 스타일 슬림 네비 ── */}
      <header className="sticky top-0 z-50 bg-[rgba(255,255,255,0.78)] backdrop-blur-2xl border-b border-black/5">
        <div className="max-w-6xl mx-auto px-8 h-12 flex items-center justify-between">
          <h1 className="text-lg font-black tracking-[6px] text-[#1D1D1F]">BREWY</h1>
          <nav className="flex items-center gap-1">
            <span className="hidden sm:block text-sm text-[#86868B] mr-3">
              안녕하세요, <span className="font-medium text-[#1D1D1F]">{user?.name}</span>님
            </span>
            <button
              onClick={() => navigate('/mypage')}
              className="px-4 py-1.5 text-sm text-[#1D1D1F] hover:text-[#6F4E37] rounded-full transition-colors"
            >
              마이페이지
            </button>
            {localStorage.getItem('role') === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                className="px-4 py-1.5 text-sm text-[#0071E3] hover:text-[#0077ED] rounded-full transition-colors"
              >
                관리자
              </button>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-1.5 text-sm text-[#86868B] hover:text-[#1D1D1F] rounded-full transition-colors"
            >
              로그아웃
            </button>
          </nav>
        </div>
      </header>

      {/* ── 히어로 — 풀 임팩트 ── */}
      <div
        className="relative h-[480px] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600&q=90&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/45 to-black/60" />
        <div className="relative z-10 text-center text-white px-8">
          <p className="text-xs font-semibold tracking-[5px] text-white/60 mb-4 uppercase">BREWY CAFE</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-5 leading-tight tracking-tight drop-shadow-md">
            오늘의 한 잔,<br />미리 주문하고 바로 픽업
          </h2>
          <p className="text-base text-white/65 tracking-wide">대기 없이 편리하게, 브루이 카페의 시그니처 메뉴를 만나보세요</p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-8 py-16">

        {/* ── 지점 안내 ── */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">지점 안내</h2>
            <span className="text-sm text-[#86868B]">{branches.length}개 지점 운영중</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {branches.map(b => (
              <div
                key={b.branch_id}
                className="bg-white rounded-3xl p-7 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-[#F0F0F0] hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-all duration-300"
              >
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 bg-[#F5F5F7] rounded-2xl flex items-center justify-center text-xl flex-shrink-0">
                    📍
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1D1D1F] text-base">{b.name}</h3>
                    <p className="text-xs text-[#86868B] mt-1 leading-relaxed">{b.address}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 mb-4">
                  <span className="text-xs text-[#86868B] flex items-center gap-2">
                    <span>📞</span> {b.phone}
                  </span>
                  <span className="text-xs text-[#86868B] flex items-center gap-2">
                    <span>🕐</span> {b.open_time} ~ {b.close_time}
                  </span>
                </div>
                <span className="inline-block px-3 py-1 bg-green-50 text-green-600 text-xs font-semibold rounded-full">
                  영업중
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── 메뉴 ── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">메뉴</h2>
            <span className="text-sm text-[#86868B]">{filteredProducts.length}개</span>
          </div>

          {/* 카테고리 탭 */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  activeTab === cat
                    ? 'bg-[#1D1D1F] text-white shadow-sm'
                    : 'bg-white text-[#86868B] border border-[#E8E8ED] hover:border-[#1D1D1F] hover:text-[#1D1D1F]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* 메뉴 그리드 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredProducts.map(p => (
              <div
                key={p.product_id}
                className={`bg-white rounded-3xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-[#F0F0F0] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] ${
                  p.is_sold_out === 1 ? 'opacity-50' : ''
                }`}
              >
                {/* 이미지 */}
                <div className="relative">
                  {getImageUrl(p.image_url) ? (
                    <img
                      src={getImageUrl(p.image_url)}
                      alt={p.name}
                      className="w-full h-52 object-cover"
                    />
                  ) : (
                    <div className="w-full h-52 bg-gradient-to-br from-[#F5F5F7] to-[#EBEBF0] flex items-center justify-center text-5xl">
                      ☕
                    </div>
                  )}
                  {p.is_sold_out === 1 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-white text-[#1D1D1F] text-xs font-bold px-4 py-1.5 rounded-full">
                        품절
                      </span>
                    </div>
                  )}
                </div>

                {/* 정보 */}
                <div className="p-5">
                  <span className="inline-block px-2.5 py-1 bg-[#F5F5F7] text-[#86868B] text-xs rounded-full mb-2.5">
                    {p.category_name}
                  </span>
                  <h3 className="font-semibold text-[#1D1D1F] text-base mb-1.5 leading-snug">{p.name}</h3>
                  <p className="text-xs text-[#AEAEB2] mb-3 line-clamp-2 leading-relaxed">{p.description}</p>
                  <p className="font-bold text-[#1D1D1F] text-lg">
                    {p.price?.toLocaleString()}원
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      <ChatBot />
    </div>
  );
}

export default MainPage;
