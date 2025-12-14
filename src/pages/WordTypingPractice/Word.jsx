import { useState, useEffect, useRef } from "react";
import "./Word.css";
import SideBar from "../../components/SideBar/SideBar";
import PracticeMenu from "../../components/PracticeMenu/PracticeMenu";
import FileSelectModal from "../../components/FileSelectModal/FileSelectModal";
import Keyboard from "../../components/Keyboard/Keyboard";
import FinishModal from "../../components/FileSelectModal/FinishModal";
import axios from "axios";

// ============================================================================
// 상수 정의
// ============================================================================

const CHO = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
const JUNG = ["ㅏ","ㅐ","ㅑ","ㅒ","ㅓ","ㅔ","ㅕ","ㅖ","ㅗ","ㅘ","ㅙ","ㅚ","ㅛ","ㅜ","ㅝ","ㅞ","ㅟ","ㅠ","ㅡ","ㅢ","ㅣ"];
const JONG = ["", "ㄱ","ㄲ","ㄳ","ㄴ","ㄵ","ㄶ","ㄷ","ㄹ","ㄺ","ㄻ","ㄼ","ㄽ","ㄾ","ㄿ","ㅀ","ㅁ","ㅂ","ㅄ","ㅅ","ㅆ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];

/** WPM 계산을 위한 최소 경과 시간 (밀리초) */
const MIN_ELAPSED_MS = 5000;

/** WPM 계산을 위한 최소 입력 글자 수 */
const MIN_TYPED = 8;

/** 합리적인 최대 WPM 값 (이상치 방지) */
const MAX_REASONABLE_WPM = 800;

/** 키보드 하이라이트 지속 시간 (밀리초) */
const KEY_HIGHLIGHT_DURATION = 200;

const Word = () => {
  // ============================================================================
  // 상태 관리
  // ============================================================================

  /** 연습할 단어 배열 */
  const [words, setWords] = useState([]);
  
  /** 현재 입력 중인 단어 인덱스 */
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  
  /** 현재 단어의 사용자 입력 */
  const [userInput, setUserInput] = useState("");
  
  /** 한글 입력 조합 중 여부 (IME 상태) */
  const [isComposing, setIsComposing] = useState(false);
  
  /** 연습 시작 시간 (Ref) */
  const startTimeRef = useRef(null);
  
  /** 연습 시작 시간 (State) */
  const [startTime, setStartTime] = useState(null);
  
  /** 경과 시간 (밀리초) */
  const [elapsedTime, setElapsedTime] = useState(0);
  
  /** 총 입력한 글자 수 (Ref) */
  const totalTypedRef = useRef(0);
  
  /** 오타 수 (Ref) */
  const wrongTypedRef = useRef(0);
  
  /** 현재 WPM (Words Per Minute) */
  const [currentWpm, setCurrentWpm] = useState(0);
  
  /** 최대 WPM */
  const [maxWpm, setMaxWpm] = useState(0);
  
  /** 정확도 (%) */
  const [accuracy, setAccuracy] = useState(100);
  
  /** 마지막으로 누른 키 (키보드 하이라이트용) */
  const [lastPressedKey, setLastPressedKey] = useState(null);
  
  /** 완료 모달 표시 여부 */
  const [showFinishModal, setShowFinishModal] = useState(false);
  
  /** 각 글자의 상태 배열 (State) */
  const [charStates, setCharStates] = useState([]);
  
  /** 각 글자의 상태 배열 (Ref) */
  const charStatesRef = useRef([]);
  
  /** 입력 필드 ref */
  const inputRef = useRef(null);

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
      wrongTyped: wrongTypedRef.current,
      type: "word",
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
      });
    } catch (error) {
      console.error("연습 결과 전송 실패", error);
    }
  }

  /**
   * 텍스트 파일을 로드하고 단어 단위로 분리
   * @param {string} file - 파일명
   * @returns {Promise<string[]>} 단어 단위로 분리된 텍스트 배열
   */
  async function loadFile(file) {
    const res = await fetch(`/wordPracticeTxt/${file}`);
    const text = await res.text();
    return text.split(" ").filter(word => word.trim() !== "");
  }

  /**
   * 파일 선택 시 호출되는 핸들러
   * 파일을 로드하고 모든 상태를 초기화
   * @param {string} file - 선택된 파일명
   */
  const handleFileSelect = async (file) => {
    const loaded = await loadFile(file);
    setWords(loaded);

    // 상태 초기화
    setCurrentWordIndex(0);
    setUserInput("");
    setElapsedTime(0);

    // 통계 초기화
    setCurrentWpm(0);
    setMaxWpm(0);
    setAccuracy(100);

    // Ref 초기화
    totalTypedRef.current = 0;
    wrongTypedRef.current = 0;
    charStatesRef.current = [];

    // 타이머 초기화
    startTimeRef.current = null;
    setStartTime(null);
    
    // 상태 초기화
    setCharStates([]);
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
    const seconds = Math.floor(time / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // ============================================================================
  // UI 관리
  // ============================================================================

  /**
   * 입력 필드에 포커스 설정
   */
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentWordIndex]);

  /**
   * 키 코드를 영문 키로 변환
   * @param {string} code - 키 코드 (예: "KeyQ")
   * @returns {string|null} 변환된 키 (예: "Q") 또는 null
   */
  function getKeyFromCode(code) {
    if (code && code.startsWith("Key")) {
      return code.replace("Key", "");
    }
    return null;
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

  /**
   * 평균 WPM 계산
   * @returns {number} 평균 WPM
   */
  function calculateAverageWpm() {
    if (elapsedTime <= 0) return 0;
  
    const total = totalTypedRef.current;
    const minutes = elapsedTime / 60000;
  
    if (minutes <= 0) return 0;
  
    return Math.round(total / minutes);
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
   * @param {number} idx - 글자 인덱스
   * @param {string} result - 판정 결과 ("correct" | "wrong")
   */
  function updateCharState(idx, result) {
    if (!charStatesRef.current) charStatesRef.current = [];
    
    const prev = charStatesRef.current[idx];

    // 오타 카운트는 상태 전환 시에만 변경
    if (prev !== "wrong" && result === "wrong") {
      wrongTypedRef.current += 1;
    }
    if (prev === "wrong" && result === "correct") {
      wrongTypedRef.current = Math.max(0, wrongTypedRef.current - 1);
    }

    charStatesRef.current[idx] = result;
    setCharStates([...charStatesRef.current]);
  }

  // ============================================================================
  // 입력 처리
  // ============================================================================

  /**
   * 키보드 입력 핸들러
   * Enter 키로 단어 완료 처리 및 키보드 하이라이트
   * @param {Event} e - 키보드 이벤트
   */
  function handleKeyDown(e) {
    const keyCode = getKeyFromCode(e.code);
    if (keyCode && /[A-Z]/.test(keyCode)) {
      setLastPressedKey(keyCode);
      setTimeout(() => setLastPressedKey(null), KEY_HIGHLIGHT_DURATION);
    }
  
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
  
      // 아무것도 안 쳤을 때만 방지
      if (userInput.length === 0) return;
  
      handleComplete();
    }
  }
  

  /**
   * 사용자 입력 변경 핸들러
   * 백스페이스 처리, 첫 입력 시 타이머 시작, 글자 판정, 다음 단어 이동 등을 처리
   * @param {Event} e - 입력 이벤트
   */
  function handleInputChange(e) {
    const value = e.target.value;
    const target = words[currentWordIndex] || "";

    if (value.length > target.length) {
      // 입력 길이가 목표보다 길면 제한
      return;
    }

    const prev = userInput;

    // 백스페이스 처리: 지운 만큼 통계를 되돌림
    if (value.length < prev.length) {
      const diff = prev.length - value.length;
      totalTypedRef.current = Math.max(0, totalTypedRef.current - diff);

      // 지운 구간의 상태 확인하고 되돌리기
      const prevStates = charStatesRef.current || [];
      for (let i = value.length; i < prevStates.length; i++) {
        if (prevStates[i] === "wrong") {
          wrongTypedRef.current = Math.max(0, wrongTypedRef.current - 1);
        }
      }

      // 상태 배열 길이 조정
      if (charStatesRef.current) {
        charStatesRef.current.length = value.length;
      }

      setUserInput(value);
      setCharStates([...charStatesRef.current]);
      updateRealtimeStats();
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
        updateCharState(i, result);
      }
    }

    // 통계 업데이트
    updateRealtimeStats();

    // 단어 완료 시 다음 단어로 이동 (조합 중이 아닐 때만)
    if (!isComposing && value === target && value.length > 0) {
      // 이벤트 객체를 비동기적으로 사용하지 않도록 값 캡처
      const capturedValue = value;
      const capturedTarget = target;
      setTimeout(() => {
        // inputRef를 통해 현재 값을 확인 (이벤트 객체 대신)
        const currentValue = inputRef.current?.value || capturedValue;
        if (currentValue === capturedTarget && currentValue.length > 0) {
          handleComplete();
        }
      }, 100);
    }
  }

  /**
   * 단어 완료 처리
   * 다음 단어로 이동하거나 연습 완료 처리
   */
  function handleComplete() {
    // 다음 단어로 이동
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
      setUserInput("");
      // 글자 상태 초기화
      charStatesRef.current = [];
      setCharStates([]);
    } else {
      // 모든 단어 완료 시 연습 완료 처리
      // 타이머 중지 전에 최종 경과 시간 계산
      let finalElapsedTime = elapsedTime;
      if (startTimeRef.current) {
        finalElapsedTime = Date.now() - startTimeRef.current;
        setElapsedTime(finalElapsedTime);
      }
      setStartTime(null);
      startTimeRef.current = null;
      
      // 최종 경과 시간을 사용하여 페이로드 생성
      const payload = {
        avgWpm: finalElapsedTime > 0 ? Math.round(totalTypedRef.current / (finalElapsedTime / 60000)) : 0,
        maxWpm: maxWpm,
        elapsedTime: Math.floor(finalElapsedTime / 1000),
        accuracy: accuracy,
        wrongTyped: wrongTypedRef.current,
        type: "word",
      };
      
      sendPracticeResult(payload);
      setShowFinishModal(true);
    }
  }

  /**
   * 한글 입력 조합 시작 핸들러
   */
  function handleCompositionStart() {
    setIsComposing(true);
  }

  /**
   * 한글 입력 조합 종료 핸들러
   */
  function handleCompositionEnd() {
    setIsComposing(false);
  }

  // ============================================================================
  // 렌더링
  // ============================================================================

  /** 현재 목표 단어 */
  const targetText = words[currentWordIndex] || "";

  /** 완료된 단어들 (왼쪽) */
  const completedWords = words.slice(0, currentWordIndex);
  
  /** 다음 단어 (오른쪽) */
  const nextWord = words[currentWordIndex + 1] || "";

  /**
   * 하이라이트된 텍스트 렌더링
   * @returns {JSX.Element} 하이라이트된 텍스트 요소
   */
  function renderHighlighted() {
    const chars = targetText.split("");

    return (
      <span>
        {chars.map((ch, i) => {
          let cls = "word-char";

          if (i < userInput.length) {
            
            const state = charStates[i];
            if (state === "correct") {
              cls += " word-correct";
            } else if (state === "wrong") {
              cls += " word-wrong";
            } else {
              // 상태가 아직 없으면 기본 비교
              cls += userInput[i] === ch ? " word-correct" : " word-wrong";
            }
          }

          return (
            <span key={i} className={cls}>
              {ch}
            </span>
          );
        })}

        {userInput.length > targetText.length && (
          <span className="word-extra-wrong">
            {userInput.slice(targetText.length)}
          </span>
        )}
      </span>
    );
  }

  return (
    <div className="word-typing-practice-container">
      <SideBar
        title="단어 연습"
        menu={
          <PracticeMenu
            elapsedTime={formatElapsedTime(elapsedTime)}
            avgWpm={currentWpm}
            maxWpm={maxWpm}
            accuracy={accuracy}
          />
        }
      />

      <div className="word-typing-practice-main">
        <div className="word-typing-practice-content">
          <div className="word-layout">
            {/* 왼쪽: 가장 최근 완료된 단어 */}
            <div className="word-section word-completed">
              <div className="word-section-title">완료</div>
              {completedWords.length > 0 ? (
                <div className="word-item word-completed-item">
                  <div className="word-target-text">{completedWords[completedWords.length - 1]}</div>
                </div>
              ) : (
                <div className="word-item word-completed-item">
                  <div className="word-target-text">-</div>
                </div>
              )}
            </div>

            {/* 가운데: 현재 단어 */}
            <div className="word-section word-current-section">
              <div className="word-section-title">현재</div>
              <div className="word-item word-current">
                <div className="word-target-text">{renderHighlighted()}</div>
              </div>
            </div>

            {/* 오른쪽: 다음 단어 */}
            <div className="word-section word-next">
              <div className="word-section-title">다음</div>
              <div className="word-item word-next-item">
                <div className="word-target-text">{nextWord || "완료"}</div>
              </div>
            </div>
          </div>

          <input
            ref={inputRef}
            type="text"
            className="word-input"
            value={userInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            autoFocus
            placeholder="여기에 입력하세요..."
          />

          <Keyboard highlightKey={lastPressedKey} />
        </div>
      </div>

      <FileSelectModal 
        isOpen={words.length === 0} 
        onFileSelect={handleFileSelect}
        type="word"
      />

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

export default Word;

