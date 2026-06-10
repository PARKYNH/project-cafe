// src/pages/AdminPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
  BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

function AdminPage() {
  const navigate  = useNavigate();
  const adminName = localStorage.getItem('name') || '관리자';
  const [tab, setTab] = useState('menu');

  const [products,    setProducts]    = useState([]);
  const [editId,      setEditId]      = useState(null);
  const [newProduct,  setNewProduct]  = useState({ category_id: 1, name: '', description: '', price: '' });
  const [editProduct, setEditProduct] = useState({});
  const [uploadingId, setUploadingId] = useState(null);

  const [orders, setOrders] = useState([]);

  const [statsTab,  setStatsTab]  = useState('daily');
  const [statsData, setStatsData] = useState([]);

  const ORDER_STATUS = ['pending','paid','making','ready','done','cancelled'];
  const STATUS_KR    = { pending:'대기중', paid:'결제완료', making:'제조중', ready:'준비완료', done:'완료', cancelled:'취소' };
  const STATUS_COLOR = { pending:'#ff9800', paid:'#2196f3', making:'#9c27b0', ready:'#00bcd4', done:'#4caf50', cancelled:'#999' };
  const STATUS_BG    = { pending:'#fff8e1', paid:'#e3f2fd', making:'#f3e5f5', ready:'#e0f7fa', done:'#e8f5e9', cancelled:'#f5f5f5' };

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (!role || role !== 'admin') { alert('관리자만 접근 가능해요!'); navigate('/login'); }
  }, [navigate]);

  useEffect(() => {
    if (tab === 'menu')   loadProducts();
    if (tab === 'orders') loadOrders();
    if (tab === 'stats')  loadStats(statsTab);
  }, [tab]);

  useEffect(() => {
    if (tab === 'stats') loadStats(statsTab);
  }, [statsTab]);

  const loadProducts = async () => {
    try { const res = await api.get('/api/admin/products'); setProducts(res.data.data); }
    catch { alert('메뉴 목록 로드 실패!'); }
  };
  const loadOrders = async () => {
    try { const res = await api.get('/api/admin/orders'); setOrders(res.data.data); }
    catch { alert('주문 목록 로드 실패!'); }
  };
  const loadStats = async (type) => {
    try { const res = await api.get(`/api/admin/stats/${type}`); setStatsData(res.data.data); }
    catch { alert('통계 로드 실패!'); }
  };

  const handleCreateProduct = async () => {
    if (!newProduct.name || !newProduct.price) { alert('이름과 가격은 필수예요!'); return; }
    try {
      await api.post('/api/admin/products', { ...newProduct, price: Number(newProduct.price) });
      setNewProduct({ category_id: 1, name: '', description: '', price: '' });
      loadProducts();
    } catch { alert('메뉴 등록 실패!'); }
  };

  const handleUpdateProduct = async (id) => {
    try {
      await api.put(`/api/admin/products/${id}`, { ...editProduct, price: editProduct.price ? Number(editProduct.price) : undefined });
      setEditId(null);
      loadProducts();
    } catch { alert('수정 실패!'); }
  };

  const handleImageUpload = async (productId, file) => {
    if (!file) return;
    setUploadingId(productId);
    try {
      const formData = new FormData();
      formData.append('image', file);
      await api.post(`/api/admin/products/${productId}/image`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      loadProducts();
    } catch { alert('이미지 업로드 실패!'); }
    finally { setUploadingId(null); }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`'${name}' 메뉴를 비활성화할까요?`)) return;
    try { await api.delete(`/api/admin/products/${id}`); loadProducts(); }
    catch { alert('삭제 실패!'); }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await api.patch(`/api/admin/orders/${orderId}/status`, { status });
      setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, status } : o));
    } catch { alert('상태 변경 실패!'); }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  const totalRevenue = orders.filter(o => o.status !== 'cancelled')
    .reduce((s, o) => s + o.total_price, 0);

  return (
    <div style={S.container}>

      {/* ── 헤더 ── */}
      <header style={S.header}>
        <div style={S.headerInner}>
          <div style={S.headerLeft}>
            <h1 style={S.logo}>BREWY</h1>
            <span style={S.adminLabel}>관리자 대시보드</span>
          </div>
          <div style={S.headerRight}>
            <div style={S.adminInfo}>
              <div style={S.adminAvatar}>{adminName.charAt(0)}</div>
              <span style={S.adminName}>{adminName}</span>
            </div>
            <button style={S.logoutBtn} onClick={handleLogout}>로그아웃</button>
            <button style={S.userBtn} onClick={() => navigate('/main')}>← 메인으로</button>
          </div>
        </div>
      </header>

      {/* ── 요약 카드 ── */}
      <div style={S.summaryBar}>
        <div style={S.summaryInner}>
          {[
            { icon: '🍵', label: '전체 메뉴', value: `${products.length}개`, color: '#6f4e37' },
            { icon: '📋', label: '전체 주문', value: `${orders.length}건`, color: '#2196f3' },
            { icon: '✅', label: '완료 주문', value: `${orders.filter(o=>o.status==='done').length}건`, color: '#4caf50' },
            { icon: '💰', label: '총 매출', value: `${totalRevenue.toLocaleString()}원`, color: '#ff9800' },
          ].map((s, i) => (
            <div key={i} style={S.summaryCard}>
              <span style={S.summaryIcon}>{s.icon}</span>
              <div>
                <p style={S.summaryLabel}>{s.label}</p>
                <p style={{ ...S.summaryValue, color: s.color }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 탭 ── */}
      <div style={S.tabWrap}>
        <div style={S.tabInner}>
          {[
            { key:'menu',   label:'🍵 메뉴 관리' },
            { key:'orders', label:'📋 주문 관리' },
            { key:'stats',  label:'📊 매출 통계' },
          ].map(t => (
            <button
              key={t.key}
              style={{ ...S.tab, ...(tab === t.key ? S.tabActive : {}) }}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 콘텐츠 ── */}
      <div style={S.content}>

        {/* ══ 메뉴 관리 ══ */}
        {tab === 'menu' && (
          <div>
            {/* 신규 등록 폼 */}
            <div style={S.card}>
              <h3 style={S.cardTitle}>➕ 신규 메뉴 등록</h3>
              <div style={S.formGrid}>
                <select style={S.input} value={newProduct.category_id}
                  onChange={e => setNewProduct({ ...newProduct, category_id: Number(e.target.value) })}>
                  <option value={1}>☕ 커피</option>
                  <option value={2}>🧃 논커피</option>
                  <option value={3}>🍰 디저트</option>
                </select>
                <input style={S.input} placeholder="메뉴 이름 *"
                  value={newProduct.name}
                  onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
                <input style={S.input} placeholder="가격 *" type="number"
                  value={newProduct.price}
                  onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
                <input style={S.input} placeholder="설명 (선택)"
                  value={newProduct.description}
                  onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} />
                <button style={S.btnPrimary} onClick={handleCreateProduct}>등록하기</button>
              </div>
            </div>

            {/* 메뉴 목록 */}
            <div style={S.card}>
              <h3 style={S.cardTitle}>📋 메뉴 목록 <span style={S.countBadge}>{products.length}개</span></h3>
              <div style={S.tableWrap}>
                <table style={S.table}>
                  <thead>
                    <tr style={S.thead}>
                      <th style={S.th}>이미지</th>
                      <th style={S.th}>카테고리</th>
                      <th style={S.th}>메뉴명</th>
                      <th style={S.th}>가격</th>
                      <th style={S.th}>상태</th>
                      <th style={S.th}>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p, idx) => (
                      <tr key={p.product_id} style={{ ...S.tr, backgroundColor: idx % 2 === 0 ? 'white' : '#fdfbf9' }}>
                        <td style={S.td}>
                          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'6px' }}>
                            {p.image_url ? (
                              <img
                                src={p.image_url.startsWith('/uploads') ? `http://localhost:8080${p.image_url}` : p.image_url}
                                alt={p.name}
                                style={{ width:'56px', height:'56px', objectFit:'cover', borderRadius:'10px', boxShadow:'0 2px 6px rgba(0,0,0,0.12)' }}
                              />
                            ) : (
                              <div style={{ width:'56px', height:'56px', background:'#f0e8e0', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px' }}>☕</div>
                            )}
                            <label style={S.imgBtn}>
                              {uploadingId === p.product_id ? '⏳' : '📷'}
                              <input type="file" accept="image/*" style={{ display:'none' }}
                                onChange={e => handleImageUpload(p.product_id, e.target.files[0])} />
                            </label>
                          </div>
                        </td>
                        <td style={S.td}><span style={S.catBadge}>{p.category_name}</span></td>
                        <td style={S.td}>
                          {editId === p.product_id
                            ? <input style={S.editInput} defaultValue={p.name} onChange={e => setEditProduct({ ...editProduct, name: e.target.value })} />
                            : <span style={S.menuName}>{p.name}</span>}
                        </td>
                        <td style={S.td}>
                          {editId === p.product_id
                            ? <input style={{ ...S.editInput, width:'80px' }} type="number" defaultValue={p.price} onChange={e => setEditProduct({ ...editProduct, price: e.target.value })} />
                            : <span style={S.priceText}>{p.price.toLocaleString()}원</span>}
                        </td>
                        <td style={S.td}>
                          <span style={{ ...S.statusBadge, backgroundColor: p.is_active ? '#e8f5e9' : '#fce4ec', color: p.is_active ? '#2e7d32' : '#c62828' }}>
                            {p.is_active ? '판매중' : '비활성'}
                          </span>
                        </td>
                        <td style={S.td}>
                          {editId === p.product_id ? (
                            <div style={{ display:'flex', gap:'4px' }}>
                              <button style={S.btnSave} onClick={() => handleUpdateProduct(p.product_id)}>저장</button>
                              <button style={S.btnCancel} onClick={() => setEditId(null)}>취소</button>
                            </div>
                          ) : (
                            <div style={{ display:'flex', gap:'4px' }}>
                              <button style={S.btnEdit} onClick={() => { setEditId(p.product_id); setEditProduct({}); }}>수정</button>
                              <button style={S.btnDel} onClick={() => handleDeleteProduct(p.product_id, p.name)}>삭제</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══ 주문 관리 ══ */}
        {tab === 'orders' && (
          <div style={S.card}>
            <h3 style={S.cardTitle}>📋 전체 주문 목록 <span style={S.countBadge}>{orders.length}건</span></h3>
            <div style={S.tableWrap}>
              <table style={S.table}>
                <thead>
                  <tr style={S.thead}>
                    <th style={S.th}>주문번호</th>
                    <th style={S.th}>고객</th>
                    <th style={S.th}>지점</th>
                    <th style={S.th}>금액</th>
                    <th style={S.th}>픽업시간</th>
                    <th style={S.th}>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr><td colSpan={6} style={{ ...S.td, textAlign:'center', color:'#aaa', padding:'40px' }}>주문 내역이 없어요</td></tr>
                  ) : orders.map((o, idx) => (
                    <tr key={o.order_id} style={{ ...S.tr, backgroundColor: idx % 2 === 0 ? 'white' : '#fdfbf9' }}>
                      <td style={S.td}><span style={S.orderNum}>{o.order_number}</span></td>
                      <td style={S.td}>
                        <span style={S.menuName}>{o.user_name}</span>
                        <span style={S.subText}>{o.email}</span>
                      </td>
                      <td style={S.td}>{o.branch_name}</td>
                      <td style={S.td}><span style={S.priceText}>{o.total_price.toLocaleString()}원</span></td>
                      <td style={S.td}><span style={S.subText}>{new Date(o.pickup_time).toLocaleString('ko-KR')}</span></td>
                      <td style={S.td}>
                        <select
                          style={{ ...S.statusSelect, color: STATUS_COLOR[o.status], backgroundColor: STATUS_BG[o.status] }}
                          value={o.status}
                          onChange={e => handleStatusChange(o.order_id, e.target.value)}
                        >
                          {ORDER_STATUS.map(s => <option key={s} value={s}>{STATUS_KR[s]}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ 매출 통계 ══ */}
        {tab === 'stats' && (
          <div>
            {/* 통계 서브탭 */}
            <div style={S.statsTabRow}>
              {[
                { key:'daily',   label:'📅 일별' },
                { key:'monthly', label:'📆 월별' },
                { key:'branch',  label:'🏪 지점별' },
                { key:'menu',    label:'🍵 메뉴별' },
              ].map(t => (
                <button
                  key={t.key}
                  style={{ ...S.statsTab, ...(statsTab === t.key ? S.statsTabActive : {}) }}
                  onClick={() => setStatsTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {statsData.length === 0 ? (
              <div style={{ ...S.card, textAlign:'center', padding:'60px', color:'#aaa' }}>
                <p style={{ fontSize:'40px', margin:'0 0 12px' }}>📊</p>
                <p>데이터가 없어요. 테스트 데이터를 넣어주세요!</p>
              </div>
            ) : (
              <div>
                {/* ── 차트 카드 ── */}
                <div style={S.card}>
                  <h3 style={S.cardTitle}>
                    {statsTab==='daily'   && '📅 일별 매출 추이'}
                    {statsTab==='monthly' && '📆 월별 매출 추이'}
                    {statsTab==='branch'  && '🏪 지점별 매출 비교'}
                    {statsTab==='menu'    && '🍵 인기 메뉴 TOP 10'}
                  </h3>

                  {/* 일별 — 막대그래프 */}
                  {statsTab === 'daily' && (
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={statsData.map(r => ({ name: String(r['날짜']).slice(5,10), 매출: Number(r['매출']), 주문수: Number(r['주문수']) }))}
                        margin={{ top:10, right:30, left:20, bottom:5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0e8e0" />
                        <XAxis dataKey="name" tick={{ fontSize:12, fill:'#888' }} />
                        <YAxis tick={{ fontSize:12, fill:'#888' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                        <Tooltip formatter={(v, n) => [n==='매출' ? `${Number(v).toLocaleString()}원` : `${v}건`, n]} />
                        <Legend />
                        <Bar dataKey="매출" fill="#6f4e37" radius={[6,6,0,0]} />
                        <Bar dataKey="주문수" fill="#c8956c" radius={[6,6,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}

                  {/* 월별 — 라인그래프 */}
                  {statsTab === 'monthly' && (
                    <ResponsiveContainer width="100%" height={320}>
                      <LineChart data={statsData.map(r => ({ name: String(r['월']), 매출: Number(r['매출']), 주문수: Number(r['주문수']) }))}
                        margin={{ top:10, right:30, left:20, bottom:5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0e8e0" />
                        <XAxis dataKey="name" tick={{ fontSize:12, fill:'#888' }} />
                        <YAxis tick={{ fontSize:12, fill:'#888' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                        <Tooltip formatter={(v, n) => [n==='매출' ? `${Number(v).toLocaleString()}원` : `${v}건`, n]} />
                        <Legend />
                        <Line type="monotone" dataKey="매출" stroke="#6f4e37" strokeWidth={3} dot={{ fill:'#6f4e37', r:5 }} />
                        <Line type="monotone" dataKey="주문수" stroke="#c8956c" strokeWidth={2} dot={{ fill:'#c8956c', r:4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}

                  {/* 지점별 — 파이차트 */}
                  {statsTab === 'branch' && (() => {
                    const PIE_COLORS = ['#6f4e37','#c8956c','#f5ede6','#3d2b1f','#a0785a'];
                    const pieData = statsData.map(r => ({ name: r['지점명'], value: Number(r['매출']) }));
                    return (
                      <div style={{ display:'flex', alignItems:'center', gap:'40px', flexWrap:'wrap' }}>
                        <ResponsiveContainer width={320} height={320}>
                          <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" outerRadius={120}
                              dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                              labelLine={true}>
                              {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={v => [`${Number(v).toLocaleString()}원`, '매출']} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div style={{ flex:1, minWidth:'200px' }}>
                          {statsData.map((r, i) => (
                            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid #f0e8e0' }}>
                              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                                <div style={{ width:'12px', height:'12px', borderRadius:'50%', backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                                <span style={{ fontWeight:'600', color:'#1a1a1a' }}>{r['지점명']}</span>
                              </div>
                              <div style={{ textAlign:'right' }}>
                                <p style={{ margin:0, fontWeight:'700', color:'#6f4e37' }}>{Number(r['매출']).toLocaleString()}원</p>
                                <p style={{ margin:0, fontSize:'12px', color:'#aaa' }}>{r['주문수']}건</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* 메뉴별 — 가로 막대그래프 */}
                  {statsTab === 'menu' && (
                    <ResponsiveContainer width="100%" height={Math.max(320, statsData.length * 52)}>
                      <BarChart layout="vertical"
                        data={statsData.map(r => ({ name: r['메뉴명'], 매출: Number(r['매출']), 수량: Number(r['주문수량']) }))}
                        margin={{ top:5, right:40, left:80, bottom:5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0e8e0" />
                        <XAxis type="number" tick={{ fontSize:12, fill:'#888' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize:13, fill:'#333' }} width={80} />
                        <Tooltip formatter={(v, n) => [n==='매출' ? `${Number(v).toLocaleString()}원` : `${v}개`, n]} />
                        <Legend />
                        <Bar dataKey="매출" fill="#6f4e37" radius={[0,6,6,0]} />
                        <Bar dataKey="수량" fill="#c8956c" radius={[0,6,6,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* ── 테이블 (차트 아래) ── */}
                <div style={S.card}>
                  <h3 style={S.cardTitle}>📋 상세 데이터</h3>
                  <div style={S.tableWrap}>
                    <table style={S.table}>
                      <thead>
                        <tr style={S.thead}>
                          {statsTab==='daily'   && <><th style={S.th}>날짜</th><th style={S.th}>주문수</th><th style={S.th}>매출</th></>}
                          {statsTab==='monthly' && <><th style={S.th}>월</th><th style={S.th}>주문수</th><th style={S.th}>매출</th></>}
                          {statsTab==='branch'  && <><th style={S.th}>지점명</th><th style={S.th}>주문수</th><th style={S.th}>매출</th></>}
                          {statsTab==='menu'    && <><th style={S.th}>메뉴명</th><th style={S.th}>판매수량</th><th style={S.th}>매출</th></>}
                        </tr>
                      </thead>
                      <tbody>
                        {statsData.map((row, i) => (
                          <tr key={i} style={{ ...S.tr, backgroundColor: i%2===0 ? 'white' : '#fdfbf9' }}>
                            {statsTab==='daily'   && <><td style={S.td}>{String(row['날짜']).slice(0,10)}</td><td style={S.td}>{row['주문수']}</td><td style={S.td}><span style={S.priceText}>{Number(row['매출']).toLocaleString()}원</span></td></>}
                            {statsTab==='monthly' && <><td style={S.td}>{row['월']}</td><td style={S.td}>{row['주문수']}</td><td style={S.td}><span style={S.priceText}>{Number(row['매출']).toLocaleString()}원</span></td></>}
                            {statsTab==='branch'  && <><td style={S.td}>{row['지점명']}</td><td style={S.td}>{row['주문수']}</td><td style={S.td}><span style={S.priceText}>{Number(row['매출']).toLocaleString()}원</span></td></>}
                            {statsTab==='menu'    && <><td style={S.td}>{row['메뉴명']}</td><td style={S.td}>{row['주문수량']}</td><td style={S.td}><span style={S.priceText}>{Number(row['매출']).toLocaleString()}원</span></td></>}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

const BROWN = '#6f4e37';
const LIGHT = '#f5ede6';

const S = {
  container: { minHeight:'100vh', backgroundColor:'#f4f0ec', fontFamily:"'Segoe UI', sans-serif" },

  /* 헤더 */
  header: { background:`linear-gradient(135deg, ${BROWN} 0%, #3d2b1f 100%)`, boxShadow:'0 4px 16px rgba(63,32,10,0.3)' },
  headerInner: { maxWidth:'1400px', margin:'0 auto', padding:'16px 32px', display:'flex', justifyContent:'space-between', alignItems:'center' },
  headerLeft: { display:'flex', alignItems:'center', gap:'14px' },
  logo: { margin:0, fontSize:'26px', fontWeight:'800', color:'white', letterSpacing:'4px' },
  adminLabel: { fontSize:'13px', color:'rgba(255,255,255,0.6)', backgroundColor:'rgba(255,255,255,0.1)', padding:'4px 12px', borderRadius:'20px' },
  headerRight: { display:'flex', alignItems:'center', gap:'12px' },
  adminInfo: { display:'flex', alignItems:'center', gap:'8px' },
  adminAvatar: { width:'36px', height:'36px', borderRadius:'50%', backgroundColor:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', fontWeight:'700', color:'white' },
  adminName: { fontSize:'14px', color:'rgba(255,255,255,0.9)' },
  logoutBtn: { padding:'8px 16px', backgroundColor:'rgba(255,255,255,0.1)', color:'white', border:'1px solid rgba(255,255,255,0.3)', borderRadius:'20px', cursor:'pointer', fontSize:'13px' },
  userBtn: { padding:'8px 16px', backgroundColor:'rgba(255,255,255,0.15)', color:'white', border:'none', borderRadius:'20px', cursor:'pointer', fontSize:'13px' },

  /* 요약 카드 */
  summaryBar: { backgroundColor:'white', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' },
  summaryInner: { maxWidth:'1400px', margin:'0 auto', padding:'20px 32px', display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'16px' },
  summaryCard: { display:'flex', alignItems:'center', gap:'14px', padding:'16px 20px', backgroundColor:'#fdfbf9', borderRadius:'12px', border:'1px solid #f0e8e0' },
  summaryIcon: { fontSize:'28px' },
  summaryLabel: { margin:'0 0 4px', fontSize:'12px', color:'#999', fontWeight:'600' },
  summaryValue: { margin:0, fontSize:'22px', fontWeight:'800' },

  /* 탭 */
  tabWrap: { backgroundColor:'white', borderBottom:'2px solid #ede8e3' },
  tabInner: { maxWidth:'1400px', margin:'0 auto', padding:'0 32px', display:'flex' },
  tab: { padding:'16px 24px', border:'none', backgroundColor:'transparent', cursor:'pointer', fontSize:'14px', fontWeight:'600', color:'#999', transition:'all 0.2s' },
  tabActive: { color:BROWN, borderBottom:`2px solid ${BROWN}`, marginBottom:'-2px' },

  /* 콘텐츠 */
  content: { maxWidth:'1400px', margin:'0 auto', padding:'28px 32px' },
  card: { backgroundColor:'white', borderRadius:'16px', padding:'24px 28px', marginBottom:'20px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)' },
  cardTitle: { margin:'0 0 20px', fontSize:'17px', fontWeight:'700', color:'#1a1a1a', display:'flex', alignItems:'center', gap:'10px' },
  countBadge: { fontSize:'13px', backgroundColor:LIGHT, color:BROWN, padding:'3px 10px', borderRadius:'20px', fontWeight:'600' },

  /* 등록 폼 */
  formGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:'10px', alignItems:'end' },
  input: { padding:'11px 14px', borderRadius:'10px', border:'1.5px solid #e8e0da', fontSize:'14px', outline:'none', backgroundColor:'#fdfbf9', width:'100%', boxSizing:'border-box' },
  btnPrimary: { padding:'11px 24px', backgroundColor:BROWN, color:'white', border:'none', borderRadius:'10px', cursor:'pointer', fontSize:'14px', fontWeight:'700', whiteSpace:'nowrap' },

  /* 테이블 */
  tableWrap: { overflowX:'auto' },
  table: { width:'100%', borderCollapse:'collapse' },
  thead: { backgroundColor:'#fdf8f5' },
  th: { padding:'12px 16px', textAlign:'left', fontSize:'12px', fontWeight:'700', color:'#888', textTransform:'uppercase', letterSpacing:'0.5px', borderBottom:'2px solid #f0e8e0' },
  tr: { transition:'background 0.15s' },
  td: { padding:'14px 16px', fontSize:'14px', color:'#333', verticalAlign:'middle', borderBottom:'1px solid #f5f0eb' },

  /* 셀 스타일 */
  menuName: { fontWeight:'600', color:'#1a1a1a', display:'block' },
  subText: { fontSize:'12px', color:'#aaa', display:'block', marginTop:'2px' },
  priceText: { fontWeight:'700', color:BROWN },
  orderNum: { fontSize:'12px', color:'#888', fontFamily:'monospace' },
  catBadge: { fontSize:'11px', fontWeight:'700', padding:'3px 10px', borderRadius:'20px', backgroundColor:LIGHT, color:BROWN },
  statusBadge: { fontSize:'12px', fontWeight:'600', padding:'4px 12px', borderRadius:'20px', display:'inline-block' },
  imgBtn: { fontSize:'13px', padding:'3px 8px', backgroundColor:'#f0f0f0', borderRadius:'6px', cursor:'pointer', color:'#555' },

  /* 버튼 */
  editInput: { padding:'7px 10px', borderRadius:'8px', border:'1.5px solid #e0d5cc', fontSize:'13px', width:'100%', outline:'none' },
  btnEdit:   { padding:'6px 12px', backgroundColor:LIGHT, color:BROWN, border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'12px', fontWeight:'600' },
  btnSave:   { padding:'6px 12px', backgroundColor:BROWN, color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'12px', fontWeight:'600' },
  btnCancel: { padding:'6px 12px', backgroundColor:'#f0f0f0', color:'#666', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'12px' },
  btnDel:    { padding:'6px 12px', backgroundColor:'#fff0f0', color:'#d32f2f', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'12px', fontWeight:'600' },

  /* 주문 상태 드롭다운 */
  statusSelect: { padding:'6px 12px', borderRadius:'20px', border:'none', fontSize:'12px', fontWeight:'700', cursor:'pointer', outline:'none' },

  /* 통계 탭 */
  statsTabRow: { display:'flex', gap:'8px', marginBottom:'16px' },
  statsTab: { padding:'9px 20px', border:`1.5px solid ${BROWN}`, backgroundColor:'white', color:BROWN, borderRadius:'20px', cursor:'pointer', fontSize:'13px', fontWeight:'600' },
  statsTabActive: { backgroundColor:BROWN, color:'white' },
};

export default AdminPage;
