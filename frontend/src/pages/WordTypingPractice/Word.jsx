import { useState, useEffect, useRef } from "react";
import "./Word.css";
import SideBar from "../../components/SideBar/SideBar";
import PracticeMenu from "../../components/PracticeMenu/PracticeMenu";
import FileSelectModal from "../../components/FileSelectModal/FileSelectModal";
import Keyboard from "../../components/Keyboard/Keyboard";
import FinishModal from "../../components/FileSelectModal/FinishModal";
import axios from "axios";

const MIN_ELAPSED_MS = 5000;
const MIN_TYPED = 8;
const MAX_REASONABLE_WPM = 800;
const KEY_HIGHLIGHT_DURATION = 200;

const Word = () => {

  const hasSubmittedRef = useRef(false);

  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  
  const [charStates, setCharStates] = useState([]);
  const [currentWpm, setCurrentWpm] = useState(0);
  const [maxWpm, setMaxWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showFinishModal, setShowFinishModal] = useState(false);
  
  /** 마지막으로 누른 키 (키보드 하이라이트용) */
  const [lastPressedKey, setLastPressedKey] = useState(null);
  
  const isComposingRef = useRef(false);
  const startTimeRef = useRef(null);
  const totalTypedRef = useRef(0);
  const wrongTypedRef = useRef(0);
  const inputRef = useRef(null);

  /** 파일 로딩 */
  async function loadFile(file) {
    const res = await fetch(`/wordPracticeTxt/${file}`);
    const text = await res.text();
    return text.split(" ").filter(word => word.trim() !== "");
  }

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
    hasSubmittedRef.current = false;

    // 타이머 초기화
    startTimeRef.current = null;
    setStartTime(null);
    
    // 상태 초기화
    setCharStates([]);
  };

  /**타이머 */
  useEffect(() => {
    if (!startTime || showFinishModal) return;

    const id = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 100);

    return () => clearInterval(id);
  }, [startTime, showFinishModal]);


  function startTimerIfNeeded() {
    if (!startTimeRef.current) {
      const now = Date.now();
      startTimeRef.current = now;
      setStartTime(now);
    }
  }

  function formatElapsedTime(ms) {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }


  /**
   * 입력 필드에 포커스 설정
   */
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentWordIndex]);

  function getKeyFromCode(code) {
    if (code && code.startsWith("Key")) {
      return code.replace("Key", "");
    }
    return null;
  }

  /** 통계 업데이트 */
  function updateStats() {
    if (showFinishModal) return;
    if (!startTimeRef.current) return;
  
    const total = totalTypedRef.current;
    const wrong = wrongTypedRef.current;
  
    const acc =
      total === 0 ? 100 : Number((((total - wrong) / total) * 100).toFixed(2));
    setAccuracy(acc);

    const elapsedMs = Date.now() - startTimeRef.current;
    if (elapsedMs < MIN_ELAPSED_MS) return;
    if (total < MIN_TYPED) return;
  
    const minutes = elapsedMs / 60000;
    let wpm = Math.round(total / minutes);
    if (wpm > MAX_REASONABLE_WPM) wpm = MAX_REASONABLE_WPM;
  
    setCurrentWpm(wpm);
    setMaxWpm(prev => Math.max(prev, wpm));
  }

  useEffect(() => {
    if (!startTime || showFinishModal) return;

    const id = setInterval(() => {
      updateStats();
    }, 250);

    return () => clearInterval(id);
  }, [startTime, showFinishModal]);


  /** 키 입력 처리 */
  function handleKeyDown(e) {
    if (showFinishModal) return;
    if (isComposingRef.current) return;

    // 키보드 하이라이트를 위한 키 추출
    const key = getKeyFromCode(e.code);
    if (key) {
      setLastPressedKey(key);
      setTimeout(() => setLastPressedKey(null), KEY_HIGHLIGHT_DURATION);
    }

    if (e.key === "Backspace") {
      handleBackspace();
    }

    if (e.key === "Enter") {
      const target = words[currentWordIndex] ?? "";
      if (userInput.length === target.length) {
        e.preventDefault();
        moveToNextLine(userInput);
      }
    }
  }

  function handleBackspace() {
    if (showFinishModal) return;
    if (userInput.length === 0) return;

    const idx = userInput.length - 1;
    const prevStates = charStates[currentWordIndex] || [];
    const prevState = prevStates[idx];

    totalTypedRef.current = Math.max(0, totalTypedRef.current - 1);

    if (prevState === "wrong") {
      wrongTypedRef.current = Math.max(0, wrongTypedRef.current - 1);
    }

    setUserInput(prev => prev.slice(0, -1));
    setCharStates(prev => {
      const next = [...prev];
      if (next[currentWordIndex]) {
        next[currentWordIndex] = next[currentWordIndex].slice(0, idx);
      }
      return next;
    });

    updateStats();
  }
  
  function handleInputChange(e) {
    if (showFinishModal) return;
    const value = e.target.value;
    setUserInput(value);

    if (e.nativeEvent?.isComposing) return;
    if (isComposingRef.current) return;

    const target = words[currentWordIndex] || "";
    const prevLen = userInput.length;

    startTimerIfNeeded();

      for (let i = prevLen; i < value.length; i++) {
        const typed = value[i];
        const expected = target[i];

        if (typed && expected) {
          totalTypedRef.current++;

          setCharStates(prev => {
            const next = [...prev];
            if (!next[currentWordIndex]) next[currentWordIndex] = [];
            next[currentWordIndex] = [...next[currentWordIndex]];

            if (typed === expected) {
              next[currentWordIndex][i] = "correct";
            } else {
              next[currentWordIndex][i] = "wrong";
              wrongTypedRef.current++;
            }
            return next;
          });
        }
      }

      updateStats();

      if (value.length === target.length && value.length > 0) {
        moveToNextWord();
      }
  }

  function moveToNextLine() {
    if (hasSubmittedRef.current) return;

    if (currentWordIndex === words.length - 1) {
      finishPractice();
      return;
    }
    setCurrentWordIndex(prev => prev + 1);
    setUserInput("");
  }

  function handleCompositionStart() {
    if (showFinishModal) return;
    isComposingRef.current = true;
  }

  function handleCompositionEnd(e) {
    if (showFinishModal) return;
    isComposingRef.current = false;

    const value = e.target.value;
    const target = words[currentWordIndex] ?? "";
    const prevStates = charStates[currentWordIndex] || [];
    const prevLen = prevStates.length;

    startTimerIfNeeded();

    let wrong = 0;
    const newStates = [...prevStates];

    for (let i = prevLen; i < value.length; i++) {
      const typed = value[i];
      const expected = target[i];

      if (typed && expected) {
        totalTypedRef.current++;

        if (typed === expected) {
          newStates[i] = "correct";
        } else {
          newStates[i] = "wrong";
          wrong++;
        }
      }
    }

    wrongTypedRef.current += wrong;

    setCharStates(prev => {
      const next = [...prev];
      next[currentWordIndex] = newStates;
      return next;
    });

    updateStats();

    if (value.length === target.length && value.length > 0) {
      moveToNextLine(value);
    }
  }

  function finishPractice() {
    if (showFinishModal) return;
    if (startTimeRef.current) {
      setElapsedTime(Date.now() - startTimeRef.current);
    }
    setShowFinishModal(true);

    axios.post(
      "http://localhost:8080/api/practice",
      {
        avgWpm: calculateAverageWpm(),
        maxWpm,
        elapsedTime: Math.floor(elapsedTime / 1000),
        accuracy,
        type: "word",
      },
      { withCredentials: true }
    );
  }

  function calculateAverageWpm() {
    if (!elapsedTime) return 0;
    return Math.round(totalTypedRef.current / (elapsedTime / 60000));
  }

  const targetText = words[currentWordIndex] || "";
  const completedWords = words.slice(0, currentWordIndex);
  const nextWord = words[currentWordIndex + 1] || "";


  function renderHighlighted() {
    const chars = targetText.split("");
    const states = charStates[currentWordIndex] || [];

    return (
      <span>
        {chars.map((ch, i) => {
          let cls = "word-char";

          if (i < userInput.length) {
            const state = states[i];
            if (state === "correct") {
              cls += " word-correct";
            } else if (state === "wrong") {
              cls += " word-wrong";
            } else {
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
          result={{
            avgWpm: calculateAverageWpm(),
            maxWpm,
            elapsedTime: Math.floor(elapsedTime / 1000),
            accuracy,
          }}
          onClose={() => setShowFinishModal(false)}
          onRetry={() => window.location.reload()}
        />
      )}
    </div>
  );
}
export default Word;