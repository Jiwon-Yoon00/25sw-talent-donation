import './FileSelectModal.css';

const longFileMapping = {
  "동백꽃": "동백꽃.txt",
  "마지막 잎새": "마지막 잎새.txt",
  "메밀꽃 필 무렵": "메밀꽃 필 무렵.txt",
  "별 헤는 밤": "별 헤는 밤.txt"
};

const wordFileMapping = {
  "word": "word.txt"
};

const FileSelectModal = ({isOpen, onFileSelect, type = 'long'}) => {
  if (!isOpen) return null;

  const fileMapping = type === 'word' ? wordFileMapping : longFileMapping;
  const files = Object.keys(fileMapping);

  const handleFileClick = (fileDisplayName) => {
    const actualFileName = fileMapping[fileDisplayName];
    if (actualFileName && onFileSelect) {
      onFileSelect(actualFileName);
    }
  };

  return(
    <div className='practice-modal-overlay'>
      <div className='practice-modal-content' onClick={(e) => e.stopPropagation()}>
        <h2>연습목록</h2>
        <div className='file-select-list'>
          {files.map((f) => (
            <button
              className='file-select-item'
              key={f}
              onClick={() => handleFileClick(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FileSelectModal;