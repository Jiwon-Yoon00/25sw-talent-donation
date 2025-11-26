import './ProfileCard.css';



const ProfileCard = () => {
  return (
    <div>
      <img src='/dog.jpg' alt="profile" className="profile_image" />
      <p className="profile_name">뭉이</p>
      <p>한국항공대학교</p>
    </div>
  );
};

export default ProfileCard;
