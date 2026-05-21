// src/pages/MyPage.js

import React, { useState, useEffect }
  from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function MyPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stamps, setStamps] = useState([]);
  const [stampCount, setStampCount]
    = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [
        userRes,
        stampsRes,
        stampCountRes,
        couponsRes,
        ordersRes
      ] = await Promise.all([
        api.get('/api/users/me'),
        api.get('/api/stamps'),
        api.get('/api/stamps/count'),
        api.get('/api/coupons'),
        api.get('/api/orders')
      ]);

      setUser(userRes.data.user);
      setStamps(stampsRes.data.stamps);
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
    if (!window.confirm('주문을 취소할까요?'))
      return;

    try {
      await api.patch(
        `/api/orders/${orderId}/cancel`
      );
      alert('주문이 취소됐어요!');
      fetchData();
    } catch (err) {
      alert('취소 실패했어요!');
    }
  };

  return (
    <div style={styles.container}>

      {/* 헤더 */}
      <header style={styles.header}>
        <button
          style={styles.backBtn}
          onClick={() => navigate('/main')}
        >
          ← 뒤로
        </button>
        <h1 style={styles.logo}>
          👤 마이페이지
        </h1>
        <div />
      </header>

      <main style={styles.main}>

        {/* 유저 정보 */}
        <section style={styles.userCard}>
          <h2>👋 {user?.name}님</h2>
          <p style={styles.email}>
            {user?.email}
          </p>
        </section>

        {/* 스탬프 */}
        <section style={styles.section}>
          <h2>⭐ 스탬프</h2>
          <div style={styles.stampCard}>
            <div style={styles.stampInfo}>
              <span style={styles.stampNum}>
                {stampCount?.stampCount || 0}
              </span>
              <span style={styles.stampLabel}>
                개 보유
              </span>
            </div>
            <p style={styles.stampMsg}>
              {stampCount?.message}
            </p>

            {/* 스탬프 시각화 */}
            <div style={styles.stampGrid}>
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.stamp,
                    backgroundColor:
                      i < (stampCount?.stampCount || 0)
                        ? '#6f4e37'
                        : '#eee'
                  }}
                >
                  ☕
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 쿠폰 */}
        <section style={styles.section}>
          <h2>🎫 쿠폰</h2>
          {coupons.length === 0 ? (
            <div style={styles.empty}>
              보유한 쿠폰이 없어요 😢
            </div>
          ) : (
            <div style={styles.couponList}>
              {coupons.map(coupon => (
                <div
                  key={coupon.coupon_id}
                  style={{
                    ...styles.couponCard,
                    opacity: coupon.status
                      !== 'active' ? 0.5 : 1
                  }}
                >
                  <div style={styles.couponLeft}>
                    <span style={styles.couponIcon}>
                      🎁
                    </span>
                    <div>
                      <p style={styles.couponCode}>
                        {coupon.coupon_code}
                      </p>
                      <p style={styles.couponExp}>
                        ~{coupon.expired_at
                          ?.substring(0, 10)}
                      </p>
                    </div>
                  </div>
                  <span style={{
                    ...styles.couponStatus,
                    backgroundColor:
                      coupon.status === 'active'
                        ? '#4CAF50'
                        : '#999'
                  }}>
                    {coupon.status === 'active'
                      ? '사용가능'
                      : coupon.status === 'used'
                        ? '사용완료'
                        : '만료'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 주문 내역 */}
        <section style={styles.section}>
          <h2>📦 주문 내역</h2>
          {orders.length === 0 ? (
            <div style={styles.empty}>
              주문 내역이 없어요 😢
            </div>
          ) : (
            <div style={styles.orderList}>
              {orders.map(order => (
                <div
                  key={order.order_id}
                  style={styles.orderCard}
                >
                  <div style={styles.orderTop}>
                    <span style={styles.orderNum}>
                      {order.order_number}
                    </span>
                    <span style={{
                      ...styles.orderStatus,
                      backgroundColor:
                        order.status === 'pending'
                          ? '#ff9800'
                          : order.status === 'done'
                            ? '#4CAF50'
                            : '#999'
                    }}>
                      {order.status === 'pending'
                        ? '대기중'
                        : order.status === 'done'
                          ? '완료'
                          : '취소됨'}
                    </span>
                  </div>
                  <p style={styles.orderBranch}>
                    🏢 {order.branch_name}
                  </p>
                  <p style={styles.orderPrice}>
                    {order.total_price
                      ?.toLocaleString()}원
                  </p>
                  <p style={styles.orderDate}>
                    {order.created_at
                      ?.substring(0, 10)}
                  </p>

                  {order.status === 'pending' && (
                    <button
                      style={styles.cancelBtn}
                      onClick={() =>
                        handleCancelOrder(
                          order.order_id
                        )
                      }
                    >
                      주문 취소
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f9f9f9'
  },
  header: {
    backgroundColor: '#6f4e37',
    color: 'white',
    padding: '16px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  backBtn: {
    backgroundColor: 'transparent',
    color: 'white',
    border: '1px solid white',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  logo: { margin: 0 },
  main: {
    padding: '32px',
    maxWidth: '800px',
    margin: '0 auto'
  },
  userCard: {
    backgroundColor: '#6f4e37',
    color: 'white',
    padding: '24px',
    borderRadius: '12px',
    marginBottom: '24px'
  },
  email: {
    color: 'rgba(255,255,255,0.8)',
    margin: 0
  },
  section: { marginBottom: '32px' },
  stampCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  stampInfo: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px'
  },
  stampNum: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#6f4e37'
  },
  stampLabel: {
    fontSize: '18px',
    color: '#666'
  },
  stampMsg: {
    color: '#666',
    marginBottom: '16px'
  },
  stampGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '8px'
  },
  stamp: {
    height: '48px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px'
  },
  couponList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  couponCard: {
    backgroundColor: 'white',
    padding: '16px 20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  couponLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  couponIcon: { fontSize: '32px' },
  couponCode: {
    fontWeight: 'bold',
    margin: 0,
    fontSize: '14px'
  },
  couponExp: {
    color: '#999',
    margin: 0,
    fontSize: '12px'
  },
  couponStatus: {
    color: 'white',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px'
  },
  orderList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  orderCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  orderTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  orderNum: {
    fontWeight: 'bold',
    fontSize: '14px'
  },
  orderStatus: {
    color: 'white',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px'
  },
  orderBranch: {
    color: '#666',
    margin: '4px 0'
  },
  orderPrice: {
    color: '#6f4e37',
    fontWeight: 'bold',
    fontSize: '18px',
    margin: '4px 0'
  },
  orderDate: {
    color: '#999',
    fontSize: '13px',
    margin: '4px 0'
  },
  cancelBtn: {
    marginTop: '8px',
    padding: '8px 16px',
    backgroundColor: '#ff4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  empty: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    textAlign: 'center',
    color: '#999'
  }
};

export default MyPage;

//AI Generate:parkynh2|20260520|422|c29b8da227774660b13e746a47144580