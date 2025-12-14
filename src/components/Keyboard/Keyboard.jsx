import "./Keyboard.css";

// 한글 두벌식 키보드 레이아웃
const KEY_ROWS = [
  ["ㅂ", "ㅈ", "ㄷ", "ㄱ", "ㅅ", "ㅛ", "ㅕ", "ㅑ", "ㅐ", "ㅔ"],
  ["ㅁ", "ㄴ", "ㅇ", "ㄹ", "ㅎ", "ㅗ", "ㅓ", "ㅏ", "ㅣ"],
  ["ㅋ", "ㅌ", "ㅊ", "ㅍ", "ㅠ", "ㅜ", "ㅡ"]
];

// 영문 키를 한글 키로 매핑
const ENG_TO_HANGUL = {
  Q: "ㅂ", W: "ㅈ", E: "ㄷ", R: "ㄱ", T: "ㅅ", Y: "ㅛ", U: "ㅕ", I: "ㅑ", O: "ㅐ", P: "ㅔ",
  A: "ㅁ", S: "ㄴ", D: "ㅇ", F: "ㄹ", G: "ㅎ", H: "ㅗ", J: "ㅓ", K: "ㅏ", L: "ㅣ",
  Z: "ㅋ", X: "ㅌ", C: "ㅊ", V: "ㅍ", B: "ㅠ", N: "ㅜ", M: "ㅡ"
};

const Keyboard = ({ highlightKey }) => {
  // 영문 키가 들어오면 한글 키로 변환
  const hangulKey = highlightKey ? ENG_TO_HANGUL[highlightKey] || null : null;

  return (
    <div className="keyboard">
      {KEY_ROWS.map((row, i) => (
        <div key={i} className="keyboard-row">
          {row.map((key) => (
            <div
              key={key}
              className={`key ${hangulKey === key ? "active" : ""}`}
            >
              {key}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;

