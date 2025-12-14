import { useState } from "react";
import FileSelectModal from "../../components/FileSelectModal/FileSelectModal";
import SideBar from "../../components/SideBar/SideBar";
import PracticeMenu from "../../components/PracticeMenu/PracticeMenu";

const LongTypingPractice = () => {
  const [showFileSelectModal, setShowFileSelectModal] = useState(true); // 파일 선택 모달 표시 여부
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setShowFileSelectModal(false);
  };
  console.log(selectedFile);

  return (
    
    <div>
      <SideBar title="긴글 연습" menu={<PracticeMenu />}/>
      {/* 파일 선택 모달 */}
      <FileSelectModal isOpen={showFileSelectModal} onFileSelect={handleFileSelect} type="long"/>
    </div>
  );
};

export default LongTypingPractice;
