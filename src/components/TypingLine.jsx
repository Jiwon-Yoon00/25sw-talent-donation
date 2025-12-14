import React from "react";
import "./TypingLine.css";

const TypingLine = React.memo(
  ({
    line,
    isCurrent,
    value,
    states,
    inputRef,
    onChange,
    onKeyDown,
    onCompositionStart,
    onCompositionEnd,
  }) => {
    return (
      <div className={`tp-line ${isCurrent ? "tp-current" : ""}`}>
        <div className="tp-highlight-line">
          {line.split("").map((ch, i) => {
            let cls = "tp-char";
            if (states?.[i] === "correct") cls += " tp-correct";
            if (states?.[i] === "wrong") cls += " tp-wrong";
            return (
              <span key={i} className={cls}>
                {ch}
              </span>
            );
          })}
        </div>

        <input
          ref={inputRef}
          className="tp-input"
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onCompositionStart={onCompositionStart}
          onCompositionEnd={onCompositionEnd}
          disabled={!isCurrent}
          spellCheck={false}
          autoComplete="off"
        />
      </div>
    );
  },
  (prev, next) =>
    prev.value === next.value &&
    prev.states === next.states &&
    prev.isCurrent === next.isCurrent
);

export default TypingLine;
