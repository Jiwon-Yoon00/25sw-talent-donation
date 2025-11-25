import './MyPageMenu.css';

const MyPageMenu = () => {
  return (
    <div className="sub_mypage_info_item">
      <div>
        <img src="/src/assets/setting.svg" alt="profile" className="item_icon" />
        <p>프로필 설정</p>
      </div>
      <div>
        <img src="/src/assets/logout.svg" alt="profile" className="item_icon" />
        <p>로그아웃</p>
      </div>
      <div>
        <img src="/src/assets/user-delete.svg" alt="profile" className="item_icon" />
        <p>탈퇴하기</p>
      </div>
    </div>
  );
};

export default MyPageMenu;
