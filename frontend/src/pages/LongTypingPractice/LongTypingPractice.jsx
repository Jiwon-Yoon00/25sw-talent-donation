import { useState, useEffect, useRef } from "react";
import "./LongTypingPractice.css";
import SideBar from "@/components/SideBar/SideBar";
import PracticeMenu from "@/components/PracticeMenu/PracticeMenu";
import FileSelectModal from "@/components/FileSelectModal/FileSelectModal";
import TypingLine from "@/components/TypingLine";
import FinishModal from "@/components/FileSelectModal/FinishModal";
import axios from "axios";


const LINES_PER_PAGE = 10;
const MIN_ELAPSED_MS = 2000;
const MIN_TYPED = 8;
const MAX_REASONABLE_WPM = 800;

export default function LongTypingPractice() {
  const [lines, setLines] = useState([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [userInputs, setUserInputs] = useState([]);


  const [charStates, setCharStates] = useState([]);
  const [currentWpm, setCurrentWpm] = useState(0);
  const [maxWpm, setMaxWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);


  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [showFinishModal, setShowFinishModal] = useState(false);

  const isComposingRef = useRef(false);
  const startTimeRef = useRef(null);
  const totalTypedRef = useRef(0);
  const wrongTypedRef = useRef(0);
  const inputRefs = useRef({});

  async function loadFile(file) {
    const res = await fetch(`/longPracticeTxt/${file}`);
    const text = await res.text();
    return text.split("\n").map(v => v.trim());
  }

  async function handleFileSelect(file) {
    const loaded = await loadFile(file);
    setLines(loaded);

    setCurrentLine(0);
    setUserInput("");
    setUserInputs([]);
    setCharStates([]);

    setElapsedTime(0);
    setCurrentWpm(0);
    setMaxWpm(0);
    setAccuracy(100);

    totalTypedRef.current = 0;
    wrongTypedRef.current = 0;
    startTimeRef.current = null;
    setStartTime(null);
  }

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

  /**통계 */
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

  /**입력 처리 */
  function handleChange(e) {
    if (showFinishModal) return;
    const value = e.target.value;
    setUserInput(value);

    if (!isComposingRef.current) {
      const target = lines[currentLine] ?? "";
      const prevLen = userInput.length;

      startTimerIfNeeded();

      for (let i = prevLen; i < value.length; i++) {
        const typed = value[i];
        const expected = target[i];

        if (typed && expected) {
          totalTypedRef.current++;

          setCharStates(prev => {
            const next = [...prev];
            if (!next[currentLine]) next[currentLine] = [];
            next[currentLine] = [...next[currentLine]];

            if (typed === expected) {
              next[currentLine][i] = "correct";
            } else {
              next[currentLine][i] = "wrong";
              wrongTypedRef.current++;
            }
            return next;
          });
        }
      }

      updateStats();

      if (value.length === target.length) {
        moveToNextLine(value);
      }
    }
  }

  function handleCompositionStart() {
    if (showFinishModal) return;
    isComposingRef.current = true;
  }

  function handleCompositionEnd(e) {
    if (showFinishModal) return;
    isComposingRef.current = false;
  
    const value = e.target.value;
    const target = lines[currentLine] ?? "";
    const prevStates = charStates[currentLine] || [];
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
      next[currentLine] = newStates;
      return next;
    });
  
    updateStats();
  
    if (value.length === target.length) {
      moveToNextLine(value);
    }
  }
  

  function handleKeyDown(e) {
    if (showFinishModal) return;
    if (isComposingRef.current) return;

    if (e.key === "Backspace") {
      handleBackspace();
    }

    if (e.key === "Enter") {
      const target = lines[currentLine] ?? "";
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
    const prevStates = charStates[currentLine] || [];
    const prevState = prevStates[idx];

    totalTypedRef.current = Math.max(0, totalTypedRef.current - 1);

    if (prevState === "wrong") {
      wrongTypedRef.current = Math.max(0, wrongTypedRef.current - 1);
    }

    // userInput과 charStates에서 마지막 글자 제거
    setUserInput(prev => prev.slice(0, -1));
    setCharStates(prev => {
      const next = [...prev];
      if (next[currentLine]) {
        next[currentLine] = next[currentLine].slice(0, idx);
      }
      return next;
    });

    updateStats();
  }

  useEffect(() => {
    const el = inputRefs.current[currentLine];
    if (el) {
      el.focus();
    }
  }, [currentLine]);
  


  /**줄 이동 & 종료 */
  function moveToNextLine(finalInput) {
    setUserInputs(prev => {
      const next = [...prev];
      next[currentLine] = finalInput;
      return next;
    });

    if (currentLine === lines.length - 1) {
      finishPractice();
      return;
    }

    setCurrentLine(prev => prev + 1);
    setUserInput("");
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
        type: "long",
      },
      { withCredentials: true }
    );
  }

  function calculateAverageWpm() {
    if (!elapsedTime) return 0;
    return Math.round(totalTypedRef.current / (elapsedTime / 60000));
  }

  const currentPage = Math.floor(currentLine / LINES_PER_PAGE);
  const pageLines = lines.slice(
    currentPage * LINES_PER_PAGE,
    (currentPage + 1) * LINES_PER_PAGE
  );


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
      <div className ="typing-practice-main">
        <div className="typing-practice-content">
          <div className="tp-page-info">
            <p>현재페이지: {currentPage + 1}/{Math.ceil(lines.length / LINES_PER_PAGE)}</p>
          </div>
          <div className="tp-lines-wrapper">
            {pageLines.map((line, idx) => {
              const lineIndex = currentPage * LINES_PER_PAGE + idx;
              const isCurrent = lineIndex === currentLine;
      
              return (
                <TypingLine
                  key={lineIndex}
                  line={line}
                  isCurrent={isCurrent}
                  value={isCurrent ? userInput : userInputs[lineIndex] || ""}
                  states={charStates[lineIndex]}
                  inputRef={el => (inputRefs.current[lineIndex] = el)}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  onCompositionStart={handleCompositionStart}
                  onCompositionEnd={handleCompositionEnd}
                />
              );
            })}
          </div>
        </div>
      </div>


      <FileSelectModal isOpen={lines.length === 0} onFileSelect={handleFileSelect} />

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
