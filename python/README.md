# ☕ BREWY Python 데이터 분석

BREWY 카페 주문 서비스의
데이터를 분석하는 Python 스크립트입니다.

## 기술 스택
- Python 3.13
- mysql-connector-python
- pandas
- python-dotenv

## 폴더 구조
python/
├── .env                    # DB 연결 정보
├── requirements.txt        # 패키지 목록
├── db/
│   └── connection.py       # DB 연결 모듈
└── analysis/
    └── brewy_stats.py      # 데이터 분석

## 실행 방법

### 1. 패키지 설치
pip install -r requirements.txt

### 2. 환경변수 설정
.env 파일에 DB 비밀번호 입력
DB_PASS=비밀번호

### 3. 분석 실행
cd python
python analysis/brewy_stats.py

## 분석 항목
- 전체 주문 수
- 주문 상태별 현황
- 지점별 주문/매출
- 인기 메뉴 TOP 5
- 카테고리별 매출
- 일별 주문 현황