import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Heading,
  Text,
  VStack,
  Spinner,
  Flex,
} from "@chakra-ui/react";
import { IndividualPost } from "../../components/IndividualPost/IndividualPost";
import { getAllUserComments } from "../../services/profile.service";
import { getUserByHandle } from "../../services/users.service";
import { getPostData } from "../../services/post.service";

const Comments = () => {
  const { handle } = useParams();
  const [comments, setComments] = useState([]);
  const [posts, setPosts] = useState({});
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
    const fetchComments = async () => {
      try {
        const commentsData = await getAllUserComments(handle);
        setComments(commentsData);
        const commentsMap = commentsData.reduce((acc, comment) => {
          acc[comment.postId] = comment;
          return acc;
        }, {});
        setPosts(commentsMap);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, [handle]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (comments.length === 0) return;

      const fetchedPosts = {};
      for (const comment of comments) {
        const data = await getPostData(comment.postId);
        if (data) {
          fetchedPosts[comment.postId] = data;
        } else {
          console.warn(`Post with ID ${comment.postId} not found.`);
        }
      }
      setPosts(fetchedPosts);
    };

    fetchPosts();
  }, [comments]);

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
      <Heading mb={4}>{profileData.handle} Comments</Heading>
      {comments.length > 0 ? (
        <VStack spacing={4} align="stretch">
          <Flex
            wrap="wrap"
            justifyContent="center"
            alignItems="center"
            flexDirection="row"
            w="70%"
            minW="100%"
            gap={4}
          >
            {comments.map((comment, index) => {
              const post = posts[comment.postId];
              return (
                <Box
                  display="flex"
                  wrap="wrap"
                  justifyContent="center"
                  alignItems="center"
                  flexDirection="row"
                  key={comment.id || `comment-${index}`}
                  minW="80%"
                  border="1px solid white"
                  p={5}
                  borderRadius="md"
                  boxShadow="lg"
                  cursor="pointer"
                  bg="gray.800"
                  color="white"
                  _hover={{
                    transform: "scale(1.02)",
                    transition: "transform 0.2s",
                  }}
                >
                  <Box onClick={() => handlePostClick(comment.postId)} w="100%">
                    {post ? (
                      <IndividualPost
                        author={post.author}
                        title={post.title}
                        content={post.content}
                        createdOn={post.createdOn}
                      />
                    ) : (
                      <Spinner />
                    )}
                    <Text
                      fontSize="xl"
                      mt={2}
                      p={2}
                      borderRadius="md"
                      bg="gray.700"
                    >
                      <Text as="span" fontWeight="bold" color="cyan.300">
                        {comment.author}
                      </Text>
                      <Text as="span" color="gray.200" fontStyle="italic">
                        {`: ${comment.content}`}
                      </Text>
                    </Text>
                  </Box>
                </Box>
              );
            })}
          </Flex>
        </VStack>
      ) : (
        <Text>No comments yet.</Text>
      )}
    </Container>
  );
};

export default Comments;
