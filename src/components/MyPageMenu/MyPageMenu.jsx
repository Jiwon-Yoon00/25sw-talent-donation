import './MyPageMenu.css';
import SettingIcon from '/src/assets/setting.svg';
import LogoutIcon from '/src/assets/logout.svg';
import UserDeleteIcon from '/src/assets/user-delete.svg';

const MyPageMenu = () => {
  return (
    <div className="sub_mypage_info_item">
      <div>
        <img src={SettingIcon} alt="profile" className="item_icon" />
        <p>프로필 설정</p>
      </div>
      <div>
        <img src={LogoutIcon} alt="profile" className="item_icon" />
        <p>로그아웃</p>
      </div>
      <div>
        <img src={UserDeleteIcon} alt="profile" className="item_icon" />
        <p>탈퇴하기</p>
      </div>
    </div>
  );
};

export default MyPageMenu;
