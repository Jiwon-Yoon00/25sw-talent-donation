import { useState, useEffect, useRef } from "react";
import "./LongTypingPractice.css";
import SideBar from "../../components/SideBar/SideBar";
import PracticeMenu from "../../components/PracticeMenu/PracticeMenu";
import FileSelectModal from "../../components/FileSelectModal/FileSelectModal";
import TypingLine from "../../components/TypingLine";
import FinishModal from "../../components/FileSelectModal/FinishModal";
import axios from "axios";

// ============================================================================
// 상수 정의
// ============================================================================

const CHO = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
const JUNG = ["ㅏ","ㅐ","ㅑ","ㅒ","ㅓ","ㅔ","ㅕ","ㅖ","ㅗ","ㅘ","ㅙ","ㅚ","ㅛ","ㅜ","ㅝ","ㅞ","ㅟ","ㅠ","ㅡ","ㅢ","ㅣ"];
const JONG = ["", "ㄱ","ㄲ","ㄳ","ㄴ","ㄵ","ㄶ","ㄷ","ㄹ","ㄺ","ㄻ","ㄼ","ㄽ","ㄾ","ㄿ","ㅀ","ㅁ","ㅂ","ㅄ","ㅅ","ㅆ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];

/** 페이지당 표시할 줄 수 */
const LINES_PER_PAGE = 10;

/** WPM 계산을 위한 최소 경과 시간 (밀리초) */
const MIN_ELAPSED_MS = 500;

/** WPM 계산을 위한 최소 입력 글자 수 */
const MIN_TYPED = 8;

/** 합리적인 최대 WPM 값 (이상치 방지) */
const MAX_REASONABLE_WPM = 2000;

const LongTypingPractice = () => {
  // ============================================================================
  // 상태 관리
  // ============================================================================

  /** 연습할 텍스트 줄 배열 */
  const [lines, setLines] = useState([]);
  
  /** 현재 입력 중인 줄 인덱스 */
  const [currentLine, setCurrentLine] = useState(0);

  /** 현재 줄의 사용자 입력 */
  const [userInput, setUserInput] = useState("");
  
  /** 각 줄의 완료된 입력 저장 */
  const [userInputs, setUserInputs] = useState([]);

  /** 한글 입력 조합 중 여부 (IME 상태) */
  const [isComposing, setIsComposing] = useState(false);

  /** 연습 시작 시간 (Ref) */
  const startTimeRef = useRef(null);
  
  /** 연습 시작 시간 (State) */
  const [startTime, setStartTime] = useState(null);
  
  /** 경과 시간 (밀리초) */
  const [elapsedTime, setElapsedTime] = useState(0);

  /** 각 입력 필드의 ref 저장 */
  const inputRefs = useRef({});

  /** 총 입력한 글자 수 */
  const totalTypedRef = useRef(0);
  
  /** 오타 수 */
  const wrongTypedRef = useRef(0);

  /** 현재 WPM (Words Per Minute) */
  const [currentWpm, setCurrentWpm] = useState(0);
  
  /** 최대 WPM */
  const [maxWpm, setMaxWpm] = useState(0);
  
  /** 정확도 (%) */
  const [accuracy, setAccuracy] = useState(100);

  /** 각 글자의 상태 배열 (State) */
  const [charStates, setCharStates] = useState([]);
  
  /** 각 글자의 상태 배열 (Ref) */
  const charStatesRef = useRef([]);

  /** requestAnimationFrame ID 저장 */
  const rafRef = useRef(null);
  
  /** 각 줄의 오타 위치 기록 (wrongCharRef[line][idx] = true) */
  const wrongCharRef = useRef([]);
  
  /** 완료 모달 표시 여부 */
  const [showFinishModal, setShowFinishModal] = useState(false);

  // ============================================================================
  // 파일 로딩 및 초기화
  // ============================================================================

  /**
   * 연습 결과를 서버로 전송하기 위한 페이로드 생성
   * @returns {Object} 연습 결과 객체
   */
  function buildPracticePayload() {
    return {
      avgWpm: calculateAverageWpm(),
      maxWpm: maxWpm,
      elapsedTime: Math.floor(elapsedTime / 1000),
      accuracy: accuracy,
      type: "long",
    };
  }

  /**
   * 연습 결과를 서버로 전송
   * @param {Object} payload - 전송할 연습 결과 데이터
   */
  async function sendPracticeResult(payload) {
    try {
      await axios.post("http://localhost:8080/api/practice", payload, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
    } catch (error) {
      console.error("연습 결과 전송 실패", error);
    }
  }

  /**
   * 텍스트 파일을 로드하고 줄 단위로 분리
   * @param {string} file - 파일명
   * @returns {Promise<string[]>} 줄 단위로 분리된 텍스트 배열
   */
  async function loadFile(file) {
    const res = await fetch(`/longPracticeTxt/${file}`);
    const text = await res.text();
    return text.split("\n").map(line => line.trim());
  }

  /**
   * 파일 선택 시 호출되는 핸들러
   * 파일을 로드하고 모든 상태를 초기화
   * @param {string} file - 선택된 파일명
   */
  const handleFileSelect = async (file) => {
    const loaded = await loadFile(file);
    setLines(loaded);

    // 상태 초기화
    setCurrentLine(0);
    setUserInput("");
    setUserInputs([]);
    setElapsedTime(0);

    // 통계 초기화
    setCurrentWpm(0);
    setMaxWpm(0);
    setAccuracy(100);

    // Ref 초기화
    totalTypedRef.current = 0;
    wrongTypedRef.current = 0;
    charStatesRef.current = [];
    wrongCharRef.current = [];

    // 타이머 초기화
    startTimeRef.current = null;
    setStartTime(null);
  };

  // ============================================================================
  // 타이머 및 시간 관리
  // ============================================================================

  /**
   * 경과 시간을 실시간으로 업데이트하는 타이머
   */
  useEffect(() => {
    if (!startTime || showFinishModal) return;

    const id = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 100);

    return () => clearInterval(id);
  }, [startTime, showFinishModal]);

  /**
   * 밀리초를 MM:SS 형식으로 변환
   * @param {number} time - 밀리초 단위 시간
   * @returns {string} MM:SS 형식의 문자열
   */
  const formatElapsedTime = (time) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  // ============================================================================
  // UI 관리
  // ============================================================================

  /**
   * 현재 줄로 포커스 이동
   */
  useEffect(() => {
    const el = inputRefs.current[currentLine];
    if (el) el.focus();
  }, [currentLine]);

  /**
   * requestAnimationFrame을 사용한 렌더링 스케줄링
   * 성능 최적화를 위해 배치 렌더링 수행
   */
  function scheduleRender() {
    if (rafRef.current) return;

    rafRef.current = requestAnimationFrame(() => {
      // 각 줄의 상태 배열도 복사하여 참조 변경 (React.memo 리렌더링 보장)
      setCharStates(charStatesRef.current.map(lineStates => 
        lineStates ? [...lineStates] : []
      ));
      rafRef.current = null;
    });
  }

  // ============================================================================
  // 통계 계산
  // ============================================================================

  /**
   * 입력이 없을 때도 통계를 업데이트하기 위한 주기적 호출
   * idle 상태에서도 WPM이 감소하도록 보정
   */
  useEffect(() => {
    if (!startTime || showFinishModal) return;

    const id = setInterval(() => {
      updateRealtimeStats();
    }, 250);

    return () => clearInterval(id);
  }, [startTime, showFinishModal]);

  /**
   * 실시간 통계 업데이트 (WPM, 정확도)
   * 최소 경과 시간과 최소 입력 글자 수 조건을 만족할 때만 계산
   */
  function updateRealtimeStats() {
    const st = startTimeRef.current;
    if (!st) return;

    const elapsedMs = Date.now() - st;
    if (elapsedMs < MIN_ELAPSED_MS) return;

    const total = totalTypedRef.current;
    if (total < MIN_TYPED) return;

    const wrong = Math.max(0, wrongTypedRef.current);
    const elapsedMin = elapsedMs / 60000;

    if (total === 0) {
      setAccuracy(100);
      return;
    }

    // WPM 계산 및 제한
    let wpm = Math.round(total / elapsedMin);
    if (wpm > MAX_REASONABLE_WPM) wpm = MAX_REASONABLE_WPM;

    setCurrentWpm(wpm);
    setMaxWpm(prev => Math.max(prev, wpm));

    // 정확도 계산
    const acc = total === 0 ? 100 : Number((((total - wrong) / total) * 100).toFixed(2));
    setAccuracy(acc);
  }

  function calculateAverageWpm() {
    if (elapsedTime <= 0) return 0;
  
    const total = totalTypedRef.current;
    const minutes = elapsedTime / 60000;
  
    if (minutes <= 0) return 0;
  
    return Math.round(total / minutes);
  }
  

  // ============================================================================
  // 입력 처리
  // ============================================================================

  /**
   * 사용자 입력 변경 핸들러
   * 백스페이스 처리, 첫 입력 시 타이머 시작, 글자 판정, 다음 줄 이동 등을 처리
   * @param {Event} e - 입력 이벤트
   */
  function handleInputChange(e) {
    const value = e.target.value;
    const prev = userInput;
    const target = lines[currentLine] ?? "";

    // 백스페이스 처리: 지운 만큼 통계를 되돌림
    if (value.length < prev.length) {
      const newLen = value.length;

      // 지운 글자 수만큼 총 타수 되돌리기
      const diff = prev.length - newLen;
      totalTypedRef.current = Math.max(0, totalTypedRef.current - diff);

      // 지운 구간에 오타가 있었으면 오타 카운트도 되돌리기
      const prevStates = charStatesRef.current[currentLine] || [];
      for (let i = newLen; i < prevStates.length; i++) {
        if (prevStates[i] === "wrong") {
          wrongTypedRef.current = Math.max(0, wrongTypedRef.current - 1);
        }
      }

      // 상태 배열 길이 조정
      if (charStatesRef.current[currentLine]) {
        charStatesRef.current[currentLine].length = newLen;
      }

      setUserInput(value);
      scheduleRender();
      updateRealtimeStats();
      return;
    }

    // 입력 길이 제한: 목표 길이를 초과하지 않도록 제한
    if (value.length > target.length) {
      // 초과 입력 시 자동으로 다음 줄로 이동
      if (!isComposing && prev.length === target.length) {
        moveToNextLine(prev);
      }
      return;
    }

    // 첫 입력 시 타이머 시작
    if (!startTimeRef.current) {
      const now = Date.now();
      startTimeRef.current = now;
      setStartTime(now);
    }

    // 실제 추가된 글자 수 계산 (붙여넣기나 IME 커밋 대응)
    const addedLength = value.length - prev.length;
    
    // 입력 타수 증가 (실제 추가된 글자 수만큼)
    totalTypedRef.current += addedLength;

    setUserInput(value);

    // 추가된 모든 글자에 대해 판정 및 상태 업데이트
    for (let i = prev.length; i < value.length; i++) {
      const typedChar = value[i];
      const targetChar = target[i];
      
      if (typedChar && targetChar) {
        const result = judgeChar(typedChar, targetChar);
        updateCharState(currentLine, i, result);
      }
    }

    // 통계 업데이트
    updateRealtimeStats();

    // 줄 완료 시 다음 줄로 이동 (조합 중이 아닐 때만)
    if (!isComposing && value.length === target.length) {
      moveToNextLine(value);
    }
  }

  /**
   * 키보드 입력 핸들러
   * Enter 키로 줄 완료 처리
   * @param {Event} e - 키보드 이벤트
   */
  function handleKeyDown(e) {
    if (e.key !== "Enter") return;

    const target = lines[currentLine] ?? "";
    if (userInput.length === target.length) {
      e.preventDefault();
      moveToNextLine();
    }
  }

  /**
   * 다음 줄로 이동
   * 마지막 줄이면 연습 결과를 전송하고 완료 모달 표시
   * @param {string} finalInput - 저장할 최종 입력값 (선택)
   */
  function moveToNextLine(finalInput) {
    // 현재 줄 상태 확정
    finalizeLine(currentLine);

    // 입력값 저장
    const inputToSave = finalInput ?? userInput;
    setUserInputs(prev => {
      const next = [...prev];
      next[currentLine] = inputToSave;
      return next;
    });

    // 마지막 줄이면 연습 완료 처리
    if (currentLine === lines.length - 1) {
      // 타이머 중지 전에 최종 경과 시간 계산
      let finalElapsedTime = elapsedTime;
      if (startTimeRef.current) {
        finalElapsedTime = Date.now() - startTimeRef.current;
        setElapsedTime(finalElapsedTime);
      }
      setStartTime(null);
      startTimeRef.current = null;
      
      // 최종 경과 시간을 사용하여 페이로드 생성
      const total = totalTypedRef.current;
      const minutes = finalElapsedTime / 60000;
      const avgWpm = minutes > 0 ? Math.round(total / minutes) : 0;
      
      sendPracticeResult({
        avgWpm: avgWpm,
        maxWpm,
        elapsedTime: Math.floor(finalElapsedTime / 1000),
        accuracy,
        type: "long",
      });

      setShowFinishModal(true);
      return;
    }

    // 다음 줄로 이동
    setCurrentLine(prev => prev + 1);
    setUserInput("");
  }

  // ============================================================================
  // 한글 처리 및 글자 판정
  // ============================================================================

  /**
   * 한글 문자를 초성, 중성, 종성으로 분해
   * @param {string} char - 분해할 문자
   * @returns {string[]} [초성, 중성, 종성?] 배열 (한글이 아니면 원본 문자 반환)
   */
  function decomposeHangul(char) {
    if (!char) return [];
    const code = char.charCodeAt(0) - 0xac00;
    if (code < 0 || code > 11171) return [char];

    const cho = Math.floor(code / 588);
    const jung = Math.floor((code % 588) / 28);
    const jong = code % 28;

    return [CHO[cho], JUNG[jung], ...(JONG[jong] ? [JONG[jong]] : [])];
  }

  /**
   * 종성만 다른 경우인지 확인
   * 예: "안" vs "안녕"의 "안" 부분처럼 종성이 추가된 경우를 정확한 입력으로 처리
   * @param {string} typed - 입력한 문자
   * @param {string} target - 목표 문자
   * @returns {boolean} 종성만 다른 경우 true
   */
  function hasOnlyJongseongMismatch(typed, target) {
    const t = decomposeHangul(typed);
    const g = decomposeHangul(target);

    if (g.length !== 2) return false;
    if (t.length === 3 && t[0] === g[0] && t[1] === g[1]) return true;
    return false;
  }

  /**
   * 입력한 문자와 목표 문자의 정확도를 판정
   * @param {string} typedChar - 입력한 문자
   * @param {string} targetChar - 목표 문자
   * @returns {string|null} "correct" | "wrong" | null
   */
  function judgeChar(typedChar, targetChar) {
    if (!typedChar || !targetChar) return null;

    const typed = decomposeHangul(typedChar);
    const target = decomposeHangul(targetChar);

    // 각 자모를 비교
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] !== target[i]) {
        // 종성만 다른 경우는 정확한 입력으로 처리
        if (hasOnlyJongseongMismatch(typedChar, targetChar)) return "correct";
        return "wrong";
      }
    }
    return "correct";
  }

  /**
   * 특정 위치의 글자 상태를 업데이트
   * 오타 카운트는 상태 전환 시에만 변경 (중복 카운트 방지)
   * @param {number} line - 줄 인덱스
   * @param {number} idx - 글자 인덱스
   * @param {string} result - 판정 결과 ("correct" | "wrong")
   */
  function updateCharState(line, idx, result) {
    if (!charStatesRef.current[line]) charStatesRef.current[line] = [];
    if (!wrongCharRef.current[line]) wrongCharRef.current[line] = [];

    const prev = charStatesRef.current[line][idx];

    // 오타 카운트는 상태 전환 시에만 변경
    if (prev !== "wrong" && result === "wrong") {
      wrongTypedRef.current += 1;
    }
    if (prev === "wrong" && result === "correct") {
      wrongTypedRef.current = Math.max(0, wrongTypedRef.current - 1);
    }

    charStatesRef.current[line][idx] = result;
    scheduleRender();
  }

  /**
   * 줄 완료 시 해당 줄의 오타 위치를 확정 마킹
   * 중복 카운트 방지를 위해 사용
   * @param {number} lineIndex - 확정할 줄 인덱스
   */
  function finalizeLine(lineIndex) {
    const states = charStatesRef.current[lineIndex] || [];
    for (let idx = 0; idx < states.length; idx++) {
      if (states[idx] === "wrong") {
        wrongCharRef.current[lineIndex][idx] = true;
      }
    }
  }

  // ============================================================================
  // 페이지 계산
  // ============================================================================

  /** 현재 페이지 번호 (0부터 시작) */
  const currentPage = Math.floor(currentLine / LINES_PER_PAGE);
  
  /** 전체 페이지 수 */
  const totalPages = Math.max(1, Math.ceil(lines.length / LINES_PER_PAGE));
  
  /** 현재 페이지에 표시할 줄들 */
  const pageLines = lines.slice(currentPage * LINES_PER_PAGE, (currentPage + 1) * LINES_PER_PAGE);

  // ============================================================================
  // 렌더링
  // ============================================================================

  return (
    <div className="long-typing-practice-container">
      <SideBar
        title="긴 글 연습"
        menu={
          <PracticeMenu
            elapsedTime={formatElapsedTime(elapsedTime)}
            avgWpm={currentWpm}
            maxWpm={maxWpm}
            accuracy={accuracy}
          />
        }
      />

      <div className="typing-practice-main">
        <div className="typing-practice-content">
          <div className="tp-page-info">
            <span>현재 페이지: {currentPage + 1} / {totalPages}</span>
          </div>

          <div className="tp-lines-wrapper">
            {pageLines.map((line, idx) => {
              const lineIndex = currentPage * LINES_PER_PAGE + idx;
              const isActualLine = lineIndex < lines.length;
              const isCurrent = isActualLine && lineIndex === currentLine;

              return (
                <TypingLine
                  key={lineIndex}
                  line={line}
                  lineIndex={lineIndex}
                  isCurrent={isCurrent}
                  value={isCurrent ? userInput : userInputs[lineIndex] || ""}
                  states={charStates[lineIndex]}
                  inputRef={el => (inputRefs.current[lineIndex] = el)}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onCompositionStart={() => setIsComposing(true)}
                  onCompositionEnd={() => setIsComposing(false)}
                />
              );
            })}
          </div>
        </div>
      </div>

      <FileSelectModal isOpen={lines.length === 0} onFileSelect={handleFileSelect} />

      {showFinishModal && (
        <FinishModal
          result={buildPracticePayload()}
          onClose={() => setShowFinishModal(false)}
          onRetry={() => window.location.reload()}
        />
      )}
    </div>
  );
};

export default LongTypingPractice;
