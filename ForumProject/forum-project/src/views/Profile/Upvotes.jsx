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
import { getUserByHandle } from "../../services/users.service";
import { ref, get } from "firebase/database";
import { db } from "../../config/firebase-config";
import { getPostData } from "../../services/post.service";
import Vote from "../Vote/Vote";

const Upvotes = () => {
  const { handle } = useParams();
  const [upvotedPosts, setUpvotedPosts] = useState([]);
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
          console.error("User data not found");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [handle]);

  useEffect(() => {
    const fetchUpvotedPosts = async () => {
      try {
        const snapshot = await get(ref(db, `users/${handle}/upvotes`));
        if (snapshot.exists()) {
          const upvotedPostIds = Object.keys(snapshot.val());
          setUpvotedPosts(upvotedPostIds);
        }
      } catch (error) {
        console.error("Error fetching upvoted posts:", error);
      }
    };

    fetchUpvotedPosts();
  }, [handle]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (upvotedPosts.length === 0) return;

      const fetchedPosts = {};
      for (const postId of upvotedPosts) {
        const data = await getPostData(postId);
        if (data) {
          fetchedPosts[postId] = data;
        } else {
          console.warn(`Post with ID ${postId} not found.`);
        }
      }
      setPosts(fetchedPosts);
    };

    fetchPosts();
  }, [upvotedPosts]);

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
      <Heading mb={4}>{profileData.handle} Upvoted Posts</Heading>
      {upvotedPosts.length > 0 ? (
        <VStack spacing={4} align="stretch">
          {upvotedPosts.map((postId, index) => {
            const post = posts[postId];
            return (
              <Box
                key={postId || `upvote-${index}`}
                p={4}
                borderWidth="1px"
                borderRadius="lg"
                shadow="sm"
                bg="gray.800"
                color="white"
                display="flex"
                flexDirection="row"
                alignItems="center"
                gap={4}
                w="100%"
                _hover={{
                  transform: "scale(1.02)",
                  transition: "transform 0.2s",
                  shadow: "md",
                }}
                onClick={() => handlePostClick(postId)}
              >
                {/* Vote Component */}
                <Box>
                  <Vote idPost={postId} />
                </Box>

                {/* Post Content */}
                <Box w="70%" flex="1" onClick={() => handlePostClick(postId)}>
                  {" "}
                  {/* Makes the post take remaining space */}
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
                </Box>
              </Box>
            );
          })}
        </VStack>
      ) : (
        <Text>No upvoted posts yet.</Text>
      )}
    </Container>
  );
};
export default Upvotes;
