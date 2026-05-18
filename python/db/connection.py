# BREWY DB 연결 모듈
# Java의 JDBC Connection 같은 역할!

import mysql.connector
import os
from dotenv import load_dotenv

# .env 파일 로드
# Node.js의 require('dotenv').config() 와 같음!
load_dotenv(
    dotenv_path=os.path.join(
        os.path.dirname(__file__),
        '..', '.env'
    )
)

def get_connection():
    """
    MySQL 연결 반환
    Java의 DriverManager.getConnection() 같은것!
    """
    try:
        conn = mysql.connector.connect(
            host     = os.getenv('DB_HOST', 'localhost'),
            port     = int(os.getenv('DB_PORT', 3306)),
            user     = os.getenv('DB_USER', 'root'),
            password = os.getenv('DB_PASS', ''),
            database = os.getenv('DB_NAME', 'brewy'),
            charset  = 'utf8mb4'
        )
        print("✅ DB 연결 성공!")
        return conn

    except mysql.connector.Error as e:
        print(f"❌ DB 연결 실패: {e}")
        raise e


def close_connection(conn, cursor=None):
    """
    연결 종료
    Java의 conn.close() 같은것!
    """
    try:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
        print("✅ DB 연결 종료!")
    except Exception as e:
        print(f"❌ 연결 종료 실패: {e}")
