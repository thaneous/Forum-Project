import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Heading,
  Text,
  VStack,
  Spinner,
} from "@chakra-ui/react";
import { IndividualPost } from "../../components/IndividualPost/IndividualPost";
import { getAllUserPost } from "../../services/profile.service";
import { getUserByHandle } from "../../services/users.service";
import { getPostData } from "../../services/post.service";

const Posts = () => {
  const { handle } = useParams();
  const [posts, setPosts] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserByHandle(handle);
        if (data) {
          setProfileData(data);
        } else {
          console.error("User data not found for handle:", handle); // Log the handle value if user data is not found
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [handle]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postIds = await getAllUserPost(handle);
        const fetchedPosts = await Promise.all(
          postIds.map(async (postId) => {
            const postData = await getPostData(postId);
            return { id: postId, ...postData };
          })
        );
        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
        alert(error.message);
      }
    };

    fetchPosts();
  }, [handle]);

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
      <Heading mb={4}>{profileData.handle} Posts</Heading>
      {posts.length > 0 ? (
        <VStack spacing={4} align="stretch">
          {posts
            .slice()
            .reverse()
            .map((post, index) => (
              <Box
                key={post.id || `post-${index}`}
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
                onClick={() => handlePostClick(post.id)}
              >
                <IndividualPost
                  author={post.author}
                  title={post.title}
                  content={post.content}
                  createdOn={post.createdOn}
                />
              </Box>
            ))}
        </VStack>
      ) : (
        <Text>No posts yet.</Text>
      )}
    </Container>
  );
};

export default Posts;
