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
import { ref, get } from "firebase/database";
import { db } from "../../config/firebase-config";
import Vote from "../Vote/Vote";

const Downvotes = () => {
  const { handle } = useParams();
  const [downvotedPosts, setDownvotedPosts] = useState([]);
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
    const fetchDownvotedPosts = async () => {
      try {
        const snapshot = await get(ref(db, `users/${handle}/downvotes`));
        if (snapshot.exists()) {
          const downvotedPostIds = Object.keys(snapshot.val());
          setDownvotedPosts(downvotedPostIds);
        }
      } catch (error) {
        console.error("Error fetching downvoted posts:", error);
      }
    };

    fetchDownvotedPosts();
  }, [handle]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (downvotedPosts.length === 0) return;

      const fetchedPosts = {};
      for (const postId of downvotedPosts) {
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
  }, [downvotedPosts]);

  const handlePostClick = (id) => {
    navigate(`/post/${id}`, { state: { idPost: id } });
  };

  const handleDownvote = async (postId) => {
    const success = await setVote(postId, profileData.handle, "downvote");
    if (success) {
      alert("Downvoted successfully!");
    } else {
      alert("Failed to downvote.");
    }
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
      <Heading mb={4}>{profileData.handle} Downvoted Posts</Heading>
      {downvotedPosts.length > 0 ? (
        <VStack spacing={4} align="stretch">
          {downvotedPosts.map((postId, index) => {
            const post = posts[postId];
            return (
              <Box
                key={postId || `downvote-${index}`}
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
              >
                {/* Vote Component */}
                <Box>
                  <Vote idPost={postId} />
                </Box>

                {/* Post Content */}
                <Box w="70%" flex="1" onClick={() => handlePostClick(postId)}>
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
        <Text>No downvoted posts yet.</Text>
      )}
    </Container>
  );
};

export default Downvotes;
