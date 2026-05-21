// src/pages/MainPage.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ChatBot from '../components/ChatBot';

function MainPage() {
  const navigate = useNavigate();

  // 더존 dataSource 같은것!
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 더존 dews.ready 같은것!
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 병렬로 API 호출!
      const [userRes, productsRes, branchesRes]
        = await Promise.all([
          api.get('/api/users/me'),
          api.get('/api/products'),
          api.get('/api/branches')
        ]);

      setUser(userRes.data.user);
      setProducts(productsRes.data.products);
      setBranches(branchesRes.data.branches);

    } catch (err) {
      // 토큰 만료되면 로그인으로!
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        로딩중...
      </div>
    );
  }

  return (
    <div style={styles.container}>

      {/* 헤더 */}
      <header style={styles.header}>
        <h1 style={styles.logo}>☕ BREWY</h1>
        <div style={styles.userInfo}>
        <span>
          안녕하세요 {user?.name}님!
        </span>
        <button
          style={styles.myPageBtn}
          onClick={() => navigate('/mypage')}
        >
          마이페이지
        </button>
        <button
          style={styles.logoutBtn}
          onClick={handleLogout}
        >
          로그아웃
        </button>
      </div>
      </header>

      <main style={styles.main}>

        {/* 지점 목록 */}
        <section style={styles.section}>
          <h2>🏢 지점 목록</h2>
          <div style={styles.branchGrid}>
            {branches.map(branch => (
              <div
                key={branch.branch_id}
                style={styles.branchCard}
              >
                <h3>{branch.name}</h3>
                <p>{branch.address}</p>
                <p>📞 {branch.phone}</p>
                <p>
                  🕐 {branch.open_time}
                  ~{branch.close_time}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 메뉴 목록 */}
        <section style={styles.section}>
          <h2>☕ 메뉴</h2>
          <div style={styles.menuGrid}>
            {products.map(product => (
              <div
                key={product.product_id}
                style={styles.menuCard}
              >
                <span style={styles.category}>
                  {product.category_name}
                </span>
                <h3>{product.name}</h3>
                <p style={styles.desc}>
                  {product.description}
                </p>
                <p style={styles.price}>
                  {product.price
                    .toLocaleString()}원
                </p>
                {product.is_sold_out === 1 && (
                  <span style={styles.soldout}>
                    품절
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>
      <ChatBot />
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
  logo: {
    margin: 0,
    fontSize: '24px'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  logoutBtn: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: 'white',
    border: '1px solid white',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  myPageBtn: {
  padding: '8px 16px',
  backgroundColor: 'white',
  color: '#6f4e37',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold'
  },
  main: {
    padding: '32px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  section: {
    marginBottom: '40px'
  },
  branchGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px'
  },
  branchCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  menuGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  menuCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    position: 'relative'
  },
  category: {
    backgroundColor: '#f0e6d3',
    color: '#6f4e37',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px'
  },
  desc: {
    color: '#999',
    fontSize: '13px'
  },
  price: {
    color: '#6f4e37',
    fontWeight: 'bold',
    fontSize: '18px'
  },
  soldout: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: '#ff4444',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px'
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '18px'
  }
};

export default MainPage;