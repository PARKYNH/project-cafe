require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const branchRoutes = require("./routes/branches");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// CORS 허용 (프론트엔드/모바일 등 다양한 클라이언트에서 접근 가능)
app.use(cors());

// JSON Body 파싱
app.use(express.json({ limit: "1mb" }));

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

