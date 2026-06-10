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
  const [hoveredId, setHoveredId] = useState(null);

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

  const categories = ['전체', '커피', '논커피', '디저트'];

  const filteredProducts = activeTab === '전체'
    ? products
    : products.filter(p => p.category_name === activeTab);

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.loadingInner}>
          <div style={styles.loadingLogo}>BREWY</div>
          <p style={styles.loadingText}>잠시만 기다려주세요...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>

      {/* ── 헤더 ── */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <h1 style={styles.logo}>BREWY</h1>
          <nav style={styles.nav}>
            <span style={styles.greeting}>안녕하세요, <b>{user?.name}</b>님 👋</span>
            <button style={styles.navBtn} onClick={() => navigate('/mypage')}>마이페이지</button>
            {localStorage.getItem('role') === 'admin' && (
              <button style={{ ...styles.navBtn, ...styles.adminBtn }} onClick={() => navigate('/admin')}>
                관리자
              </button>
            )}
            <button style={styles.logoutBtn} onClick={handleLogout}>로그아웃</button>
          </nav>
        </div>
      </header>

      {/* ── 히어로 배너 ── */}
      <div style={styles.hero}>
        <div style={styles.heroOverlay} />
        <div style={styles.heroContent}>
          <p style={styles.heroSub}>BREWY CAFE</p>
          <h2 style={styles.heroTitle}>
            오늘의 한 잔,<br />미리 주문하고 바로 픽업
          </h2>
          <p style={styles.heroDesc}>대기 없이 편리하게, 브루이 카페의 시그니처 메뉴를 만나보세요</p>
        </div>
      </div>

      <main style={styles.main}>

        {/* ── 지점 목록 ── */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>📍 지점 안내</h2>
            <span style={styles.sectionCount}>{branches.length}개 지점 운영중</span>
          </div>
          <div style={styles.branchGrid}>
            {branches.map(branch => (
              <div key={branch.branch_id} style={styles.branchCard}>
                <div style={styles.branchTop}>
                  <div style={styles.branchIcon}>📍</div>
                  <div>
                    <h3 style={styles.branchName}>{branch.name}</h3>
                    <p style={styles.branchAddress}>{branch.address}</p>
                  </div>
                </div>
                <div style={styles.branchInfo}>
                  <span style={styles.branchInfoItem}>📞 {branch.phone}</span>
                  <span style={styles.branchInfoItem}>🕐 {branch.open_time} ~ {branch.close_time}</span>
                </div>
                <div style={styles.branchBadge}>영업중</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 메뉴 ── */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>☕ 메뉴</h2>
            <span style={styles.sectionCount}>{filteredProducts.length}개</span>
          </div>

          {/* 카테고리 탭 */}
          <div style={styles.tabs}>
            {categories.map(cat => (
              <button
                key={cat}
                style={{
                  ...styles.tab,
                  ...(activeTab === cat ? styles.tabActive : {})
                }}
                onClick={() => setActiveTab(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* 메뉴 그리드 */}
          <div style={styles.menuGrid}>
            {filteredProducts.map(product => (
              <div
                key={product.product_id}
                style={{
                  ...styles.menuCard,
                  opacity: product.is_sold_out === 1 ? 0.55 : 1,
                  transform: hoveredId === product.product_id ? 'translateY(-6px)' : 'translateY(0)',
                  boxShadow: hoveredId === product.product_id
                    ? '0 12px 32px rgba(111,78,55,0.18)'
                    : '0 2px 12px rgba(0,0,0,0.07)'
                }}
                onMouseEnter={() => setHoveredId(product.product_id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* 이미지 */}
                {product.image_url ? (
                  <img
                    src={product.image_url.startsWith('/uploads')
                      ? `http://localhost:8080${product.image_url}`
                      : product.image_url}
                    alt={product.name}
                    style={styles.menuImg}
                  />
                ) : (
                  <div style={styles.menuImgPlaceholder}>☕</div>
                )}

                {/* 품절 뱃지 */}
                {product.is_sold_out === 1 && (
                  <div style={styles.soldoutBadge}>품절</div>
                )}

                <div style={styles.menuBody}>
                  <span style={styles.categoryBadge}>{product.category_name}</span>
                  <h3 style={styles.menuName}>{product.name}</h3>
                  <p style={styles.menuDesc}>{product.description}</p>
                  <p style={styles.menuPrice}>{product.price?.toLocaleString()}원</p>
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

const BROWN = '#6f4e37';
const LIGHT = '#f5ede6';

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f7f4f1', fontFamily: "'Segoe UI', sans-serif" },

  /* 로딩 */
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: LIGHT },
  loadingInner: { textAlign: 'center' },
  loadingLogo: { fontSize: '36px', fontWeight: '800', color: BROWN, letterSpacing: '6px' },
  loadingText: { color: '#999', marginTop: '12px' },

  /* 헤더 */
  header: {
    position: 'sticky', top: 0, zIndex: 100,
    backgroundColor: 'white',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
  },
  headerInner: {
    maxWidth: '1200px', margin: '0 auto',
    padding: '16px 32px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  },
  logo: { margin: 0, fontSize: '24px', fontWeight: '800', color: BROWN, letterSpacing: '4px' },
  nav: { display: 'flex', alignItems: 'center', gap: '12px' },
  greeting: { fontSize: '14px', color: '#666' },
  navBtn: {
    padding: '8px 18px', backgroundColor: LIGHT, color: BROWN,
    border: 'none', borderRadius: '20px', cursor: 'pointer',
    fontSize: '13px', fontWeight: '600'
  },
  adminBtn: { backgroundColor: BROWN, color: 'white' },
  logoutBtn: {
    padding: '8px 18px', backgroundColor: 'transparent', color: '#999',
    border: '1px solid #ddd', borderRadius: '20px', cursor: 'pointer', fontSize: '13px'
  },

  /* 히어로 */
  hero: {
    position: 'relative', height: '320px',
    backgroundImage: 'url(https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=1400)',
    backgroundSize: 'cover', backgroundPosition: 'center'
  },
  heroOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(40,20,8,0.62)' },
  heroContent: {
    position: 'relative', zIndex: 1,
    height: '100%', display: 'flex', flexDirection: 'column',
    justifyContent: 'center', padding: '0 10%', color: 'white'
  },
  heroSub: { fontSize: '13px', letterSpacing: '4px', color: 'rgba(255,255,255,0.7)', margin: '0 0 12px' },
  heroTitle: { fontSize: '36px', fontWeight: '800', margin: '0 0 12px', lineHeight: 1.3 },
  heroDesc: { fontSize: '15px', color: 'rgba(255,255,255,0.8)', margin: 0 },

  /* 메인 */
  main: { maxWidth: '1200px', margin: '0 auto', padding: '48px 32px' },
  section: { marginBottom: '56px' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' },
  sectionTitle: { margin: 0, fontSize: '22px', fontWeight: '700', color: '#1a1a1a' },
  sectionCount: {
    fontSize: '13px', color: BROWN, backgroundColor: LIGHT,
    padding: '4px 12px', borderRadius: '20px', fontWeight: '600'
  },

  /* 지점 */
  branchGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' },
  branchCard: {
    backgroundColor: 'white', borderRadius: '16px',
    padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    position: 'relative', overflow: 'hidden',
    borderTop: `4px solid ${BROWN}`
  },
  branchTop: { display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '16px' },
  branchIcon: { fontSize: '28px' },
  branchName: { margin: '0 0 4px', fontSize: '17px', fontWeight: '700', color: '#1a1a1a' },
  branchAddress: { margin: 0, fontSize: '13px', color: '#888' },
  branchInfo: { display: 'flex', flexDirection: 'column', gap: '6px' },
  branchInfoItem: { fontSize: '13px', color: '#666' },
  branchBadge: {
    position: 'absolute', top: '20px', right: '20px',
    backgroundColor: '#e8f5e9', color: '#2e7d32',
    fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px'
  },

  /* 카테고리 탭 */
  tabs: { display: 'flex', gap: '8px', marginBottom: '24px' },
  tab: {
    padding: '8px 22px', border: '1.5px solid #e0e0e0',
    borderRadius: '20px', backgroundColor: 'white',
    color: '#666', fontSize: '14px', fontWeight: '600',
    cursor: 'pointer', transition: 'all 0.2s'
  },
  tabActive: { backgroundColor: BROWN, borderColor: BROWN, color: 'white' },

  /* 메뉴 */
  menuGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' },
  menuCard: {
    backgroundColor: 'white', borderRadius: '16px',
    overflow: 'hidden', position: 'relative',
    transition: 'all 0.25s ease', cursor: 'pointer'
  },
  menuImg: { width: '100%', height: '180px', objectFit: 'cover' },
  menuImgPlaceholder: {
    width: '100%', height: '180px', backgroundColor: LIGHT,
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px'
  },
  soldoutBadge: {
    position: 'absolute', top: '12px', right: '12px',
    backgroundColor: '#ff4444', color: 'white',
    fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px'
  },
  menuBody: { padding: '16px' },
  categoryBadge: {
    backgroundColor: LIGHT, color: BROWN,
    fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px'
  },
  menuName: { margin: '8px 0 4px', fontSize: '16px', fontWeight: '700', color: '#1a1a1a' },
  menuDesc: { margin: '0 0 8px', fontSize: '13px', color: '#999', lineHeight: 1.5 },
  menuPrice: { margin: 0, fontSize: '18px', fontWeight: '800', color: BROWN }
};

export default MainPage;
