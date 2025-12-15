import {
  getMostCommentPosts,
  getMostRecentPosts,
} from "../../services/post.service";
import { useEffect, useState } from "react";
import { Box, Heading, Text, Spinner } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { IndividualPost } from "../IndividualPost/IndividualPost";
export default function HomeAnonymous() {
  const [mostCommentPosts, setMostCommentPosts] = useState([]);
  const [mostResentPosts, setMostResentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topComments, recentPosts] = await Promise.all([
          getMostCommentPosts(10),
          getMostRecentPosts(10),
        ]);
        setMostCommentPosts(topComments);
        setMostResentPosts(recentPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <Box
        display="flex"
        flexDirection={{ base: "column", md: "row" }}
        p={5}
        flexWrap="wrap"
        justifyContent="center" 
      >
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            width="100%"
            height="50vh"
          >
            <Spinner size="xl" color="blue.500" />
          </Box>
        ) : (
          <Box
            display="flex"
            flexDirection={{ base: "column", md: "row" }}
            p={5}
            flexWrap="wrap"
          >
            <Box
              flex={1}
              p={5}
              maxW={{ base: "100%", md: "50%" }}
              maxH={{ base: "100%", md: "50%" }}
            >
              <Heading as="h1" size="xl" mb={5}>
                Most commented posts
              </Heading>
              {mostCommentPosts.map((post) => (
                <Box key={post.id}  onClick={() => navigate("/login")} className="boxSinglePost">
                <IndividualPost author={post.author} title={post.title} content={post.content} createdOn={post.createdOn}/>
                  <Text mt={2} color={"white"} fontWeight="bold">
                    Comments:{" "}
                    {post.comments ? Object.keys(post.comments).length : 0}
                  </Text>
                </Box>
              ))}
            </Box>
            <Box
              flex={1}
              p={5}
              maxW={{ base: "100%", md: "50%" }}
              maxH={{ base: "100%", md: "50%" }}
            >
              <Heading as="h1" size="xl" mb={5}>
                Most recent posts
              </Heading>
              {mostResentPosts.map((post) => (
                <Box
                  key={post.id}
                  onClick={() => navigate("/login")}
                  className="boxSinglePost"
                >
                 <IndividualPost author={post.author} title={post.title} content={post.content} createdOn={post.createdOn}/>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
}
