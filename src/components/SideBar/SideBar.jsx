import ProfileCard from "../ProfileCard/ProfileCard";
import './SideBar.css';


const SideBar = ({title, menu}) => {
  return(
    <aside className="side_bar">
      <h2>{title}</h2>
      <ProfileCard />
      {menu}
    </aside>
  )}

export default SideBar;