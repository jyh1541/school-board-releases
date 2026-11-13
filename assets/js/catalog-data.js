// 기능 카탈로그 페이지의 데이터: 유튜브 영상 목록과 업데이트 기록
// 영상: [유튜브 id, 제목, 길이(초, 쇼츠는 0), 소개 칸 id]
window.CATALOG = {
  channel: 'https://www.youtube.com/@%EB%85%B9%EC%B0%A8%EB%9D%BC%EB%96%BC-i5l',

  videoGroups: [
    {
      title: '새 기능 소개',
      items: [
        ['XVn_eqO1kcY', '실시간 업무포털 현황 및 알림', 55, 'portal-status'],
        ['6WFEUKAFrAM', '나이스 출결 자동 일괄입력', 55, 'attendance'],
        ['PTndX5ohm_E', '생활기록부 정리와 똑똑이 소개', 109, 'student-records'],
        ['LU8Jan7oh2M', '복무 및 초과근무 상신 자동화', 71, 'duty'],
        ['8w4G-LPZG-g', '추정 분할점수 산출과 역산기', 91, 'cut-score'],
        ['9W2cXIyPfiY', '글깎이 실시간 AI 편집', 80, 'geulkkakki'],
      ],
    },
    {
      title: '1분 쇼츠',
      short: true,
      items: [
        ['tJ1BnHOgcd8', '스쿨보드 홍보 영상', 0, 'overview'],
        ['fBVCqRhlY4Y', '똑똑이 소개', 0, 'ddokddok'],
        ['tsIaJuzvhXk', '똑똑이 친구들 등장', 0, 'ddokddok'],
        ['O14hDzpgZIM', '전자칠판 전용 대시보드', 0, 'classroom-board'],
        ['znCZHgi_Tig', '오늘의 알림판', 0, 'classroom-board'],
        ['QctssZB2pjw', '초등 성취수준으로 생기부 작성', 0, 'achievements'],
        ['U4XCQURrKfw', '시험 시간표 작성과 감독 배정', 0, 'exam-schedule'],
        ['1tgI-nGXCsM', '글깎이 시험지 옮기기', 0, 'geulkkakki'],
        ['epRXIXQBGuA', '학생 이름 외우기 게임', 0, 'name-game'],
        ['auNe6Kkds6s', '스쿨보드 모바일', 0, 'mobile'],
      ],
    },
    {
      title: '처음부터 차근차근 사용법',
      items: [
        ['FHEegIWDF6Q', '01 설치 방법', 127, 'help'],
        ['W-58hdVUNBU', '02 처음 설정하기', 363, 'settings'],
        ['hbz_tYBp96I', '03 일정', 187, 'calendar'],
        ['5etlAdx9Vms', '04 시간표', 169, 'timetable'],
        ['AYglVdIJ4qw', '05 메모', 83, 'memo'],
        ['wd-XSRrBTJs', '06 급식', 58, 'meal'],
        ['5WW7QWyNk8M', '07 연락처', 128, 'contacts'],
        ['2lET0uqIXts', '08 업무자료', 89, 'resources'],
        ['rvMVEByeRTY', '09 즐겨찾기', 75, 'resources'],
        ['0TYcH3OUKHo', '10 계산기', 94, 'small-tools'],
        ['KojPG1aL8AI', '11 자동 로그인', 133, 'auto-login'],
        ['EolllxUrVM8', '12 설정', 368, 'settings'],
        ['_trlRg-ithk', '13 대시보드', 595, 'dashboard'],
        ['jVAJ9cxcClg', '14 일정·할 일과 구글 캘린더 연동', 174, 'calendar'],
        ['qye8bQxcN_4', '15 위젯 기능 소개', 170, 'dashboard'],
      ],
    },
  ],

  // 지금까지의 배포 기록 [버전, 날짜, 제목, 바뀐 항목 수] (오래된 것부터). apps/desktop/public/changelog.json 에서 뽑음
  releases: [["1.0.2","2026-03-22","정식 첫 배포",0],["1.0.6","2026-03-26","위젯 대폭 개선 및 다양한 편의 기능 추가",12],["1.0.7","2026-03-27","교사별 시간표 연동 및 대시보드 위젯 추가",6],["1.0.8","2026-03-30","다양한 편의 기능 및 대시보드 위젯 추가",16],["1.0.9","2026-03-30","버그 수정 및 안정성 개선",2],["1.1.0","2026-04-01","기능 대폭 추가 및 안정성 개선",11],["1.1.1","2026-04-05","시간표 입력 개선 및 다양한 기능 추가",16],["1.1.2","2026-04-07","할 일 및 일정 기능 개선, 다양한 버그 수정",11],["1.1.3","2026-04-09","다양한 버그 수정",4],["1.1.4","2026-04-09","버그 수정 및 날씨 지역 추가",3],["1.1.6","2026-05-05","Google 동기화, 반응형 디자인, 다양한 기능 추가",27],["1.1.7","2026-05-11","스쿨보드 모바일 출시 및 학급관리 기능 확장",13],["1.1.8","2026-05-19","온라인등록부와 학급활동수집 기능 추가",7],["1.1.9","2026-05-25","생활기록부 작성 기능과 수업 알림 개선",7],["1.1.10","2026-05-27","메모 페이지 루틴 기능 신설",4],["1.1.11","2026-06-01","PIN 잠금과 OCR스캔 기능 추가",9],["1.1.12","2026-06-02","QR 출결과 학급관리/대시보드 개선",21],["1.1.13","2026-06-15","QR 출결 정식 출시와 시간표 개선",3],["1.1.14","2026-06-21","온라인 수집 동시 게시와 메모·급식 개선",12],["1.1.15","2026-06-25","할일 캘린더 연동과 사이트 주소 변경",3],["1.2.0","2026-07-05","노트북과 시간표·모바일 게시 기능 추가",7],["1.2.1","2026-07-27","글깎이·온라인 교무실과 시간표 연동 기능 추가",16],["1.2.2","2026-08-10","생활기록부 분석·상담 신청과 PDF 편집 기능 추가",8],["1.2.3","2026-08-18","학급관리 일괄 작업과 노트북·상담 기능 개선",18],["1.2.4","2026-08-31","수업 도구와 투표·설문 기능 확장",5],["1.2.5","2026-10-06","시험시간표·HTML 편집기 추가와 기기 간 동기화 개선",30],["1.2.6","2026-10-26","공식 마스코트 똑똑이 등장과 대시보드 창 추가",32],["1.2.7","2026-11-11","나이스 출결 일괄 입력과 똑똑이 친구들 등장",10]],

  // 최신 업데이트: 앱 업데이트 안내창과 같은 Supabase changelogs 테이블에서 읽는다. 실패하면 아래 기록을 보여 준다.
  changelogSource: {
    url: 'https://fzkkgpexlwhjuyklntmc.supabase.co/rest/v1/changelogs?select=version,title,date,changes&active=eq.true&order=date.desc&limit=4',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6a2tncGV4bHdoanV5a2xudG1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MzY4MzYsImV4cCI6MjA4OTExMjgzNn0.2nZ0zB5bxR3pbA6EBylReNSbxGzV4WZ8eLTBDA0swR0',
  },
  changelogFallback: [{"version":"1.2.7","date":"2026-11-11","title":"나이스 출결 일괄 입력과 똑똑이 친구들 등장","changes":[{"type":"feature","label":"중요 업데이트","items":[{"title":"스쿨보드 출결을 나이스에 한 번에 입력"},{"title":"업무포털 현황 위젯 알림 강화"},{"title":"원클릭 품의 자동화"},{"title":"똑똑이의 친구들 등장"}]},{"type":"feature","label":"새로운 기능","items":[{"title":"학기말 성취도 예측"},{"title":"생활기록부 AI 수정"},{"title":"모바일 위젯 순서·메뉴 변경"}]},{"type":"improvement","label":"기능 개선","items":[{"title":"앱 30% 다이어트"},{"title":"여러 그룹 동시 회피 배정"},{"title":"똑똑이 동작 다듬기"}]}]},{"version":"1.2.6","date":"2026-10-26","title":"공식 마스코트 똑똑이 등장과 대시보드 창 추가","changes":[{"type":"feature","label":"중요 업데이트","items":[{"title":"스쿨보드 공식 마스코트 똑똑이 등장"},{"title":"대시보드 화면 두 개 동시에 띄우기"},{"title":"업무포털 현황 위젯"}]},{"type":"feature","label":"똑똑이와 함께하기","items":[{"title":"오늘 브리핑"},{"title":"알림이 오면 노크"},{"title":"두 번 클릭해서 물어보기"},{"title":"똑똑이에게 심부름 시키기"},{"title":"하루 마무리 안내"},{"title":"할 일을 마치면 칭찬"},{"title":"산책하고 반응하는 똑똑이"},{"title":"메뉴 칠판과 화면 안내"},{"title":"바탕화면 펫"},{"title":"수업 중 숨기기와 크기 조절"},{"title":"똑똑이와 게임하기"}]},{"type":"feature","label":"새로운 기능","items":[{"title":"메모·일정 설명에 링크 추가"},{"title":"출결 종합에 사유별 구분 표시"},{"title":"상담 신청 결과 출력"},{"title":"학생 명단 불러오기·내보내기"},{"title":"시험시간표 학생 일괄 등록"},{"title":"학생 생일을 캘린더에 표시"},{"title":"오늘의 한 문장 위젯"},{"title":"오늘의 알림판 위젯"},{"title":"타이머에 현재 수업 남은 시간"},{"title":"자리배정 출력 시 명렬표 함께 출력"},{"title":"대시보드 바로가기 단축키"}]},{"type":"improvement","label":"기능 개선","items":[{"title":"메모 목록에서 바로 삭제"},{"title":"할 일 순서를 드래그로 변경"},{"title":"자리배치 수동 배정 개선"},{"title":"여러 날짜 근무 한 번에 상신"},{"title":"생활기록부 정리에서 미작성 학생만 선택"}]},{"type":"fix","label":"오류 수정","items":[{"title":"보안 프로그램 준비 후 자동 로그인"},{"title":"생기부 분석 띄어쓰기 인식 개선"}]}]},{"version":"1.2.5","date":"2026-10-06","title":"시험시간표·HTML 편집기 추가와 기기 간 동기화 개선","changes":[{"type":"feature","label":"중요 업데이트","items":[{"title":"이미지 편집기 추가"},{"title":"초등 성취수준 기록 추가"},{"title":"HTML 편집기 추가"},{"title":"시험시간표 작성 추가"},{"title":"기기 간 동기화 충돌 알림 줄이기"}]},{"type":"feature","label":"새로운 기능","items":[{"title":"자리배치표 명렬표·사진 표시"},{"title":"자리 배치 저장"},{"title":"남녀 자리 조건 추가"},{"title":"상벌점 나이스 입력 확인"},{"title":"생활기록부 활동내용 일괄 입력"},{"title":"생기부 상담 학생 검색"},{"title":"상담 중복 선택 설정"},{"title":"완료된 상담 직접 관리"},{"title":"상담 일정 캘린더 표시"},{"title":"시계·날씨 위젯 분리"},{"title":"뽑기 특정 학생 제외"},{"title":"투표 및 설문 조건부 질문"},{"title":"자동로그인 복무상신"},{"title":"휴대폰 상담 탭"}]},{"type":"improvement","label":"기능 개선","items":[{"title":"앱 시작 시 자동 동기화"},{"title":"누가기록 바로 열기"},{"title":"학생 사진 확대"},{"title":"메모 정렬 위치 유지"},{"title":"메모 수정 시 글자 크기 유지"},{"title":"룰렛·랜덤 뽑기 디자인 개선"},{"title":"진도표 위젯 컴팩트 표시"},{"title":"노트북 내보내기 창 닫기"}]},{"type":"fix","label":"버그 수정","items":[{"title":"휴대폰 고정석 마스킹 수정"},{"title":"상담 제목 삭제 오류 수정"},{"title":"화면 배치 반복 전환 수정"}]}]},{"version":"1.2.4","date":"2026-08-31","title":"수업 도구와 투표·설문 기능 확장","changes":[{"type":"feature","label":"새로운 기능","items":[{"title":"수업 타이머 추가"},{"title":"한글 문서를 이미지로 변환"},{"title":"투표 및 설문 추가"}]},{"type":"improvement","label":"기능 개선","items":[{"title":"중학교 생활기록부 분석 지원"},{"title":"대시보드 시계 디자인 확대"}]}]}],
}
