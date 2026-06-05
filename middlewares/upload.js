// middlewares/upload.js
//
// 📌 왜 만드나요?
//   클라이언트가 보내는 multipart/form-data 형식의 파일을
//   서버 디스크에 저장하는 미들웨어예요.
//   Java의 MultipartFile + FileSaveUtil 역할을 합니다.
//
// 🔧 multer 동작 방식
//   요청(Request) → multer가 파일 분리 → uploads/ 폴더에 저장
//   → req.file 에 파일 정보 주입 → 컨트롤러로 전달
//
// ⚠️ 주의사항
//   실무에서는 서버 디스크 대신 AWS S3에 올립니다.
//   지금은 로컬 학습용이라 디스크 저장 방식을 씁니다.

const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

// uploads 폴더 없으면 자동 생성
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// 저장 방식 설정
const storage = multer.diskStorage({

  // 저장 경로: /uploads/
  destination(req, file, cb) {
    cb(null, uploadDir);
  },

  // 파일명: product-{상품ID}-{타임스탬프}.확장자
  // 예) product-3-1717123456789.jpg
  filename(req, file, cb) {
    const ext      = path.extname(file.originalname).toLowerCase();
    const filename = `product-${req.params.id}-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

// 이미지 파일만 허용 (jpg, jpeg, png, webp)
const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext     = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('이미지 파일(jpg, png, webp)만 업로드 가능해요!'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 최대 5MB
});

module.exports = upload;
