import './ProfileCard.css';
import DogImage from '/src/assets/dog.jpg';

const ProfileCard = () => {
  return (
    <div>
      <img src={DogImage} alt="profile" className="profile_image" />
      <p className="profile_name">뭉이</p>
      <p>한국항공대학교</p>
    </div>
  );
};

export default ProfileCard;
