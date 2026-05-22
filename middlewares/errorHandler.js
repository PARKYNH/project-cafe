// 전역 에러 핸들러
// - 컨트롤러/미들웨어에서 `next(err)`로 넘긴 에러를 여기서 한 번에 처리합니다.
// - 응답 형식 통일: 실패는 { success:false, message:"" }

module.exports = function errorHandler(err, req, res, next) {
  // eslint-disable-line no-unused-vars
  console.error('🚨 에러:', err.message); // ← 추가!
  const status = Number(err?.status || 500);
  const message =
    err?.message ||
    (status === 500 ? "서버 오류가 발생했습니다." : "요청 처리에 실패했습니다.");
  return res.status(status).json({
    success: false,
    message,
  });
};
