const mysql = require("mysql2/promise");

// MySQL 연결 풀(pool) 생성
// - pool 방식은 매 요청마다 연결을 새로 만들지 않고 재사용하여 성능이 좋습니다.
// - SQL Injection 방지를 위해 모든 쿼리는 반드시 `?` 바인딩을 사용하세요.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // 날짜/시간을 문자열로 받으면 타임존 이슈 디버깅이 쉬워집니다.
  dateStrings: true,
});

module.exports = pool;

