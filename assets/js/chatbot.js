/**
 * IKEA AI 챗봇 시스템 (Hej AI Assistant)
 * 디자인 시스템 토큰 및 Vanilla JS 기반 실시간 반응형 챗봇
 */
(function () {
  // 중복 실행 방지
  if (window.__IKEA_CHATBOT_INITIALIZED__) return;
  window.__IKEA_CHATBOT_INITIALIZED__ = true;

  // 현재 위치가 /common/ 하위인지 확인
  const isCommon = window.location.pathname.indexOf('/common/') !== -1;
  const commonPath = isCommon ? '' : 'common/';

  // 챗봇 응답 지식 베이스 (IKEA 서비스 & 쇼핑 가이드)
  const KNOWLEDGE_BASE = [
    {
      keywords: ['배송', '택배', '배송비', '배송조회', '운임', '도착', '배송료'],
      title: '📦 배송 서비스 안내',
      reply: '이케아의 배송 서비스는 상품 크기와 유형에 따른 <strong>정찰제 요금</strong>으로 운영됩니다.<br><br>' +
        '• <strong>소형 택배 배송</strong>: 5,000원 (소품, 수납함 등)<br>' +
        '• <strong>가구 배송 (소형)</strong>: 29,000원 (의자, 협탁, 소형 책상 등)<br>' +
        '• <strong>가구 배송 (일반 대형)</strong>: 49,000원 (침대, 소파, 서랍장 등)<br>' +
        '• <strong>초대형 가구 배송</strong>: 89,000원 (붙박이장, 시스템 주방 등)<br><br>' +
        '배송 일정 지정 및 자세한 배송 규정은 배송 안내 페이지에서 확인하실 수 있습니다.',
      actionLink: commonPath + 'delivery.html',
      actionText: '배송 서비스 상세 보기 →'
    },
    {
      keywords: ['조립', '설치', '조립비', '기사', '시공', '설치비'],
      title: '🔧 조립 & 설치 서비스',
      reply: '전문 기사님이 안전하고 완벽하게 조립해 드립니다.<br><br>' +
        '• <strong>기본 출장비</strong>: 30,000원 (1회 방문 기준)<br>' +
        '• <strong>소형/단품 가구</strong>: 품목당 15,000원 ~ 35,000원<br>' +
        '• <strong>대형 수납/침대</strong>: 품목당 40,000원 ~ 80,000원<br>' +
        '• <strong>벽 고정 서비스</strong>: 가구 전도 방지를 위한 안전 벽고정 무료 지원<br><br>' +
        '구매 시 조립 옵션을 함께 선택하시면 배송일에 맞춰 전문 조립 서비스가 제공됩니다.',
      actionLink: commonPath + 'installation.html',
      actionText: '조립/설치 서비스 안내 →'
    },
    {
      keywords: ['플래닝', '스타일링', '컨설팅', '인테리어', '공간', '상담', '셀프'],
      title: '🛋️ 홈퍼니싱 플래닝 & 스타일링',
      reply: '전문 디자이너의 1:1 맞춤 공간 컨설팅부터 3D 셀프 플래닝까지 지원합니다.<br><br>' +
        '• <strong>1:1 전문 홈스타일링</strong>: 전문 디자이너와의 공간 맞춤 제안<br>' +
        '• <strong>3D 셀프 플래닝</strong>: 무료 온라인 플래너로 내 방 구조에 딱 맞게 가상 배치<br>' +
        '• <strong>비즈니스 공간 플래닝</strong>: 오피스 및 카페 맞춤 대량 납품 솔루션',
      actionLink: commonPath + 'styling.html',
      actionText: '홈스타일링 서비스 바로가기 →'
    },
    {
      keywords: ['할인', '세일', '특가', '프로모션', '낮은가격', 'sale', '이벤트'],
      title: '🏷️ 특별 할인 & 낮은 가격',
      reply: '더 합리적인 가격으로 만나는 이케아 특별 혜택을 확인해보세요!<br><br>' +
        '• <strong>더 낮은 새로운 가격</strong>: 인기 스테디셀러 영구 가격 인하<br>' +
        '• <strong>시즌 한정 세일</strong>: 최대 50% 시즌 오프 특가전<br>' +
        '• <strong>패밀리 특별 할인</strong>: 멤버십 회원 대상 추가 10%~20% 할인',
      actionLink: commonPath + 'sale.html',
      actionText: '할인 상품 둘러보기 →'
    },
    {
      keywords: ['반품', '환불', '교환', '취소', '철회', 'as'],
      title: '🔄 교환 및 반품 규정',
      reply: '이케아는 마음이 바뀌어도 안심할 수 있는 <strong>365일 반품 정책</strong>을 제공합니다.<br><br>' +
        '• <strong>반품 가능 기간</strong>: 구매일로부터 365일 이내 (영수증 및 제품 원상태 지참)<br>' +
        '• <strong>단순 변심</strong>: 미사용 제품 원포장 상태 시 100% 전액 환불<br>' +
        '• <strong>조립된 제품</strong>: 제품 상태 확인 후 환불 카드 지급 가능<br>' +
        '• <strong>접수 방법</strong>: 가까운 매장 교환/환불 데스크 방문 또는 온라인 회수 신청',
      actionLink: commonPath + 'service.html',
      actionText: '고객 서비스 센터 바로가기 →'
    },
    {
      keywords: ['매장', '영업시간', '위치', '광명', '고양', '기흥', '동부산', '강동', '강동점', '레스토랑', '식당'],
      title: '📍 매장 안내 & 영업시간',
      reply: '전국 IKEA 오프라인 매장 안내입니다.<br><br>' +
        '• <strong>매장 쇼룸</strong>: 10:00 - 21:00 (연중무휴, 설날/추석 당일 휴무)<br>' +
        '• <strong>레스토랑 & 카페</strong>: 09:30 - 20:30<br>' +
        '• <strong>매장 위치</strong>:<br>' +
        '  - 광명점: 경기도 광명시 일직로 17<br>' +
        '  - 고양점: 경기도 고양시 덕양구 권율대로 420<br>' +
        '  - 기흥점: 경기도 용인시 기흥구 신고매로 62<br>' +
        '  - 동부산점: 부산광역시 기장군 기장읍 동부산관광3로 17<br>' +
        '  - 강동점: 서울특별시 강동구 고덕비즈밸리로 26',
      actionLink: commonPath + 'service.html',
      actionText: '매장 찾기 및 서비스 센터 →'
    },
    {
      keywords: ['패밀리', 'family', '멤버십', '회원', '혜택', '커피', '무료'],
      title: '💛 IKEA Family 멤버십 혜택',
      reply: '누구나 무료로 가입하고 풍성한 혜택을 누릴 수 있습니다.<br><br>' +
        '• <strong>평일 무료 커피</strong>: 매장 레스토랑 방문 시 따뜻한 커피 무료<br>' +
        '• <strong>멤버 특별가</strong>: 매달 업데이트되는 패밀리 단독 할인가<br>' +
        '• <strong>무료 14일 안심 보험</strong>: 가구 운반/조립 중 파손 시 14일 이내 무료 교환<br>' +
        '• <strong>홈퍼니싱 워크숍</strong>: 전문가와 함께하는 인테리어 클래스 초대',
      actionLink: commonPath + 'family.html',
      actionText: 'IKEA Family 알아보기 →'
    },
    {
      keywords: ['장바구니', '카트', '위시리스트', '찜', '담은', '보관함'],
      title: '🛒 장바구니 & 관심 상품',
      reply: '현재 관심 있는 상품과 장바구니 담긴 품목을 확인해보세요.<br><br>' +
        '상품 페이지 및 카테고리에서 하트(찜) 또는 장바구니 아이콘을 클릭하시면 언제든 보관함에 저장됩니다.',
      actionLink: commonPath + 'cart.html',
      actionText: '장바구니 보러가기 →'
    },
    {
      keywords: ['주문', '결제', '영수증', '카드', '조회', '내역'],
      title: '📋 주문 및 결제 안내',
      reply: '신용카드, 간편결제(카카오페이, 네이버페이), 무통장 입금 등 다양한 결제 수단을 지원합니다.<br><br>' +
        '주문 완료 후 배송 진행 현황은 주문 내역 페이지에서 실시간 조회 가능합니다.',
      actionLink: commonPath + 'orders.html',
      actionText: '주문 내역 조회하기 →'
    }
  ];

  // 빠른 질문 칩
  const QUICK_CHIPS = [
    { label: '📦 배송비 조회', query: '배송비와 배송 규정 알려줘' },
    { label: '🔧 조립비 안내', query: '조립 및 설치 서비스 비용이 얼마인가요?' },
    { label: '🛋️ 가구 맞춤 플래닝', query: '인테리어 맞춤 스타일링 플래닝' },
    { label: '🏷️ 이번 주 특가/세일', query: '할인 행사와 세일 상품' },
    { label: '🔄 365일 교환/반품', query: '반품 규정과 환불 절차' },
    { label: '📍 매장 영업시간', query: '가까운 매장과 영업시간 안내' },
    { label: '💛 패밀리 멤버십', query: 'IKEA Family 멤버십 혜택' }
  ];

  // DOM 렌더링
  function injectChatbot() {
    // 이미 존재하는지 재확인
    if (document.getElementById('ikea-chatbot-container')) return;

    const container = document.createElement('div');
    container.id = 'ikea-chatbot-container';
    container.className = 'ikea-chatbot-root';

    const isTooltipDismissed = sessionStorage.getItem('ikea_chatbot_tooltip_dismissed') === 'true';
    const tooltipHtml = isTooltipDismissed ? '' : `
        <!-- 말풍선 안내 툴팁 (첫 방문 시 주목도 UP) -->
        <div id="ikea-chat-tooltip" class="hidden sm:flex items-center gap-2 bg-ink text-white text-xs font-semibold px-3.5 py-2 rounded-full shadow-lg border border-white/20 animate-bounce cursor-pointer hover:bg-brand transition-colors duration-200">
          <span class="inline-block w-2 h-2 rounded-full bg-accent animate-ping"></span>
          <span>Hej! 궁금한 점을 AI에게 물어보세요</span>
          <button type="button" id="ikea-tooltip-close" class="text-white/60 hover:text-white ml-1 text-sm font-bold leading-none" aria-label="안내 닫기">&times;</button>
        </div>
    `;

    container.innerHTML = `
      <!-- 플로팅 트리거 버튼 (FAB) -->
      <aside aria-label="IKEA AI 실시간 상담" class="fixed bottom-24 right-5 sm:bottom-28 sm:right-6 z-[9990] flex flex-col items-end gap-2 font-sans select-none">
        
        ${tooltipHtml}

        <!-- 메인 토글 버튼 -->
        <button
          type="button"
          id="ikea-chat-toggle-btn"
          aria-label="AI 상담 챗봇 열기"
          aria-expanded="false"
          class="group relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-accent text-ink shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand cursor-pointer"
          style="background-color: var(--color-accent, #FFC900); color: var(--color-ink, #111418); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);"
        >
          <!-- 챗봇 닫혀있을 때 아이콘 -->
          <div id="ikea-chat-icon-open" class="flex flex-col items-center justify-center transition-transform group-hover:rotate-6">
            <svg class="w-7 h-7 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.03 2 11c0 2.274 0.942 4.354 2.518 5.892L3.5 21.5l5.084-1.695C9.722 20.082 10.838 20.2 12 20.2c5.523 0 10-4.03 10-9.2S17.523 2 12 2zm-3.5 8.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm3.5 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm3.5 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/>
            </svg>
            <span class="text-[10px] font-extrabold tracking-tighter leading-tight mt-0.5">AI 상담</span>
          </div>

          <!-- 챗봇 열려있을 때 닫기(X) 아이콘 -->
          <div id="ikea-chat-icon-close" class="hidden text-ink">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </div>

          <!-- 온라인 활성 상태 배지 -->
          <span class="absolute top-0 right-0 flex h-4 w-4">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
            <span class="relative inline-flex rounded-full h-4 w-4 bg-brand border-2 border-white"></span>
          </span>
        </button>
      </aside>

      <!-- 챗봇 모달 다이얼로그 창 -->
      <section
        id="ikea-chat-window"
        role="dialog"
        aria-label="IKEA AI 실시간 상담창"
        aria-hidden="true"
        class="hidden fixed bottom-0 right-0 sm:bottom-48 sm:right-6 w-full sm:w-[410px] h-[85vh] sm:h-[620px] max-h-[700px] bg-white sm:rounded-2xl shadow-2xl border border-line-light z-[9995] flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-right"
        style="box-shadow: 0 16px 40px rgba(0, 0, 0, 0.22);"
      >
        <!-- 챗봇 헤더 (IKEA 브랜드 컬러) -->
        <header class="bg-brand text-white px-5 py-4 flex items-center justify-between shadow-md" style="background-color: var(--color-brand, #0051BA);">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-accent text-ink flex items-center justify-center font-extrabold text-sm shadow-sm" style="background-color: var(--color-accent, #FFC900);">
              Hej!
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-base font-bold text-white leading-snug">IKEA AI 어시스턴트</h2>
                <span class="text-[10px] bg-white/20 text-white font-medium px-1.5 py-0.5 rounded">BETA</span>
              </div>
              <p class="text-xs text-white/80 flex items-center gap-1.5 mt-0.5">
                <span class="w-2 h-2 rounded-full bg-[#10B981] inline-block animate-pulse"></span>
                실시간 24시간 도우미
              </p>
            </div>
          </div>

          <!-- 헤더 액션 버튼 (대화 초기화, 창 닫기) -->
          <div class="flex items-center gap-1">
            <button
              type="button"
              id="ikea-chat-reset-btn"
              title="대화 내용 초기화"
              class="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              aria-label="대화 초기화"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              type="button"
              id="ikea-chat-close-btn"
              title="상담창 닫기"
              class="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              aria-label="상담창 닫기"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </header>

        <!-- 챗봇 대화 메시지 영역 -->
        <div id="ikea-chat-messages" class="flex-1 overflow-y-auto p-4 space-y-4 bg-bg-light scroll-smooth" style="background-color: var(--color-bg-light, #F8F9FA);">
          
          <!-- 웰컴 메시지 카드 -->
          <div class="flex items-start gap-2.5 max-w-[92%]">
            <div class="w-8 h-8 rounded-full bg-accent text-ink flex-shrink-0 flex items-center justify-center font-bold text-xs shadow-xs" style="background-color: var(--color-accent, #FFC900);">
              Hej
            </div>
            <div class="bg-white border border-line-light rounded-2xl rounded-tl-sm p-4 shadow-sm text-sm text-ink leading-relaxed">
              <p class="font-bold text-brand mb-1">Hej! IKEA에 오신 것을 환영합니다 🇸🇪</p>
              <p class="text-ink-2">배송, 조립, 매장 정보, 인테리어 플래닝 등 무엇이든 물어보세요! 아래 빠른 질문을 누르셔도 바로 확인하실 수 있습니다.</p>
            </div>
          </div>

          <!-- 빠른 추천 질문 칩 목록 -->
          <div id="ikea-chat-quick-chips" class="pt-1 pb-2">
            <p class="text-[11px] font-bold text-ink-muted mb-2 px-1">💡 추천 질문</p>
            <div class="flex flex-wrap gap-1.5">
              ${QUICK_CHIPS.map(function (c) {
                return '<button type="button" class="ikea-quick-btn text-xs bg-white hover:bg-brand hover:text-white text-ink border border-line-light px-3 py-1.5 rounded-full shadow-xs transition-all duration-150 cursor-pointer text-left" data-query="' + c.query + '">' + c.label + '</button>';
              }).join('')}
            </div>
          </div>

        </div>

        <!-- 타이핑 인디케이터 (답변 생성 중 표시) -->
        <div id="ikea-chat-typing" class="hidden px-5 py-2 bg-bg-light border-t border-line-light/50 flex items-center gap-2 text-xs text-ink-muted">
          <div class="flex items-center gap-1">
            <span class="w-1.5 h-1.5 bg-brand rounded-full animate-bounce"></span>
            <span class="w-1.5 h-1.5 bg-brand rounded-full animate-bounce [animation-delay:0.2s]"></span>
            <span class="w-1.5 h-1.5 bg-brand rounded-full animate-bounce [animation-delay:0.4s]"></span>
          </div>
          <span>IKEA AI가 답변을 작성 중입니다...</span>
        </div>

        <!-- 하단 입력 영역 -->
        <footer class="p-3 bg-white border-t border-line-light">
          <form id="ikea-chat-form" class="flex items-center gap-2">
            <input
              type="text"
              id="ikea-chat-input"
              placeholder="궁금한 내용을 입력하세요... (예: 배송비, 조립)"
              autocomplete="off"
              class="flex-1 bg-search-bg text-ink text-sm px-4 py-3 rounded-full border border-transparent focus:border-brand focus:bg-white focus:outline-none transition-colors"
              style="background-color: var(--color-search-bg, #F3F4F6);"
            />
            <button
              type="submit"
              id="ikea-chat-send-btn"
              aria-label="메시지 전송"
              class="w-11 h-11 rounded-full bg-brand text-white flex items-center justify-center hover:bg-brand-dark transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand flex-shrink-0"
              style="background-color: var(--color-brand, #0051BA);"
            >
              <svg class="w-5 h-5 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </form>
          <div class="flex items-center justify-between px-2 pt-2 text-[10px] text-ink-muted">
            <span>고객센터 ☎ 1670-4532 (09:00~21:00)</span>
            <span>IKEA Korea Official AI</span>
          </div>
        </footer>
      </section>
    `;

    document.body.appendChild(container);

    // 이벤트 리스너 바인딩
    setupChatbotEvents();
  }

  // 이벤트 핸들링
  function setupChatbotEvents() {
    const toggleBtn = document.getElementById('ikea-chat-toggle-btn');
    const closeBtn = document.getElementById('ikea-chat-close-btn');
    const resetBtn = document.getElementById('ikea-chat-reset-btn');
    const chatWindow = document.getElementById('ikea-chat-window');
    const openIcon = document.getElementById('ikea-chat-icon-open');
    const closeIcon = document.getElementById('ikea-chat-icon-close');
    const form = document.getElementById('ikea-chat-form');
    const input = document.getElementById('ikea-chat-input');
    const tooltip = document.getElementById('ikea-chat-tooltip');
    const tooltipClose = document.getElementById('ikea-tooltip-close');

    // 툴팁 닫기
    if (tooltipClose && tooltip) {
      tooltipClose.addEventListener('click', function (e) {
        e.stopPropagation();
        tooltip.remove();
        sessionStorage.setItem('ikea_chatbot_tooltip_dismissed', 'true');
      });
    }

    // 툴팁 클릭 시 챗봇 열기
    if (tooltip) {
      tooltip.addEventListener('click', function () {
        openChat();
      });
    }

    function toggleChat() {
      const isHidden = chatWindow.classList.contains('hidden');
      if (isHidden) {
        openChat();
      } else {
        closeChat();
      }
    }

    function openChat(initialQuery) {
      chatWindow.classList.remove('hidden');
      chatWindow.setAttribute('aria-hidden', 'false');
      toggleBtn.setAttribute('aria-expanded', 'true');
      openIcon.classList.add('hidden');
      closeIcon.classList.remove('hidden');
      if (tooltip) {
        tooltip.remove();
        sessionStorage.setItem('ikea_chatbot_tooltip_dismissed', 'true');
      }

      // 포커스 이동 및 인풋 활성화
      setTimeout(function () {
        if (input) input.focus();
      }, 100);

      // 초기 질문이 지정된 경우 즉시 질문 전송
      if (initialQuery && typeof initialQuery === 'string') {
        sendMessage(initialQuery);
      }
    }

    function closeChat() {
      chatWindow.classList.add('hidden');
      chatWindow.setAttribute('aria-hidden', 'true');
      toggleBtn.setAttribute('aria-expanded', 'false');
      openIcon.classList.remove('hidden');
      closeIcon.classList.add('hidden');
    }

    if (toggleBtn) toggleBtn.addEventListener('click', toggleChat);
    if (closeBtn) closeBtn.addEventListener('click', closeChat);

    // 대화 초기화
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        const messagesDiv = document.getElementById('ikea-chat-messages');
        if (!messagesDiv) return;
        messagesDiv.innerHTML = `
          <div class="flex items-start gap-2.5 max-w-[92%]">
            <div class="w-8 h-8 rounded-full bg-accent text-ink flex-shrink-0 flex items-center justify-center font-bold text-xs shadow-xs" style="background-color: var(--color-accent, #FFC900);">
              Hej
            </div>
            <div class="bg-white border border-line-light rounded-2xl rounded-tl-sm p-4 shadow-sm text-sm text-ink leading-relaxed">
              <p class="font-bold text-brand mb-1">대화가 새로 시작되었습니다 🇸🇪</p>
              <p class="text-ink-2">배송, 조립, 매장 정보, 인테리어 플래닝 등 무엇이든 물어보세요!</p>
            </div>
          </div>
          <div id="ikea-chat-quick-chips" class="pt-1 pb-2">
            <p class="text-[11px] font-bold text-ink-muted mb-2 px-1">💡 추천 질문</p>
            <div class="flex flex-wrap gap-1.5">
              ${QUICK_CHIPS.map(function (c) {
                return '<button type="button" class="ikea-quick-btn text-xs bg-white hover:bg-brand hover:text-white text-ink border border-line-light px-3 py-1.5 rounded-full shadow-xs transition-all duration-150 cursor-pointer text-left" data-query="' + c.query + '">' + c.label + '</button>';
              }).join('')}
            </div>
          </div>
        `;
        bindQuickChips();
      });
    }

    // 폼 제출
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        input.value = '';
        sendMessage(text);
      });
    }

    // 추천 질문 칩 클릭 이벤트 바인딩
    function bindQuickChips() {
      const chips = document.querySelectorAll('.ikea-quick-btn');
      chips.forEach(function (btn) {
        btn.addEventListener('click', function () {
          const q = btn.getAttribute('data-query');
          if (q) sendMessage(q);
        });
      });
    }
    bindQuickChips();

    // 외부 공개 API (어디서든 호출 가능)
    window.openIkeaChatbot = function (initialMsg) {
      openChat(initialMsg);
    };
    window.closeIkeaChatbot = function () {
      closeChat();
    };

    // 페이지 내 챗봇 상담 열기 버튼 자동 연동 (data-open-chatbot 또는 챗봇 문구가 들어간 버튼)
    document.addEventListener('click', function (e) {
      const target = e.target.closest('button, a');
      if (!target) return;

      const hasAttr = target.hasAttribute('data-open-chatbot');
      const btnText = (target.textContent || '').trim();
      const isChatbotBtn = btnText.indexOf('챗봇') !== -1 || btnText.indexOf('실시간 상담') !== -1 || btnText.indexOf('온라인 채팅') !== -1;

      // 자체 토글 버튼이 아닌 경우에만 챗봇 창 열기
      if ((hasAttr || isChatbotBtn) && target.id !== 'ikea-chat-toggle-btn' && target.id !== 'ikea-chat-close-btn') {
        e.preventDefault();
        openChat(btnText.indexOf('배송') !== -1 ? '배송 문의' : (btnText.indexOf('조립') !== -1 ? '조립 서비스 문의' : '안녕하세요! 상담을 시작합니다.'));
      }
    });
  }

  // 메시지 전송 및 AI 응답 생성
  function sendMessage(userText) {
    const messagesDiv = document.getElementById('ikea-chat-messages');
    const typingDiv = document.getElementById('ikea-chat-typing');
    if (!messagesDiv) return;

    // 1. 사용자 메시지 말풍선 추가
    const userBubble = document.createElement('div');
    userBubble.className = 'flex justify-end';
    userBubble.innerHTML = `
      <div class="bg-brand text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%] text-sm leading-relaxed shadow-sm break-words" style="background-color: var(--color-brand, #0051BA);">
        ${escapeHTML(userText)}
      </div>
    `;
    messagesDiv.appendChild(userBubble);
    scrollToBottom(messagesDiv);

    // 2. 타이핑 인디케이터 표시
    if (typingDiv) typingDiv.classList.remove('hidden');

    // 3. AI 응답 생성 (자연스러운 딜레이 후 노출)
    setTimeout(function () {
      if (typingDiv) typingDiv.classList.add('hidden');
      const botResponse = generateBotResponse(userText);

      const botBubble = document.createElement('div');
      botBubble.className = 'flex items-start gap-2.5 max-w-[92%]';
      botBubble.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-accent text-ink flex-shrink-0 flex items-center justify-center font-bold text-xs shadow-xs" style="background-color: var(--color-accent, #FFC900);">
          Hej
        </div>
        <div class="bg-white border border-line-light rounded-2xl rounded-tl-sm p-4 shadow-sm text-sm text-ink leading-relaxed">
          ${botResponse.title ? '<p class="font-bold text-brand mb-1.5">' + botResponse.title + '</p>' : ''}
          <div class="text-ink-2 space-y-2">${botResponse.html}</div>
          ${botResponse.actionLink ? `
            <div class="mt-3 pt-2.5 border-t border-line-light">
              <a href="${botResponse.actionLink}" class="inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline">
                ${botResponse.actionText || '자세히 보기 →'}
              </a>
            </div>
          ` : ''}
        </div>
      `;
      messagesDiv.appendChild(botBubble);
      scrollToBottom(messagesDiv);
    }, 450);
  }

  // 지식 베이스 검색 및 똑똑한 응답 반환
  function generateBotResponse(query) {
    const lower = query.toLowerCase();

    // 1. 키워드 매칭
    for (let i = 0; i < KNOWLEDGE_BASE.length; i++) {
      const item = KNOWLEDGE_BASE[i];
      for (let k = 0; k < item.keywords.length; k++) {
        if (lower.indexOf(item.keywords[k]) !== -1) {
          return {
            title: item.title,
            html: item.reply,
            actionLink: item.actionLink,
            actionText: item.actionText
          };
        }
      }
    }

    // 2. 장바구니/위시리스트 동적 연동 (로컬 스토리지 데이터 확인)
    if (lower.indexOf('장바구니') !== -1 || lower.indexOf('카트') !== -1) {
      let cartItems = [];
      try {
        cartItems = JSON.parse(localStorage.getItem('ikea_cart_items') || '[]');
      } catch { /* localStorage 접근 실패 시 빈 배열 유지 */ }
      const count = cartItems.length;
      return {
        title: '🛒 장바구니 현황',
        html: '현재 장바구니에 <strong>' + count + '개</strong>의 상품이 담겨 있습니다.<br>언제든 결제 페이지로 이동해 주문을 완료하실 수 있습니다.',
        actionLink: (isCommon ? '' : 'common/') + 'cart.html',
        actionText: '장바구니 확인하기 →'
      };
    }

    // 3. 인사말 및 기본 응답
    if (lower.indexOf('안녕') !== -1 || lower.indexOf('하이') !== -1 || lower.indexOf('hej') !== -1 || lower.indexOf('hello') !== -1) {
      return {
        title: '🇸🇪 Hej! 반갑습니다!',
        html: 'IKEA AI 도우미 헤이(Hej)입니다. 인테리어 추천, 상품 안내, 배송/조립/반품 등 원하시는 정보를 말씀해 주세요!'
      };
    }

    // 4. 기본 폴백 응답
    return {
      title: '💡 IKEA AI 도우미 안내',
      html: '문의해주신 내용에 대해 다음과 같은 정보를 확인해보실 수 있습니다:<br><br>' +
        '• <strong>배송 및 조립</strong>: 정찰제 배송비 및 전문 조립 서비스<br>' +
        '• <strong>상품 추천 &amp; 세일</strong>: 현재 진행 중인 특가 행사<br>' +
        '• <strong>교환 &amp; 반품</strong>: 365일 안심 환불 규정<br>' +
        '• <strong>전화 상담</strong>: 이케아 고객지원센터 <strong>1670-4532</strong> (09:00~21:00)',
      actionLink: (isCommon ? '' : 'common/') + 'service.html',
      actionText: '이케아 서비스 센터 바로가기 →'
    };
  }

  function scrollToBottom(el) {
    if (el) {
      setTimeout(function () {
        el.scrollTop = el.scrollHeight;
      }, 50);
    }
  }

  function escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // DOM 로드 시 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectChatbot);
  } else {
    injectChatbot();
  }
})();
