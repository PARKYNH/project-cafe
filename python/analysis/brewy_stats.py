# BREWY 주문 데이터 분석 스크립트
# pandas DataFrame으로 통계 출력!

import sys
import os
import pandas as pd

# db 모듈 경로 추가
sys.path.append(
    os.path.join(os.path.dirname(__file__), '..')
)
from db.connection import get_connection, close_connection


def analyze_brewy():
    """
    BREWY 전체 데이터 분석
    """
    conn   = None
    cursor = None

    try:
        # DB 연결
        conn   = get_connection()
        cursor = conn.cursor(dictionary=True)

        print("\n" + "="*50)
        print("       ☕ BREWY 데이터 분석 리포트")
        print("="*50)

        # ─────────────────────────────
        # 1. 전체 주문 수
        # ─────────────────────────────
        cursor.execute("""
            SELECT COUNT(*) AS total_orders
            FROM orders
        """)
        result = cursor.fetchone()
        print(f"\n📦 전체 주문 수 : {result['total_orders']}건")

        # ─────────────────────────────
        # 2. 주문 상태별 현황
        # ─────────────────────────────
        cursor.execute("""
            SELECT
                status        AS 상태,
                COUNT(*)      AS 주문수
            FROM orders
            GROUP BY status
            ORDER BY 주문수 DESC
        """)
        rows = cursor.fetchall()
        df_status = pd.DataFrame(rows)
        print("\n📊 주문 상태별 현황")
        print("-"*30)
        print(df_status.to_string(index=False))

        # ─────────────────────────────
        # 3. 지점별 주문 수
        # ─────────────────────────────
        cursor.execute("""
            SELECT
                b.name        AS 지점명,
                COUNT(o.order_id) AS 주문수,
                SUM(o.total_price) AS 총매출
            FROM orders o
            JOIN branches b
            ON o.branch_id = b.branch_id
            GROUP BY b.branch_id, b.name
            ORDER BY 주문수 DESC
        """)
        rows = cursor.fetchall()
        df_branch = pd.DataFrame(rows)
        print("\n🏢 지점별 주문 현황")
        print("-"*30)
        if df_branch.empty:
            print("데이터 없음")
        else:
            print(df_branch.to_string(index=False))

        # ─────────────────────────────
        # 4. 인기 메뉴 TOP 5
        # ─────────────────────────────
        cursor.execute("""
            SELECT
                p.name           AS 메뉴명,
                SUM(oi.quantity) AS 주문수량,
                SUM(oi.quantity * oi.unit_price)
                                 AS 총매출
            FROM order_items oi
            JOIN products p
            ON oi.product_id = p.product_id
            GROUP BY p.product_id, p.name
            ORDER BY 주문수량 DESC
            LIMIT 5
        """)
        rows = cursor.fetchall()
        df_menu = pd.DataFrame(rows)
        print("\n🥇 인기 메뉴 TOP 5")
        print("-"*30)
        if df_menu.empty:
            print("데이터 없음")
        else:
            print(df_menu.to_string(index=False))

        # ─────────────────────────────
        # 5. 카테고리별 매출
        # ─────────────────────────────
        cursor.execute("""
            SELECT
                c.name           AS 카테고리,
                COUNT(DISTINCT oi.order_id)
                                 AS 주문건수,
                SUM(oi.quantity * oi.unit_price)
                                 AS 총매출
            FROM order_items oi
            JOIN products p
            ON oi.product_id = p.product_id
            JOIN categories c
            ON p.category_id = c.category_id
            GROUP BY c.category_id, c.name
            ORDER BY 총매출 DESC
        """)
        rows = cursor.fetchall()
        df_category = pd.DataFrame(rows)
        print("\n📂 카테고리별 매출")
        print("-"*30)
        if df_category.empty:
            print("데이터 없음")
        else:
            print(df_category.to_string(index=False))

        # ─────────────────────────────
        # 6. 일별 주문 현황
        # ─────────────────────────────
        cursor.execute("""
            SELECT
                DATE(created_at) AS 날짜,
                COUNT(*)         AS 주문수,
                SUM(total_price) AS 일매출
            FROM orders
            GROUP BY DATE(created_at)
            ORDER BY 날짜 DESC
            LIMIT 7
        """)
        rows = cursor.fetchall()
        df_daily = pd.DataFrame(rows)
        print("\n📅 최근 일별 주문 현황")
        print("-"*30)
        if df_daily.empty:
            print("데이터 없음")
        else:
            print(df_daily.to_string(index=False))

        print("\n" + "="*50)
        print("       ✅ 분석 완료!")
        print("="*50 + "\n")

    except Exception as e:
        print(f"❌ 분석 중 오류: {e}")
        raise

    finally:
        close_connection(conn, cursor)


if __name__ == "__main__":
    analyze_brewy()
