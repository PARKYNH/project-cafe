require("dotenv").config();

const express  = require("express");
const cors     = require("cors");

// 📌 morgan: HTTP 요청 로깅 미들웨어
//    모든 API 호출을 자동으로 콘솔/파일에 기록
//    "GET /api/products 200 12ms" 형태로 찍힘
//    더존 서버 로그에서 API 호출 이력 보는 것과 동일!
const morgan   = require("morgan");

// 📌 express-rate-limit: 요청 횟수 제한 미들웨어
//    동일 IP에서 단시간에 너무 많은 요청 → 차단
//    해킹(Brute Force) / DoS 공격 방어
//    공공기관 ERP 보안 요구사항에도 해당!
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const branchRoutes = require("./routes/branches");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// ① CORS
//    프론트(3000) → 백엔드(8080) 호출 허용
//    AWS 배포 후엔 origin을 실제 도메인으로 변경 필요
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL  // 운영: 실제 도메인
    : 'http://localhost:3000',  // 개발: 로컬
  credentials: true
}));

// ② Morgan 로깅
//    개발: 'dev' → 색상 있는 간결한 로그
//    운영: 'combined' → Apache 표준 형식 (IP, 날짜, 브라우저 정보 포함)
//    💡 운영 로그는 ecosystem.config.js 의 logs/out.log 파일로 저장됨
app.use(morgan(
  process.env.NODE_ENV === 'production' ? 'combined' : 'dev'
));

// ③ JSON Body 파싱
app.use(express.json({ limit: "10mb" }));

// ④ Rate Limiting
//    📌 전체 API 제한: 15분에 200번
//    일반 사용자는 절대 안 걸리는 수치
//    봇/해커는 1초에 수백번 요청 → 차단!
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 200,
  message: {
    success: false,
    message: '요청이 너무 많아요. 잠시 후 다시 시도해주세요.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

//    📌 로그인 전용 제한: 15분에 10번
//    비밀번호 무차별 대입 공격 방어!
//    10번 틀리면 15분 잠금 → 은행 앱이랑 같은 방식
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: '로그인 시도가 너무 많아요. 15분 후 다시 시도해주세요.'
  }
});
app.use('/api/auth/login', loginLimiter);

// 📌 정적 파일 서빙 — 업로드된 이미지를 URL로 접근 가능하게!
//    http://localhost:8080/uploads/product-1-xxx.jpg 형태로 접근
//    Java의 ResourceHandler / nginx static 설정과 동일한 역할
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 간단한 헬스체크
app.get("/health", (req, res) => {
  return res.json({ success: true });
});

// API 라우팅
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use('/api/stamps', require('./routes/stamps'));
app.use('/api/coupons', require('./routes/coupons'));
// 기존 라우터 아래에 추가!
app.use('/api/admin', require('./routes/admin'));


// 존재하지 않는 엔드포인트 처리 (응답 형식 통일)
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "요청하신 API를 찾을 수 없습니다.",
  });
});

// 전역 에러 핸들러
app.use(errorHandler);

const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
  // 운영 환경에서는 콘솔 로그를 구조화 로거로 교체하는 것이 좋습니다.
  console.log(`[BREWY] Server listening on port ${port}`);
});

