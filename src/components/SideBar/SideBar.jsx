import ProfileCard from "../ProfileCard/ProfileCard";
import "./SideBar.css";

const SideBar = ({ title, menu, userId }) => {
  return (
    <aside className="side_bar">
      <h2>{title}</h2>
      <ProfileCard userId={userId} />
      {menu}
    </aside>
  );
};

export default SideBar;