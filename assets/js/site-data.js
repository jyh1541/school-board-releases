// 사이트 내용 데이터. 화면 이미지는 assets/shots/ (앱 시연 데이터로 직접 찍은 최신 화면)
// 표시(mark) 좌표는 화면 크기 대비 % [x, y, w, h], 메모(note)는 [가운데 x %, 위 y %]
window.SITE = {
  slots: [
    {
      time: '08:10', title: '출근하면 오늘이<br>펼쳐져 있어요',
      body: '일정과 할 일이 구글 캘린더와 맞춰져 있어요. 업무포털과 나이스는 버튼 한 번으로 로그인하고, 교무실 공지도 여기서 받아요.',
      uses: '일정, 할 일, D-Day, 업무포털 자동 로그인, 온라인 교무실',
      shot: { name: 'calendar', alt: '스쿨보드 일정 화면', mark: { shape: 'ellipse', rect: [37.2, 34.4, 7.8, 18.6], note: '오늘 일정이 한눈에', at: [41.1, 27.6] } },
    },
    {
      time: '08:40', title: '조회 시간,<br>출결은 클릭 몇 번',
      body: '지각·조퇴·결과를 교시별로 체크하고 사유를 남겨요. 학생이 QR 코드를 찍어 직접 출석하게 할 수도 있어요.',
      uses: '출결 관리, QR 출결, 누가기록, 상벌점',
      shot: { name: 'attendance', alt: '스쿨보드 학급관리 출결 화면', mark: { shape: 'pill', rect: [27.4, 41.2, 20.8, 5.4], note: '교시별로 클릭 한 번', at: [37.8, 34.2] } },
    },
    {
      time: '09:00', title: '1교시, 시간표는<br>알아서 바뀌어요',
      body: '나이스·컴시간·압핀 시간표를 그대로 불러오고, 바뀐 시간표는 알려 줘요. 교실 화면에는 수업 타이머와 랜덤 뽑기를 띄우면 돼요.',
      uses: '시간표, 수업 알림, 수업 타이머, 랜덤 뽑기',
      shot: { name: 'timetable', alt: '스쿨보드 시간표 화면', mark: { shape: 'pill', rect: [14.5, 24.3, 61.9, 6.0], note: '나이스·컴시간·압핀 연동', at: [45.4, 31.6] } },
    },
    {
      time: '12:30', title: '점심, 오늘 메뉴와<br>오후 할 일을 한 번에',
      body: '학교 급식과 영양 정보를 바로 보고, 떠오른 일은 포스트잇 메모나 매일 반복하는 루틴으로 남겨요.',
      uses: '급식, 메모, 루틴, 연락처',
      shot: { name: 'meal', alt: '스쿨보드 급식 화면', mark: { shape: 'rect', rect: [54.2, 50.6, 12.7, 16.4], note: '오늘 점심', at: [60.5, 41.2] } },
    },
    {
      time: '14:00', title: '학급 시간,<br>자리 바꾸기도 공정하게',
      body: '조건을 넣으면 자리를 자동으로 배정하고 전체화면으로 발표해요. 활동 결과물은 QR로 모으고, 투표도 바로 열 수 있어요.',
      uses: '자리배정, 학급활동모음, 투표·설문, 상담 신청',
      shot: { name: 'seating', alt: '스쿨보드 자리배정 화면', mark: { shape: 'pill', rect: [12.6, 19.6, 8.6, 5.4], note: '버튼 한 번에 자동 배정', at: [17, 26.6] } },
    },
    {
      time: '16:30', title: '방과후, 미뤄 둔<br>서류 작업을 끝내요',
      body: '시험시간표와 감독 배정, 생기부 정리와 분석, 한글 문서 자동 편집(글깎이), PDF 정리까지 한 앱에서 처리해요.',
      uses: '시험시간표, 생활기록부 정리·분석, 글깎이, PDF 편집기',
      shot: { name: 'exam-schedule', alt: '스쿨보드 시험시간표 감독 배정 화면', mark: { shape: 'rect', rect: [35.8, 44.4, 13.6, 22.6], note: '감독도 자동으로 배정', at: [42.6, 37.4] } },
    },
    {
      time: '21:00', title: '퇴근 후엔<br>폰에서 이어서',
      body: '집에서 휴대폰으로 내일 시간표와 급식을 확인하고, 학급 기록도 남겨요. PC와 자동으로 맞춰져요.',
      uses: '모바일 웹, 기기 간 자동 동기화',
      shot: { phone: 'home', alt: '스쿨보드 모바일 홈 화면' },
    },
  ],

  tools: [
    { id: 'geulkkakki', name: '글깎이', badge: 'BETA', desc: '열려 있는 한글(HWP) 문서를 대화로 고치고, 양식 채우기와 시험지 옮기기까지 AI가 도와요.', shot: 'geulkkakki' },
    { id: 'pdf-editor', name: 'PDF 편집기', desc: '나누기·합치기·추출·회전·압축과 이미지·한글 문서 변환을 한곳에서 처리해요.', shot: 'pdf-editor' },
    { id: 'html-editor', name: 'HTML 편집기', badge: 'BETA', desc: 'AI로 만든 HTML 문서를 파워포인트처럼 고치고 PDF·이미지로 내보내요. 가정통신문·상장·수업 슬라이드 예시가 들어 있어요.', shot: 'html-editor' },
    { id: 'class-timer', name: '수업 타이머', desc: '안내 문구와 큰 타이머를 교실 화면에 띄우고, 소리 알림으로 활동 시간을 챙겨요.', shot: 'class-timer' },
    { id: 'random-pick', name: '랜덤 뽑기·모둠 편성', desc: '학급 명단에서 발표자를 뽑고, 모둠을 자동으로 나눠요.', shot: 'random-pick' },
    { id: 'vote', name: '투표 및 설문', desc: '객관식·주관식 질문을 QR로 게시하고 결과를 실시간으로 봐요. 중복 참여는 자동으로 막아요.', shot: 'vote' },
  ],
  toolsMore: ['시험시간표', '학생이름외우기', '온라인등록부', '이미지 편집기', 'QR 생성기', '수강신청확인서 출력', '시험문제 배점산출기', '등급별 인원 예측', '추정 분할점수 산출기', '수행평가 점수 점검', '계산기'],

  phones: [
    { name: 'attendance', alt: '모바일 출결 화면' },
    { name: 'home', alt: '모바일 홈 화면' },
    { name: 'seating', alt: '모바일 자리배치 화면' },
  ],

  videos: [
    ['FHEegIWDF6Q', '설치 방법'], ['W-58hdVUNBU', '처음 설정하기'], ['_trlRg-ithk', '대시보드'], ['hbz_tYBp96I', '일정'],
    ['5etlAdx9Vms', '시간표'], ['AYglVdIJ4qw', '메모'], ['wd-XSRrBTJs', '급식'], ['5WW7QWyNk8M', '연락처'],
    ['2lET0uqIXts', '업무자료'], ['rvMVEByeRTY', '즐겨찾기'], ['0TYcH3OUKHo', '계산기'], ['KojPG1aL8AI', '자동 로그인'], ['EolllxUrVM8', '설정'],
  ],

  // 최신 업데이트: 앱 업데이트 안내창과 같은 Supabase changelogs 테이블에서 읽는다. 실패하면 아래 기록을 보여 준다.
  changelogSource: {
    url: 'https://fzkkgpexlwhjuyklntmc.supabase.co/rest/v1/changelogs?select=version,title,date,changes&active=eq.true&order=date.desc&limit=4',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6a2tncGV4bHdoanV5a2xudG1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MzY4MzYsImV4cCI6MjA4OTExMjgzNn0.2nZ0zB5bxR3pbA6EBylReNSbxGzV4WZ8eLTBDA0swR0',
  },
  changelogFallback: [{"version":"1.2.5","date":"2026-10-06","title":"시험시간표·HTML 편집기 추가와 기기 간 동기화 개선","changes":[{"type":"feature","label":"중요 업데이트","items":[{"title":"이미지 편집기 추가"},{"title":"초등 성취수준 기록 추가"},{"title":"HTML 편집기 추가"},{"title":"시험시간표 작성 추가"},{"title":"기기 간 동기화 충돌 알림 줄이기"}]},{"type":"feature","label":"새로운 기능","items":[{"title":"자리배치표 명렬표·사진 표시"},{"title":"자리 배치 저장"},{"title":"남녀 자리 조건 추가"},{"title":"상벌점 나이스 입력 확인"},{"title":"생활기록부 활동내용 일괄 입력"},{"title":"생기부 상담 학생 검색"},{"title":"상담 중복 선택 설정"},{"title":"완료된 상담 직접 관리"},{"title":"상담 일정 캘린더 표시"},{"title":"시계·날씨 위젯 분리"},{"title":"뽑기 특정 학생 제외"},{"title":"투표 및 설문 조건부 질문"},{"title":"자동로그인 복무상신"},{"title":"휴대폰 상담 탭"}]},{"type":"improvement","label":"기능 개선","items":[{"title":"앱 시작 시 자동 동기화"},{"title":"누가기록 바로 열기"},{"title":"학생 사진 확대"},{"title":"메모 정렬 위치 유지"},{"title":"메모 수정 시 글자 크기 유지"},{"title":"룰렛·랜덤 뽑기 디자인 개선"},{"title":"진도표 위젯 컴팩트 표시"},{"title":"노트북 내보내기 창 닫기"}]},{"type":"fix","label":"버그 수정","items":[{"title":"휴대폰 고정석 마스킹 수정"},{"title":"상담 제목 삭제 오류 수정"},{"title":"화면 배치 반복 전환 수정"}]}]},{"version":"1.2.4","date":"2026-08-31","title":"수업 도구와 투표·설문 기능 확장","changes":[{"type":"feature","label":"새로운 기능","items":[{"title":"수업 타이머 추가"},{"title":"한글 문서를 이미지로 변환"},{"title":"투표 및 설문 추가"}]},{"type":"improvement","label":"기능 개선","items":[{"title":"중학교 생활기록부 분석 지원"},{"title":"대시보드 시계 디자인 확대"}]}]},{"version":"1.2.3","date":"2026-08-18","title":"학급관리 일괄 작업과 노트북·상담 기능 개선","changes":[{"type":"feature","label":"중요 업데이트","items":[{"title":"학급활동모음 일괄 업로드와 통계 추가"},{"title":"진도표 Excel 작업 개선"},{"title":"학급 및 교과 그룹 추가"},{"title":"자리배정 전체화면과 배정 제외 추가"},{"title":"상담 신청 설정 확장"},{"title":"개인 시간표 수기 보완 추가"},{"title":"온라인 교무실 일괄 입력 추가"},{"title":"이미지를 PDF로 변환"},{"title":"학생이름외우기 서술형 퀴즈 추가"},{"title":"배점만 복사 추가"},{"title":"D-Day 목록에서 바로 추가"}]},{"type":"improvement","label":"기능 개선","items":[{"title":"출결 세부사항 표시 확대"},{"title":"출결 입력과 색상 구분 개선"},{"title":"명단 없는 등록부 연번 보호"},{"title":"메모 상단 도구 고정"}]},{"type":"fix","label":"버그 수정","items":[{"title":"노트북 편집 안정화"},{"title":"위젯 OCR 창 이동 오류 수정"},{"title":"상담 신청 동기화 보강"}]}]},{"version":"1.2.2","date":"2026-08-10","title":"생활기록부 분석·상담 신청과 PDF 편집 기능 추가","changes":[{"type":"feature","label":"중요 업데이트","items":[{"title":"생활기록부 분석 및 진로진학 상담 추가"},{"title":"QR 상담 신청 추가"},{"title":"메모 폴더 추가"},{"title":"PDF 편집기 추가"}]},{"type":"improvement","label":"기능 개선","items":[{"title":"누가기록 학생 사진 표시"},{"title":"학생 선호도 설정 위치 개선"}]},{"type":"fix","label":"버그 수정","items":[{"title":"자리배정 마스크 모드 교환 오류 수정"}]},{"type":"ux","label":"안내/UX","items":[{"title":"토스트 알림 닫기 개선"}]}]}],
}
