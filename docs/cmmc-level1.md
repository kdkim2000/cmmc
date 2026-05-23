const LEVEL1_ITEMS = [
  // 1. 접근 통제 (AC) - 19개 항목
  { level: '1', domainCode: 'AC', domainName: '접근 통제', requirementId: 'AC.L1-b.1.i', requirement: '시스템 접근을 인가된 사용자, 프로세스, 기기로 제한한다.', objective: 'a. 인가된 사용자가 식별되는지 확인한다.', weight: null, sortOrder: 1 },
  { level: '1', domainCode: 'AC', domainName: '접근 통제', requirementId: 'AC.L1-b.1.i', requirement: '시스템 접근을 인가된 사용자, 프로세스, 기기로 제한한다.', objective: 'b. 사용자를 대신해 작동하는 프로세스가 식별되는지 확인한다.', weight: null, sortOrder: 2 },
  { level: '1', domainCode: 'AC', domainName: '접근 통제', requirementId: 'AC.L1-b.1.i', requirement: '시스템 접근을 인가된 사용자, 프로세스, 기기로 제한한다.', objective: 'c. 시스템에 연결하는 기기가 식별되는지 확인한다.', weight: null, sortOrder: 3 },
  { level: '1', domainCode: 'AC', domainName: '접근 통제', requirementId: 'AC.L1-b.1.i', requirement: '시스템 접근을 인가된 사용자, 프로세스, 기기로 제한한다.', objective: 'd. 시스템 접근이 인가된 사용자에게만 허용되는지 확인한다.', weight: null, sortOrder: 4 },
  { level: '1', domainCode: 'AC', domainName: '접근 통제', requirementId: 'AC.L1-b.1.i', requirement: '시스템 접근을 인가된 사용자, 프로세스, 기기로 제한한다.', objective: 'e. 시스템 접근이 인가된 프로세스로 제한되는지 확인한다.', weight: null, sortOrder: 5 },
  { level: '1', domainCode: 'AC', domainName: '접근 통제', requirementId: 'AC.L1-b.1.i', requirement: '시스템 접근을 인가된 사용자, 프로세스, 기기로 제한한다.', objective: 'f. 시스템 접근이 인가된 기기로 제한되는지 확인한다.', weight: null, sortOrder: 6 },
  { level: '1', domainCode: 'AC', domainName: '접근 통제', requirementId: 'AC.L1-b.1.ii', requirement: '인가된 사용자가 실행할 수 있는 트랜잭션 및 기능 유형을 제한한다.', objective: 'a. 인가된 사용자의 기능/트랜잭션 유형이 정의되어 있는지 확인한다.', weight: null, sortOrder: 7 },
  { level: '1', domainCode: 'AC', domainName: '접근 통제', requirementId: 'AC.L1-b.1.ii', requirement: '인가된 사용자가 실행할 수 있는 트랜잭션 및 기능 유형을 제한한다.', objective: 'b. 시스템 접근이 정의된 기능 유형으로 제한되는지 확인한다.', weight: null, sortOrder: 8 },
  { level: '1', domainCode: 'AC', domainName: '접근 통제', requirementId: 'AC.L1-b.1.iii', requirement: '외부 정보 시스템 연결을 검증하고 제한한다.', objective: 'a. 외부 시스템 연결이 식별되는지 확인한다.', weight: null, sortOrder: 9 },
  { level: '1', domainCode: 'AC', domainName: '접근 통제', requirementId: 'AC.L1-b.1.iii', requirement: '외부 정보 시스템 연결을 검증하고 제한한다.', objective: 'b. 외부 시스템의 사용이 식별되는지 확인한다.', weight: null, sortOrder: 10 },
  { level: '1', domainCode: 'AC', domainName: '접근 통제', requirementId: 'AC.L1-b.1.iii', requirement: '외부 정보 시스템 연결을 검증하고 제한한다.', objective: 'c. 외부 시스템 연결이 검증되는지 확인한다.', weight: null, sortOrder: 11 },
  { level: '1', domainCode: 'AC', domainName: '접근 통제', requirementId: 'AC.L1-b.1.iii', requirement: '외부 정보 시스템 연결을 검증하고 제한한다.', objective: 'd. 외부 시스템의 사용이 검증되는지 확인한다.', weight: null, sortOrder: 12 },
  { level: '1', domainCode: 'AC', domainName: '접근 통제', requirementId: 'AC.L1-b.1.iii', requirement: '외부 정보 시스템 연결을 검증하고 제한한다.', objective: 'e. 외부 시스템 연결이 제한되는지 확인한다.', weight: null, sortOrder: 13 },
  { level: '1', domainCode: 'AC', domainName: '접근 통제', requirementId: 'AC.L1-b.1.iii', requirement: '외부 정보 시스템 연결을 검증하고 제한한다.', objective: 'f. 외부 시스템 사용이 제한되는지 확인한다.', weight: null, sortOrder: 14 },
  { level: '1', domainCode: 'AC', domainName: '접근 통제', requirementId: 'AC.L1-b.1.iv', requirement: '공개적으로 접근 가능한 시스템에 게시되는 정보를 통제한다.', objective: 'a. 공개 시스템 정보 게시 인가자가 식별되는지 확인한다.', weight: null, sortOrder: 15 },
  { level: '1', domainCode: 'AC', domainName: '접근 통제', requirementId: 'AC.L1-b.1.iv', requirement: '공개적으로 접근 가능한 시스템에 게시되는 정보를 통제한다.', objective: 'b. 공개 시스템에 FCI가 게시되지 않도록 절차가 있는지 확인한다.', weight: null, sortOrder: 16 },
  { level: '1', domainCode: 'AC', domainName: '접근 통제', requirementId: 'AC.L1-b.1.iv', requirement: '공개적으로 접근 가능한 시스템에 게시되는 정보를 통제한다.', objective: 'c. 정보 게시 전 검토 절차가 마련되어 있는지 확인한다.', weight: null, sortOrder: 17 },
  { level: '1', domainCode: 'AC', domainName: '접근 통제', requirementId: 'AC.L1-b.1.iv', requirement: '공개적으로 접근 가능한 시스템에 게시되는 정보를 통제한다.', objective: 'd. FCI가 포함되지 않도록 검토되는지 확인한다.', weight: null, sortOrder: 18 },
  { level: '1', domainCode: 'AC', domainName: '접근 통제', requirementId: 'AC.L1-b.1.iv', requirement: '공개적으로 접근 가능한 시스템에 게시되는 정보를 통제한다.', objective: 'e. FCI 발견 시 삭제 조치 메커니즘이 있는지 확인한다.', weight: null, sortOrder: 19 },

  // 2. 식별 및 인증 (IA) - 6개 항목
  { level: '1', domainCode: 'IA', domainName: '식별 및 인증', requirementId: 'IA.L1-b.1.v', requirement: '시스템 사용자, 프로세스, 기기를 식별한다.', objective: 'a. 시스템 사용자가 고유하게 식별되는지 확인한다.', weight: null, sortOrder: 20 },
  { level: '1', domainCode: 'IA', domainName: '식별 및 인증', requirementId: 'IA.L1-b.1.v', requirement: '시스템 사용자, 프로세스, 기기를 식별한다.', objective: 'b. 사용자 대신 작동하는 프로세스가 식별되는지 확인한다.', weight: null, sortOrder: 21 },
  { level: '1', domainCode: 'IA', domainName: '식별 및 인증', requirementId: 'IA.L1-b.1.v', requirement: '시스템 사용자, 프로세스, 기기를 식별한다.', objective: 'c. 시스템에 접근하는 기기가 식별되는지 확인한다.', weight: null, sortOrder: 22 },
  { level: '1', domainCode: 'IA', domainName: '식별 및 인증', requirementId: 'IA.L1-b.1.vi', requirement: '접근 전 신원을 인증한다.', objective: 'a. 사용자 신원 인증이 수행되는지 확인한다.', weight: null, sortOrder: 23 },
  { level: '1', domainCode: 'IA', domainName: '식별 및 인증', requirementId: 'IA.L1-b.1.vi', requirement: '접근 전 신원을 인증한다.', objective: 'b. 프로세스 신원 인증이 수행되는지 확인한다.', weight: null, sortOrder: 24 },
  { level: '1', domainCode: 'IA', domainName: '식별 및 인증', requirementId: 'IA.L1-b.1.vi', requirement: '접근 전 신원을 인증한다.', objective: 'c. 기기 신원 인증이 수행되는지 확인한다.', weight: null, sortOrder: 25 },

  // 3. 매체 보호 (MP) - 2개 항목
  { level: '1', domainCode: 'MP', domainName: '매체 보호', requirementId: 'MP.L1-b.1.vii', requirement: '폐기 또는 재사용 전 FCI 매체를 파기한다.', objective: 'a. FCI 포함 매체 폐기 전 완전 삭제 또는 파기되는지 확인한다.', weight: null, sortOrder: 26 },
  { level: '1', domainCode: 'MP', domainName: '매체 보호', requirementId: 'MP.L1-b.1.vii', requirement: '폐기 또는 재사용 전 FCI 매체를 파기한다.', objective: 'b. 재사용 전 매체 데이터가 완전 삭제되는지 확인한다.', weight: null, sortOrder: 27 },

  // 4. 물리적 보호 (PE) - 7개 항목
  { level: '1', domainCode: 'PE', domainName: '물리적 보호', requirementId: 'PE.L1-b.1.viii', requirement: '물리적 접근을 인가된 개인으로 제한한다.', objective: 'a. 물리적 접근 인가자가 식별되는지 확인한다.', weight: null, sortOrder: 28 },
  { level: '1', domainCode: 'PE', domainName: '물리적 보호', requirementId: 'PE.L1-b.1.viii', requirement: '물리적 접근을 인가된 개인으로 제한한다.', objective: 'b. 시스템 물리적 접근이 인가자로 제한되는지 확인한다.', weight: null, sortOrder: 29 },
  { level: '1', domainCode: 'PE', domainName: '물리적 보호', requirementId: 'PE.L1-b.1.ix', requirement: '방문자 에스코트 및 활동 모니터링', objective: 'a. 방문자 에스코트가 수행되는지 확인한다.', weight: null, sortOrder: 30 },
  { level: '1', domainCode: 'PE', domainName: '물리적 보호', requirementId: 'PE.L1-b.1.ix', requirement: '방문자 에스코트 및 활동 모니터링', objective: 'b. 방문자 활동이 모니터링되는지 확인한다.', weight: null, sortOrder: 31 },
  { level: '1', domainCode: 'PE', domainName: '물리적 보호', requirementId: 'PE.L1-b.1.ix', requirement: '물리적 접근 감사 로그 유지', objective: 'a. 물리적 접근 감사 로그가 기록/보관되는지 확인한다.', weight: null, sortOrder: 32 },
  { level: '1', domainCode: 'PE', domainName: '물리적 보호', requirementId: 'PE.L1-b.1.ix', requirement: '물리적 접근 장치 제어 및 관리', objective: 'a. 물리적 접근 장치(열쇠/카드)가 통제되는지 확인한다.', weight: null, sortOrder: 33 },
  { level: '1', domainCode: 'PE', domainName: '물리적 보호', requirementId: 'PE.L1-b.1.ix', requirement: '물리적 접근 장치 제어 및 관리', objective: 'b. 물리적 접근 장치가 적절히 관리되는지 확인한다.', weight: null, sortOrder: 34 },

  // 5. 시스템 및 통신 보호 (SC) - 10개 항목
  { level: '1', domainCode: 'SC', domainName: '시스템 및 통신 보호', requirementId: 'SC.L1-b.1.x', requirement: '통신 모니터링, 제어, 보호', objective: 'a. 외부 시스템 경계가 정의되어 있는지 확인한다.', weight: null, sortOrder: 35 },
  { level: '1', domainCode: 'SC', domainName: '시스템 및 통신 보호', requirementId: 'SC.L1-b.1.x', requirement: '통신 모니터링, 제어, 보호', objective: 'b. 주요 내부 경계가 정의되어 있는지 확인한다.', weight: null, sortOrder: 36 },
  { level: '1', domainCode: 'SC', domainName: '시스템 및 통신 보호', requirementId: 'SC.L1-b.1.x', requirement: '통신 모니터링, 제어, 보호', objective: 'c. 외부 경계에서 통신이 모니터링되는지 확인한다.', weight: null, sortOrder: 37 },
  { level: '1', domainCode: 'SC', domainName: '시스템 및 통신 보호', requirementId: 'SC.L1-b.1.x', requirement: '통신 모니터링, 제어, 보호', objective: 'd. 내부 경계에서 통신이 모니터링되는지 확인한다.', weight: null, sortOrder: 38 },
  { level: '1', domainCode: 'SC', domainName: '시스템 및 통신 보호', requirementId: 'SC.L1-b.1.x', requirement: '통신 모니터링, 제어, 보호', objective: 'e. 외부 경계에서 통신이 제어되는지 확인한다.', weight: null, sortOrder: 39 },
  { level: '1', domainCode: 'SC', domainName: '시스템 및 통신 보호', requirementId: 'SC.L1-b.1.x', requirement: '통신 모니터링, 제어, 보호', objective: 'f. 내부 경계에서 통신이 제어되는지 확인한다.', weight: null, sortOrder: 40 },
  { level: '1', domainCode: 'SC', domainName: '시스템 및 통신 보호', requirementId: 'SC.L1-b.1.x', requirement: '통신 모니터링, 제어, 보호', objective: 'g. 외부 경계에서 통신이 보호되는지 확인한다.', weight: null, sortOrder: 41 },
  { level: '1', domainCode: 'SC', domainName: '시스템 및 통신 보호', requirementId: 'SC.L1-b.1.x', requirement: '통신 모니터링, 제어, 보호', objective: 'h. 내부 경계에서 통신이 보호되는지 확인한다.', weight: null, sortOrder: 42 },
  { level: '1', domainCode: 'SC', domainName: '시스템 및 통신 보호', requirementId: 'SC.L1-b.1.xi', requirement: '공개 시스템 분리', objective: 'a. 공개 시스템(웹서버 등)이 식별되는지 확인한다.', weight: null, sortOrder: 43 },
  { level: '1', domainCode: 'SC', domainName: '시스템 및 통신 보호', requirementId: 'SC.L1-b.1.xi', requirement: '공개 시스템 분리', objective: 'b. 공개 시스템이 내부망과 분리되어 있는지 확인한다.', weight: null, sortOrder: 44 },

  // 6. 시스템 및 정보 무결성 (SI) - 8개 항목
  { level: '1', domainCode: 'SI', domainName: '시스템 및 정보 무결성', requirementId: 'SI.L1-b.1.xii', requirement: '시스템 결함 식별 및 수정', objective: 'a. 시스템 결함(취약점)이 식별되는지 확인한다.', weight: null, sortOrder: 45 },
  { level: '1', domainCode: 'SI', domainName: '시스템 및 정보 무결성', requirementId: 'SI.L1-b.1.xii', requirement: '시스템 결함 식별 및 수정', objective: 'b. 시스템 결함이 보고되는지 확인한다.', weight: null, sortOrder: 46 },
  { level: '1', domainCode: 'SI', domainName: '시스템 및 정보 무결성', requirementId: 'SI.L1-b.1.xii', requirement: '시스템 결함 식별 및 수정', objective: 'c. 시스템 결함이 적시에 수정되는지 확인한다.', weight: null, sortOrder: 47 },
  { level: '1', domainCode: 'SI', domainName: '시스템 및 정보 무결성', requirementId: 'SI.L1-b.1.xiii', requirement: '악성코드 보호 기능 제공', objective: 'a. 보호 제공 위치가 식별되는지 확인한다.', weight: null, sortOrder: 48 },
  { level: '1', domainCode: 'SI', domainName: '시스템 및 정보 무결성', requirementId: 'SI.L1-b.1.xiii', requirement: '악성코드 보호 기능 제공', objective: 'b. 보호 기능이 제공되는지 확인한다.', weight: null, sortOrder: 49 },
  { level: '1', domainCode: 'SI', domainName: '시스템 및 정보 무결성', requirementId: 'SI.L1-b.1.xiv', requirement: '보호 메커니즘 업데이트', objective: 'a. 악성코드 보호 메커니즘이 업데이트되는지 확인한다.', weight: null, sortOrder: 50 },
  { level: '1', domainCode: 'SI', domainName: '시스템 및 정보 무결성', requirementId: 'SI.L1-b.1.xv', requirement: '파일 스캔 수행', objective: 'a. 주기적 스캔이 수행되는지 확인한다.', weight: null, sortOrder: 51 },
  { level: '1', domainCode: 'SI', domainName: '시스템 및 정보 무결성', requirementId: 'SI.L1-b.1.xv', requirement: '파일 스캔 수행', objective: 'b. 파일 실행 시 실시간 스캔이 수행되는지 확인한다.', weight: null, sortOrder: 52 },
];