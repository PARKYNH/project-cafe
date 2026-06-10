// src/pages/MyPage.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function MyPage() {
  const navigate = useNavigate();
  const [user,       setUser]       = useState(null);
  const [stampCount, setStampCount] = useState(null);
  const [coupons,    setCoupons]    = useState([]);
  const [orders,     setOrders]     = useState([]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [userRes, stampCountRes, couponsRes, ordersRes] = await Promise.all([
        api.get('/api/users/me'),
        api.get('/api/stamps/count'),
        api.get('/api/coupons'),
        api.get('/api/orders')
      ]);
      setUser(userRes.data.user);
      setStampCount(stampCountRes.data.data);
      setCoupons(couponsRes.data.coupons);
      setOrders(ordersRes.data.orders);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('주문을 취소할까요?')) return;
    try {
      await api.patch(`/api/orders/${orderId}/cancel`);
      alert('주문이 취소됐어요!');
      fetchData();
    } catch {
      alert('취소 실패했어요!');
    }
  };

  const statusMap = {
    pending:   { label: '대기중',   color: '#ff9800', bg: '#fff8e1' },
    paid:      { label: '결제완료', color: '#2196f3', bg: '#e3f2fd' },
    making:    { label: '제조중',   color: '#9c27b0', bg: '#f3e5f5' },
    ready:     { label: '픽업대기', color: '#00bcd4', bg: '#e0f7fa' },
    done:      { label: '완료',     color: '#4caf50', bg: '#e8f5e9' },
    cancelled: { label: '취소됨',   color: '#999',    bg: '#f5f5f5' }
  };

  const stampNum  = stampCount?.stampCount || 0;
  const stampGoal = 10;
  const progress  = Math.min((stampNum / stampGoal) * 100, 100);

  const initials = user?.name?.charAt(0) || '?';
  const activeCoupons = coupons.filter(c => c.status === 'active').length;

  return (
    <div style={styles.container}>

      {/* ── 헤더 ── */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <button style={styles.backBtn} onClick={() => navigate('/main')}>
            ← 메인으로
          </button>
          <h1 style={styles.headerTitle}>마이페이지</h1>
          <div style={{ width: '100px' }} />
        </div>
      </header>

      <main style={styles.main}>

        {/* ── 프로필 카드 ── */}
        <div style={styles.profileCard}>
          <div style={styles.profileLeft}>
            <div style={styles.avatar}>{initials}</div>
            <div>
              <h2 style={styles.profileName}>{user?.name}님</h2>
              <p style={styles.profileEmail}>{user?.email}</p>
              <span style={styles.profileBadge}>일반회원</span>
            </div>
          </div>
          <div style={styles.profileStats}>
            <div style={styles.profileStat}>
              <span style={styles.statNum}>{stampNum}</span>
              <span style={styles.statLabel}>스탬프</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.profileStat}>
              <span style={styles.statNum}>{activeCoupons}</span>
              <span style={styles.statLabel}>사용가능 쿠폰</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.profileStat}>
              <span style={styles.statNum}>{orders.length}</span>
              <span style={styles.statLabel}>주문내역</span>
            </div>
          </div>
        </div>

        {/* ── 스탬프 ── */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>⭐ 스탬프 카드</h2>
          <div style={styles.stampCard}>
            <div style={styles.stampHeader}>
              <div>
                <span style={styles.stampBig}>{stampNum}</span>
                <span style={styles.stampSlash}> / {stampGoal}</span>
              </div>
              <p style={styles.stampMsg}>{stampCount?.message || '주문하면 스탬프가 적립돼요!'}</p>
            </div>

            {/* 프로그레스바 */}
            <div style={styles.progressBg}>
              <div style={{ ...styles.progressFill, width: `${progress}%` }} />
            </div>
            <p style={styles.progressLabel}>{stampGoal - stampNum > 0 ? `쿠폰까지 ${stampGoal - stampNum}개 남았어요` : '🎉 쿠폰 발급 완료!'}</p>

            {/* 스탬프 아이콘 10개 */}
            <div style={styles.stampRow}>
              {[...Array(stampGoal)].map((_, i) => (
                <div key={i} style={{
                  ...styles.stampDot,
                  backgroundColor: i < stampNum ? '#6f4e37' : '#f0e8e0',
                  transform: i < stampNum ? 'scale(1.1)' : 'scale(1)'
                }}>
                  {i < stampNum ? '☕' : '○'}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 쿠폰 ── */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>🎫 보유 쿠폰 <span style={styles.badge}>{activeCoupons}개 사용가능</span></h2>
          {coupons.length === 0 ? (
            <div style={styles.empty}>
              <p style={styles.emptyIcon}>🎫</p>
              <p>보유한 쿠폰이 없어요</p>
              <p style={styles.emptyHint}>스탬프 10개를 모으면 쿠폰이 발급돼요!</p>
            </div>
          ) : (
            <div style={styles.couponList}>
              {coupons.map(coupon => (
                <div key={coupon.coupon_id} style={{
                  ...styles.couponCard,
                  opacity: coupon.status !== 'active' ? 0.55 : 1
                }}>
                  <div style={styles.couponLeft}>
                    <div style={styles.couponIconBox}>🎁</div>
                    <div>
                      <p style={styles.couponCode}>{coupon.coupon_code}</p>
                      <p style={styles.couponExp}>만료: {coupon.expired_at?.substring(0, 10)}</p>
                    </div>
                  </div>
                  <div style={styles.couponRight}>
                    <span style={{
                      ...styles.couponBadge,
                      backgroundColor: coupon.status === 'active' ? '#e8f5e9' : '#f5f5f5',
                      color: coupon.status === 'active' ? '#2e7d32' : '#999'
                    }}>
                      {coupon.status === 'active' ? '사용가능' : coupon.status === 'used' ? '사용완료' : '만료'}
                    </span>
                  </div>
                  {coupon.status === 'active' && <div style={styles.couponDot} />}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── 주문 내역 ── */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>📦 주문 내역 <span style={styles.badge}>{orders.length}건</span></h2>
          {orders.length === 0 ? (
            <div style={styles.empty}>
              <p style={styles.emptyIcon}>📦</p>
              <p>주문 내역이 없어요</p>
            </div>
          ) : (
            <div style={styles.orderList}>
              {orders.map(order => {
                const s = statusMap[order.status] || statusMap.cancelled;
                return (
                  <div key={order.order_id} style={styles.orderCard}>
                    <div style={styles.orderTop}>
                      <div>
                        <span style={styles.orderNum}>{order.order_number}</span>
                        <span style={styles.orderDate}>{order.created_at?.substring(0, 10)}</span>
                      </div>
                      <span style={{ ...styles.orderStatus, color: s.color, backgroundColor: s.bg }}>
                        {s.label}
                      </span>
                    </div>
                    <div style={styles.orderMid}>
                      <span style={styles.orderBranch}>📍 {order.branch_name}</span>
                      <span style={styles.orderPrice}>{order.total_price?.toLocaleString()}원</span>
                    </div>
                    {order.status === 'pending' && (
                      <button style={styles.cancelBtn} onClick={() => handleCancelOrder(order.order_id)}>
                        주문 취소
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

const BROWN = '#6f4e37';
const LIGHT = '#f5ede6';

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f7f4f1', fontFamily: "'Segoe UI', sans-serif" },

  header: { backgroundColor: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100 },
  headerInner: { maxWidth: '800px', margin: '0 auto', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { margin: 0, fontSize: '18px', fontWeight: '700', color: '#1a1a1a' },
  backBtn: { padding: '8px 18px', backgroundColor: LIGHT, color: BROWN, border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },

  main: { maxWidth: '800px', margin: '0 auto', padding: '32px' },

  /* 프로필 */
  profileCard: {
    background: `linear-gradient(135deg, ${BROWN} 0%, #3d2b1f 100%)`,
    borderRadius: '20px', padding: '28px 32px',
    marginBottom: '32px', color: 'white',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    flexWrap: 'wrap', gap: '20px'
  },
  profileLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  avatar: {
    width: '60px', height: '60px', borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '24px', fontWeight: '700', color: 'white'
  },
  profileName: { margin: '0 0 4px', fontSize: '20px', fontWeight: '700' },
  profileEmail: { margin: '0 0 8px', fontSize: '13px', color: 'rgba(255,255,255,0.7)' },
  profileBadge: { backgroundColor: 'rgba(255,255,255,0.2)', fontSize: '11px', padding: '3px 10px', borderRadius: '20px' },
  profileStats: { display: 'flex', alignItems: 'center', gap: '20px' },
  profileStat: { textAlign: 'center' },
  statNum: { display: 'block', fontSize: '28px', fontWeight: '800' },
  statLabel: { fontSize: '11px', color: 'rgba(255,255,255,0.7)' },
  statDivider: { width: '1px', height: '40px', backgroundColor: 'rgba(255,255,255,0.2)' },

  /* 섹션 */
  section: { marginBottom: '36px' },
  sectionTitle: { fontSize: '18px', fontWeight: '700', color: '#1a1a1a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' },
  badge: { fontSize: '12px', backgroundColor: LIGHT, color: BROWN, padding: '3px 10px', borderRadius: '20px', fontWeight: '600' },

  /* 스탬프 */
  stampCard: { backgroundColor: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  stampHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' },
  stampBig: { fontSize: '52px', fontWeight: '800', color: BROWN },
  stampSlash: { fontSize: '20px', color: '#ccc' },
  stampMsg: { color: '#888', fontSize: '14px', margin: 0 },
  progressBg: { backgroundColor: '#f0e8e0', borderRadius: '99px', height: '8px', marginBottom: '8px' },
  progressFill: { backgroundColor: BROWN, height: '8px', borderRadius: '99px', transition: 'width 0.6s ease' },
  progressLabel: { fontSize: '12px', color: '#888', marginBottom: '20px' },
  stampRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  stampDot: {
    width: '44px', height: '44px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '18px', transition: 'all 0.2s'
  },

  /* 쿠폰 */
  couponList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  couponCard: {
    backgroundColor: 'white', borderRadius: '14px', padding: '18px 20px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    position: 'relative', overflow: 'hidden',
    borderLeft: `4px solid ${BROWN}`
  },
  couponLeft: { display: 'flex', alignItems: 'center', gap: '14px' },
  couponIconBox: { fontSize: '32px' },
  couponCode: { margin: '0 0 4px', fontWeight: '700', fontSize: '14px', color: '#1a1a1a' },
  couponExp: { margin: 0, fontSize: '12px', color: '#999' },
  couponRight: {},
  couponBadge: { fontSize: '12px', fontWeight: '600', padding: '5px 14px', borderRadius: '20px' },
  couponDot: {
    position: 'absolute', right: '70px', top: '50%', transform: 'translateY(-50%)',
    width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4caf50'
  },

  /* 주문 */
  orderList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  orderCard: { backgroundColor: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  orderTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' },
  orderNum: { display: 'block', fontWeight: '700', fontSize: '14px', color: '#1a1a1a' },
  orderDate: { display: 'block', fontSize: '12px', color: '#aaa', marginTop: '2px' },
  orderStatus: { fontSize: '12px', fontWeight: '700', padding: '5px 12px', borderRadius: '20px' },
  orderMid: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  orderBranch: { fontSize: '14px', color: '#666' },
  orderPrice: { fontSize: '20px', fontWeight: '800', color: BROWN },
  cancelBtn: {
    marginTop: '12px', padding: '8px 18px',
    backgroundColor: '#fff0f0', color: '#d32f2f',
    border: '1px solid #ffcccc', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600'
  },

  /* 빈 상태 */
  empty: { backgroundColor: 'white', borderRadius: '14px', padding: '48px', textAlign: 'center', color: '#999', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  emptyIcon: { fontSize: '40px', margin: '0 0 12px' },
  emptyHint: { fontSize: '13px', color: '#bbb', margin: '8px 0 0' }
};

export default MyPage;
