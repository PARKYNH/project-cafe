import React from 'react';
import { useNavigate } from 'react-router-dom';

const TECH_BREWY    = ['React', 'Node.js', 'MySQL', 'AWS', 'OpenAI API'];
const TECH_AVIATION = ['Spring Boot', 'Java', 'PostgreSQL', 'MSA', 'Docker'];

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── 헤더 ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 h-11 border-b border-[#D2D2D7]/30"
        style={{
          background: 'rgba(255,255,255,0.72)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          backdropFilter: 'saturate(180%) blur(20px)',
        }}
      >
        <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center justify-between">
          <span className="text-[13px] font-black tracking-[6px] text-[#1D1D1F]">BREWY</span>
          <button
            onClick={() => navigate('/login')}
            className="text-[13px] text-[#6E6E73] hover:text-[#1D1D1F] transition-colors"
          >
            서비스 로그인
          </button>
        </div>
      </header>

      {/* ── 히어로 ── */}
      <section className="pt-40 pb-24 px-6">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-[11px] font-semibold tracking-[5px] text-[#AEAEB2] uppercase mb-5">
            Portfolio
          </p>
          <h1 className="text-[56px] sm:text-[72px] font-bold text-[#1D1D1F] tracking-tight leading-[1.05] mb-3">
            박용희
          </h1>
          <p className="text-[22px] text-[#6E6E73] font-light mb-5">Backend Developer</p>
          <p className="text-[16px] text-[#AEAEB2] max-w-[440px] leading-relaxed">
            실서비스를 직접 기획하고 개발하는 풀스택 개발자입니다.
          </p>
        </div>
      </section>

      {/* ── 프로젝트 ── */}
      <section className="px-6 pb-36">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-[11px] font-semibold tracking-[5px] text-[#AEAEB2] uppercase mb-10">
            Projects
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* BREWY 카드 */}
            <div
              onClick={() => navigate('/order')}
              className="bg-[#1D1D1F] rounded-[28px] p-10 cursor-pointer group
                         hover:-translate-y-1 hover:shadow-[0_32px_80px_rgba(0,0,0,0.22)]
                         transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-8">
                <span className="text-[13px] font-black tracking-[6px] text-white/90">BREWY</span>
                <span className="px-3 py-1 bg-green-500/15 text-green-400 text-[11px] font-semibold rounded-full">
                  실서비스 운영 중
                </span>
              </div>

              <h3 className="text-[26px] font-bold text-white tracking-tight mb-3 leading-snug">
                카페 주문 관리<br />풀스택 서비스
              </h3>
              <p className="text-[14px] text-white/50 mb-10 leading-relaxed">
                실시간 주문, AI 챗봇, 관리자 대시보드까지<br />
                기획부터 배포까지 직접 구현
              </p>

              <div className="flex flex-wrap gap-2">
                {TECH_BREWY.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-white/10 text-white/70 text-[12px] font-medium rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex items-center gap-1.5 text-[13px] text-white/35
                              group-hover:text-white/70 transition-colors">
                서비스 체험하기
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">›</span>
              </div>
            </div>

            {/* AVIATION 카드 */}
            <div
              onClick={() => window.open('https://github.com/dev-parkynh/project-aviation', '_blank')}
              className="bg-[#F5F5F7] rounded-[28px] p-10 cursor-pointer group
                         hover:-translate-y-1 hover:shadow-[0_32px_80px_rgba(0,0,0,0.10)]
                         transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-8">
                <span className="text-[13px] font-semibold tracking-[3px] text-[#6E6E73]">AVIATION</span>
                <span className="flex items-center gap-1.5 text-[12px] text-[#AEAEB2]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  GitHub
                </span>
              </div>

              <h3 className="text-[26px] font-bold text-[#1D1D1F] tracking-tight mb-3 leading-snug">
                항공 예약 시스템<br />포트폴리오
              </h3>
              <p className="text-[14px] text-[#6E6E73] mb-10 leading-relaxed">
                MSA 아키텍처 기반 항공권 예약 시스템<br />
                마이크로서비스 설계 및 구현
              </p>

              <div className="flex flex-wrap gap-2">
                {TECH_AVIATION.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-white text-[#6E6E73] text-[12px] font-medium rounded-full border border-[#E8E8ED]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex items-center gap-1.5 text-[13px] text-[#AEAEB2]
                              group-hover:text-[#1D1D1F] transition-colors">
                GitHub에서 보기
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">›</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 푸터 ── */}
      <footer className="border-t border-[#F5F5F7] py-10">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
          <span className="text-[12px] font-black tracking-[6px] text-[#1D1D1F]">BREWY</span>
          <p className="text-[12px] text-[#AEAEB2]">© 2026 박용희</p>
        </div>
      </footer>

    </div>
  );
}

export default LandingPage;
