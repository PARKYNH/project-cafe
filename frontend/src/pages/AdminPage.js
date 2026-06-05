// src/pages/AdminPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function AdminPage() {
  const navigate   = useNavigate();
  const adminName  = localStorage.getItem('name') || '관리자';
  const [tab, setTab]         = useState('menu');

  // ── 메뉴 관리 상태 ──
  const [products, setProducts]     = useState([]);
  const [editId,   setEditId]       = useState(null);
  const [newProduct, setNewProduct] = useState({
    category_id: 1, name: '', description: '', price: ''
  });
  const [editProduct, setEditProduct]   = useState({});
  const [uploadingId,  setUploadingId]  = useState(null); // 어떤 메뉴에 업로드 중인지

  // ── 주문 관리 상태 ──
  const [orders, setOrders] = useState([]);

  // ── 통계 상태 ──
  const [statsTab,  setStatsTab]  = useState('daily');
  const [statsData, setStatsData] = useState([]);

  const ORDER_STATUS = ['pending','paid','making','ready','done','cancelled'];
  const STATUS_KR    = {
    pending:'대기', paid:'결제완료', making:'제조중',
    ready:'준비완료', done:'완료', cancelled:'취소'
  };
  const STATUS_COLOR = {
    pending:'#999', paid:'#4a90d9', making:'#f5a623',
    ready:'#7ed321', done:'#6f4e37', cancelled:'#d0021b'
  };

  // ── 관리자 권한 체크 ──
  useEffect(() => {
    const role = localStorage.getItem('role');
    if (!role || role !== 'admin') {
      alert('관리자만 접근 가능해요!');
      navigate('/login');
    }
  }, [navigate]);

  // ── 탭 변경 시 데이터 로드 ──
  useEffect(() => {
    if (tab === 'menu')   loadProducts();
    if (tab === 'orders') loadOrders();
    if (tab === 'stats')  loadStats(statsTab);
  }, [tab]);

  useEffect(() => {
    if (tab === 'stats') loadStats(statsTab);
  }, [statsTab]);

  // ── API 호출 ──
  const loadProducts = async () => {
    try {
      const res = await api.get('/api/admin/products');
      setProducts(res.data.data);
    } catch { alert('메뉴 목록 로드 실패!'); }
  };

  const loadOrders = async () => {
    try {
      const res = await api.get('/api/admin/orders');
      setOrders(res.data.data);
    } catch { alert('주문 목록 로드 실패!'); }
  };

  const loadStats = async (type) => {
    try {
      const res = await api.get(`/api/admin/stats/${type}`);
      setStatsData(res.data.data);
    } catch { alert('통계 로드 실패!'); }
  };

  const handleCreateProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      alert('이름과 가격은 필수예요!'); return;
    }
    try {
      await api.post('/api/admin/products', {
        ...newProduct, price: Number(newProduct.price)
      });
      alert('메뉴가 등록됐어요!');
      setNewProduct({ category_id: 1, name: '', description: '', price: '' });
      loadProducts();
    } catch { alert('메뉴 등록 실패!'); }
  };

  const handleUpdateProduct = async (id) => {
    try {
      await api.put(`/api/admin/products/${id}`, {
        ...editProduct,
        price: editProduct.price ? Number(editProduct.price) : undefined
      });
      alert('수정됐어요!');
      setEditId(null);
      loadProducts();
    } catch { alert('수정 실패!'); }
  };

  // 📌 이미지 업로드 핸들러
  //   일반 api(axios)는 JSON만 보내는데, 파일은 FormData로 보내야 해요.
  //   Content-Type을 multipart/form-data로 바꿔서 전송!
  const handleImageUpload = async (productId, file) => {
    if (!file) return;
    setUploadingId(productId);
    try {
      const formData = new FormData();
      formData.append('image', file); // multer의 upload.single('image')와 키 이름 일치!
      await api.post(`/api/admin/products/${productId}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('이미지가 업로드됐어요!');
      loadProducts(); // 목록 새로고침
    } catch {
      alert('이미지 업로드 실패!');
    } finally {
      setUploadingId(null);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`'${name}' 메뉴를 비활성화할까요?`)) return;
    try {
      await api.delete(`/api/admin/products/${id}`);
      alert('비활성화됐어요!');
      loadProducts();
    } catch { alert('삭제 실패!'); }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await api.patch(`/api/admin/orders/${orderId}/status`, { status });
      setOrders(prev =>
        prev.map(o => o.order_id === orderId ? { ...o, status } : o)
      );
    } catch { alert('상태 변경 실패!'); }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={styles.container}>

      {/* 헤더 */}
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>☕ BREWY 관리자</h2>
        <div style={styles.headerRight}>
          <span style={styles.adminName}>👤 {adminName}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>로그아웃</button>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div style={styles.tabBar}>
        {[
          { key: 'menu',   label: '🍵 메뉴 관리' },
          { key: 'orders', label: '📋 주문 관리' },
          { key: 'stats',  label: '📊 매출 통계' },
        ].map(t => (
          <button
            key={t.key}
            style={{ ...styles.tabBtn, ...(tab === t.key ? styles.tabActive : {}) }}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={styles.content}>

        {/* ── 메뉴 관리 탭 ── */}
        {tab === 'menu' && (
          <div>
            {/* 신규 등록 폼 */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>신규 메뉴 등록</h3>
              <div style={styles.formRow}>
                <select
                  style={styles.select}
                  value={newProduct.category_id}
                  onChange={e => setNewProduct({ ...newProduct, category_id: Number(e.target.value) })}
                >
                  <option value={1}>☕ 커피</option>
                  <option value={2}>🧃 논커피</option>
                  <option value={3}>🍰 디저트</option>
                </select>
                <input
                  style={styles.input}
                  placeholder="메뉴 이름 *"
                  value={newProduct.name}
                  onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                />
                <input
                  style={{ ...styles.input, width: '120px' }}
                  placeholder="가격 *"
                  type="number"
                  value={newProduct.price}
                  onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                />
                <input
                  style={styles.input}
                  placeholder="설명 (선택)"
                  value={newProduct.description}
                  onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                />
                <button style={styles.btnPrimary} onClick={handleCreateProduct}>등록</button>
              </div>
            </div>

            {/* 메뉴 목록 */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>메뉴 목록 ({products.length}개)</h3>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thead}>
                    <th style={styles.th}>이미지</th>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>카테고리</th>
                    <th style={styles.th}>메뉴명</th>
                    <th style={styles.th}>가격</th>
                    <th style={styles.th}>상태</th>
                    <th style={styles.th}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.product_id} style={styles.tr}>
                      {/* 이미지 셀 — 썸네일 + 파일 업로드 버튼 */}
                      <td style={styles.td}>
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'6px' }}>
                          {p.image_url ? (
                            <img
                              src={p.image_url.startsWith('/uploads')
                                ? `http://localhost:8080${p.image_url}`
                                : p.image_url}
                              alt={p.name}
                              style={{ width:'60px', height:'60px', objectFit:'cover', borderRadius:'8px' }}
                            />
                          ) : (
                            <div style={{ width:'60px', height:'60px', background:'#f0e8e0', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px' }}>
                              ☕
                            </div>
                          )}
                          <label style={{ ...styles.btnSm, background:'#888', cursor:'pointer', fontSize:'11px' }}>
                            {uploadingId === p.product_id ? '업로드중...' : '📷 변경'}
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display:'none' }}
                              onChange={e => handleImageUpload(p.product_id, e.target.files[0])}
                            />
                          </label>
                        </div>
                      </td>
                      <td style={styles.td}>{p.product_id}</td>
                      <td style={styles.td}>{p.category_name}</td>
                      <td style={styles.td}>
                        {editId === p.product_id ? (
                          <input
                            style={styles.editInput}
                            defaultValue={p.name}
                            onChange={e => setEditProduct({ ...editProduct, name: e.target.value })}
                          />
                        ) : p.name}
                      </td>
                      <td style={styles.td}>
                        {editId === p.product_id ? (
                          <input
                            style={{ ...styles.editInput, width: '80px' }}
                            defaultValue={p.price}
                            type="number"
                            onChange={e => setEditProduct({ ...editProduct, price: e.target.value })}
                          />
                        ) : `${p.price.toLocaleString()}원`}
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.badge,
                          background: p.is_active ? '#e8f5e9' : '#fce4ec',
                          color: p.is_active ? '#2e7d32' : '#c62828'
                        }}>
                          {p.is_active ? '판매중' : '비활성'}
                        </span>
                        {p.is_sold_out ? <span style={{ ...styles.badge, background: '#fff3e0', color: '#e65100', marginLeft: 4 }}>품절</span> : null}
                      </td>
                      <td style={styles.td}>
                        {editId === p.product_id ? (
                          <>
                            <button style={styles.btnSm} onClick={() => handleUpdateProduct(p.product_id)}>저장</button>
                            <button style={{ ...styles.btnSm, background: '#999' }} onClick={() => setEditId(null)}>취소</button>
                          </>
                        ) : (
                          <>
                            <button style={styles.btnSm} onClick={() => { setEditId(p.product_id); setEditProduct({}); }}>수정</button>
                            <button style={{ ...styles.btnSm, background: '#d32f2f' }} onClick={() => handleDeleteProduct(p.product_id, p.name)}>삭제</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── 주문 관리 탭 ── */}
        {tab === 'orders' && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>전체 주문 목록 ({orders.length}건)</h3>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>주문번호</th>
                  <th style={styles.th}>고객명</th>
                  <th style={styles.th}>지점</th>
                  <th style={styles.th}>금액</th>
                  <th style={styles.th}>픽업시간</th>
                  <th style={styles.th}>상태 변경</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.order_id} style={styles.tr}>
                    <td style={{ ...styles.td, fontSize: '12px' }}>{o.order_number}</td>
                    <td style={styles.td}>{o.user_name}<br /><span style={{ fontSize: '11px', color: '#999' }}>{o.email}</span></td>
                    <td style={styles.td}>{o.branch_name}</td>
                    <td style={styles.td}>{o.total_price.toLocaleString()}원</td>
                    <td style={{ ...styles.td, fontSize: '12px' }}>{new Date(o.pickup_time).toLocaleString('ko-KR')}</td>
                    <td style={styles.td}>
                      <select
                        style={{
                          ...styles.select,
                          fontSize: '13px',
                          padding: '4px 8px',
                          color: STATUS_COLOR[o.status]
                        }}
                        value={o.status}
                        onChange={e => handleStatusChange(o.order_id, e.target.value)}
                      >
                        {ORDER_STATUS.map(s => (
                          <option key={s} value={s}>{STATUS_KR[s]}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={6} style={{ ...styles.td, textAlign: 'center', color: '#999' }}>주문 내역이 없어요</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── 매출 통계 탭 ── */}
        {tab === 'stats' && (
          <div>
            <div style={styles.statsTabBar}>
              {[
                { key: 'daily',   label: '일별' },
                { key: 'monthly', label: '월별' },
                { key: 'branch',  label: '지점별' },
                { key: 'menu',    label: '메뉴별' },
              ].map(t => (
                <button
                  key={t.key}
                  style={{ ...styles.statsBtn, ...(statsTab === t.key ? styles.statsBtnActive : {}) }}
                  onClick={() => setStatsTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                {statsTab === 'daily' && '📅 일별 매출'}
                {statsTab === 'monthly' && '📆 월별 매출'}
                {statsTab === 'branch' && '🏪 지점별 매출'}
                {statsTab === 'menu' && '🍵 인기 메뉴 TOP 10'}
              </h3>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thead}>
                    {statsTab === 'daily'   && <><th style={styles.th}>날짜</th><th style={styles.th}>주문수</th><th style={styles.th}>매출</th></>}
                    {statsTab === 'monthly' && <><th style={styles.th}>월</th><th style={styles.th}>주문수</th><th style={styles.th}>매출</th></>}
                    {statsTab === 'branch'  && <><th style={styles.th}>지점명</th><th style={styles.th}>주문수</th><th style={styles.th}>매출</th></>}
                    {statsTab === 'menu'    && <><th style={styles.th}>메뉴명</th><th style={styles.th}>판매수량</th><th style={styles.th}>매출</th></>}
                  </tr>
                </thead>
                <tbody>
                  {statsData.map((row, i) => (
                    <tr key={i} style={styles.tr}>
                      {statsTab === 'daily'   && <><td style={styles.td}>{String(row['날짜']).slice(0, 10)}</td><td style={styles.td}>{row['주문수']}</td><td style={styles.td}>{Number(row['매출']).toLocaleString()}원</td></>}
                      {statsTab === 'monthly' && <><td style={styles.td}>{row['월']}</td><td style={styles.td}>{row['주문수']}</td><td style={styles.td}>{Number(row['매출']).toLocaleString()}원</td></>}
                      {statsTab === 'branch'  && <><td style={styles.td}>{row['지점명']}</td><td style={styles.td}>{row['주문수']}</td><td style={styles.td}>{Number(row['매출']).toLocaleString()}원</td></>}
                      {statsTab === 'menu'    && <><td style={styles.td}>{row['메뉴명']}</td><td style={styles.td}>{row['주문수량']}</td><td style={styles.td}>{Number(row['매출']).toLocaleString()}원</td></>}
                    </tr>
                  ))}
                  {statsData.length === 0 && (
                    <tr><td colSpan={3} style={{ ...styles.td, textAlign: 'center', color: '#999' }}>데이터가 없어요</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const BROWN = '#6f4e37';
const styles = {
  container:    { minHeight: '100vh', backgroundColor: '#f5f0eb', fontFamily: 'sans-serif' },
  header:       { background: BROWN, color: 'white', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle:  { margin: 0, fontSize: '20px' },
  headerRight:  { display: 'flex', alignItems: 'center', gap: '12px' },
  adminName:    { fontSize: '14px' },
  logoutBtn:    { padding: '6px 14px', background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  tabBar:       { background: 'white', display: 'flex', borderBottom: '2px solid #e0d5cc', padding: '0 24px' },
  tabBtn:       { padding: '14px 20px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '14px', color: '#666', fontWeight: '500' },
  tabActive:    { color: BROWN, borderBottom: `2px solid ${BROWN}`, marginBottom: '-2px' },
  content:      { padding: '24px' },
  card:         { background: 'white', borderRadius: '10px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardTitle:    { margin: '0 0 16px', fontSize: '16px', color: '#333', fontWeight: '600' },
  formRow:      { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' },
  input:        { padding: '9px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', flex: 1, minWidth: '120px' },
  editInput:    { padding: '6px 8px', borderRadius: '4px', border: '1px solid #bbb', fontSize: '13px', width: '100%' },
  select:       { padding: '9px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', background: 'white' },
  btnPrimary:   { padding: '9px 18px', background: BROWN, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap' },
  btnSm:        { padding: '5px 10px', background: BROWN, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', marginRight: '4px' },
  table:        { width: '100%', borderCollapse: 'collapse' },
  thead:        { background: '#f9f5f2' },
  th:           { padding: '10px 12px', textAlign: 'left', fontSize: '13px', color: '#555', fontWeight: '600', borderBottom: '1px solid #eee' },
  tr:           { borderBottom: '1px solid #f0e8e0' },
  td:           { padding: '10px 12px', fontSize: '14px', color: '#333', verticalAlign: 'middle' },
  badge:        { display: 'inline-block', padding: '2px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: '500' },
  statsTabBar:  { display: 'flex', gap: '8px', marginBottom: '16px' },
  statsBtn:     { padding: '8px 16px', border: `1px solid ${BROWN}`, background: 'white', color: BROWN, borderRadius: '20px', cursor: 'pointer', fontSize: '13px' },
  statsBtnActive: { background: BROWN, color: 'white' },
};

export default AdminPage;
