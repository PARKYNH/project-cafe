// ecosystem.config.js
//
// 📌 이 파일이 뭐냐면?
//   PM2에게 "BREWY 서버를 이렇게 실행해줘!" 하고 알려주는 설정파일
//   Java로 치면 server.xml (Tomcat 설정) 또는 JVM 실행 옵션 파일과 비슷해요
//
// 📌 왜 필요하냐면?
//   node app.js → 수동 실행, 터미널 닫으면 꺼짐
//   pm2 start ecosystem.config.js → 자동관리, 서버 재시작해도 살아있음
//
// 📌 코딩 특이점
//   module.exports = {...} → CommonJS 방식으로 설정 객체를 내보냄
//   Node.js 파일간 데이터 공유할 때 쓰는 패턴
//   Java의 @Configuration 클래스와 동일한 역할

module.exports = {
  apps: [
    {
      // ── 앱 기본 정보 ──
      name: 'brewy-server',    // PM2 대시보드에서 보이는 이름
      script: 'app.js',        // 실행할 파일 (node app.js 의 app.js)
      cwd: '/home/ubuntu/brewy-fullstack', // AWS 서버에서의 실행 경로

      // ── 실행 옵션 ──
      instances: 1,            // 실행할 프로세스 수 (CPU 코어 수에 맞게)
      autorestart: true,       // 에러로 꺼지면 자동 재시작 ← 핵심!
      watch: false,            // 파일 변경 감지 (운영에선 false)
      max_memory_restart: '500M', // 메모리 500MB 초과 시 자동 재시작

      // ── 환경 변수 ──
      // 📌 로컬 개발 환경 (.env 파일 직접 사용)
      env: {
        NODE_ENV: 'development',
        PORT: 8080
      },
      // 📌 AWS 운영 환경 (pm2 start --env production)
      env_production: {
        NODE_ENV: 'production',
        PORT: 8080
      },

      // ── 로그 설정 ──
      // 📌 서버 로그를 파일로 저장 → 나중에 장애 추적 가능!
      //    더존 IDC 서버 로그 확인하는 것과 동일
      output: './logs/out.log',   // 일반 로그
      error: './logs/error.log',  // 에러 로그
      log_date_format: 'YYYY-MM-DD HH:mm:ss', // 로그 날짜 형식
    }
  ]
};
