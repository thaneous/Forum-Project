import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../store/app.context";
import { useParams, Route, Routes } from "react-router-dom";
import { getUserByHandle } from "../../services/users.service";
import Bookmarks from "./Bookmarks";
import { Container, Box, Text } from "@chakra-ui/react";
import Comments from "./Comments";
import Posts from "./Post";
import Upvotes from "./Upvotes";
import Downvotes from "./Downvotes";
import ProfileTabs from "./ProfileTabs";

const Profile = () => {
  const { handle } = useParams();
  const { user } = useContext(AppContext);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const data = await getUserByHandle(handle);
      setUserData(data);
    };
    fetchUserData();
  }, [handle]);

  if (!userData) {
    return (
      <Container>
        <Text fontSize="2xl">Loading profile...</Text>
      </Container>
    );
  }

  return (
    <Container>
      <Box>
        <Text fontSize="3xl">
          {userData?.firstName} {userData?.lastName}
        </Text>
        <Text fontSize="1xl">@{userData?.handle}</Text>
      </Box>

      <ProfileTabs userData={userData} />

      <Routes>
        <Route path="posts" element={<Posts />} />
        <Route path="comments" element={<Comments />} />
        <Route path="bookmarks" element={<Bookmarks />} />
        <Route path="upvotes" element={<Upvotes />} />
        <Route path="downvotes" element={<Downvotes />} />
      </Routes>
    </Container>
  );
};

export default Profile;
