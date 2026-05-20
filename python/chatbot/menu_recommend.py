# BREWY 메뉴 추천 챗봇
# OpenAI API + MySQL 연동!

import sys
import os
from openai import OpenAI
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv(
    dotenv_path=os.path.join(
        os.path.dirname(__file__),
        '..', '.env'
    )
)

# DB 연결 모듈
sys.path.append(
    os.path.join(os.path.dirname(__file__), '..')
)
from db.connection import get_connection, close_connection

# OpenAI 클라이언트
client = OpenAI(
    api_key=os.getenv('OPENAI_API_KEY')
)


def get_menu_list():
    """
    DB에서 메뉴 목록 가져오기
    AI한테 메뉴 정보 전달용!
    """
    conn   = None
    cursor = None
    try:
        conn   = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                p.name        AS 메뉴명,
                p.price       AS 가격,
                p.description AS 설명,
                c.name        AS 카테고리
            FROM products p
            JOIN categories c
            ON p.category_id = c.category_id
            WHERE p.is_active   = 1
            AND   p.is_sold_out = 0
            ORDER BY c.sort_order, p.name
        """)
        menus = cursor.fetchall()
        return menus

    finally:
        close_connection(conn, cursor)


def build_menu_text(menus):
    """
    메뉴 목록을 텍스트로 변환
    AI 프롬프트에 넣을 형식!
    """
    text = "[ BREWY 카페 메뉴 ]\n"
    for menu in menus:
        text += (
            f"- {menu['메뉴명']} "
            f"({menu['카테고리']}) "
            f"{menu['가격']}원 "
            f": {menu['설명']}\n"
        )
    return text


def recommend_menu(user_input, menus):
    """
    OpenAI API로 메뉴 추천!
    Java로 치면 Service 메서드!
    """
    menu_text = build_menu_text(menus)

    response = client.chat.completions.create(
        model="gpt-4o-mini",  # 저렴한 모델!
        messages=[
            {
                "role": "system",
                "content": f"""
너는 BREWY 카페의 친절한 메뉴 추천 직원이야.
손님의 기분이나 상황에 맞는 메뉴를 추천해줘.

{menu_text}

추천할 때 규칙
1. 위 메뉴 중에서만 추천
2. 추천 이유 간단히 설명
3. 친근하고 따뜻한 말투
4. 1~2개만 추천
"""
            },
            {
                "role": "user",
                "content": user_input
            }
        ],
        max_tokens=300,
        temperature=0.7
    )

    return response.choices[0].message.content


def main():
    """
    메인 함수 - 챗봇 실행!
    """
    print("\n" + "="*50)
    print("   ☕ BREWY 메뉴 추천 챗봇")
    print("="*50)
    print("종료하려면 'quit' 입력!\n")

    # DB에서 메뉴 가져오기
    print("메뉴 불러오는 중...")
    menus = get_menu_list()
    print(f"✅ 메뉴 {len(menus)}개 로드 완료!\n")

    # 챗봇 루프
    while True:
        user_input = input("👤 나 : ").strip()

        if user_input.lower() == 'quit':
            print("\n☕ 또 방문해주세요!")
            break

        if not user_input:
            continue

        print("\n🤖 BREWY : ", end="")
        response = recommend_menu(user_input, menus)
        print(response)
        print()


if __name__ == "__main__":
    main()