import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../../store/app.context";
import {
  Container,
  Box,
  Heading,
  Text,
  VStack,
  Spinner,
} from "@chakra-ui/react";
import { IndividualPost } from "../../components/IndividualPost/IndividualPost";
import { getPostData } from "../../services/post.service";
import { getUserByHandle } from "../../services/users.service";

const Bookmarks = () => {
  const { handle } = useParams();
  const { userData } = useContext(AppContext);
  const [bookmarks, setBookmarks] = useState([]);
  const [posts, setPosts] = useState({});
  const [profileData, setProfileData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserByHandle(handle);
        if (data) {
          setProfileData(data);
          setBookmarks(data.bookmarks || []);
        } else {
          console.error("User data not found");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [handle]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (bookmarks.length === 0) {
        return;
      }

      const fetchedPosts = {};
      for (const postId of bookmarks) {
        const data = await getPostData(postId);
        if (data) {
          fetchedPosts[postId] = data;
        }
      }
      setPosts(fetchedPosts);
    };

    fetchPosts();
  }, [bookmarks]);

  const handlePostClick = (id) => {
    navigate(`/post/${id}`, { state: { idPost: id } });
  };

  if (!profileData) {
    return (
      <Container>
        <Text fontSize="2xl">Loading profile...</Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={6}>
      <Heading mb={4}>{profileData.handle} Bookmarked Posts</Heading>
      {bookmarks.length > 0 ? (
        <VStack spacing={4} align="stretch">
          {bookmarks.map((postId, index) => {
            const post = posts[postId];
            return (
              <Box
                key={postId || `bookmark-${index}`}
                p={4}
                borderWidth="1px"
                borderRadius="lg"
                shadow="sm"
                bg="gray.800"
                color="white"
                _hover={{
                  transform: "scale(1.02)",
                  transition: "transform 0.2s",
                  shadow: "md",
                }}
                onClick={() => handlePostClick(postId)}
              >
                {post &&
                post.author &&
                post.title &&
                post.content &&
                post.createdOn ? (
                  <>
                    <IndividualPost
                      author={post.author}
                      title={post.title}
                      content={post.content}
                      createdOn={post.createdOn}
                    />
                  </>
                ) : (
                  <Spinner />
                )}
              </Box>
            );
          })}
        </VStack>
      ) : (
        <Text>No bookmarks yet.</Text>
      )}
    </Container>
  );
};

export default Bookmarks;
