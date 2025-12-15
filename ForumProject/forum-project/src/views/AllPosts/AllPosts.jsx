import { useState, useEffect } from "react";
import { Box, Text, Select, Spinner, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { IndividualPost } from "../../components/IndividualPost/IndividualPost";
import {
  getMostCommentPosts,
  getMostRecentPosts,
  getLeastCommentPosts,
  getOldestPosts,
  getMostVoted,
  getLeastVoted
} from "../../services/post.service";
import Vote from "../Vote/Vote";

export default function AllPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [mostCommentPosts, setMostCommentPosts] = useState([]);
  const [mostRecentPosts, setMostRecentPosts] = useState([]);
  const [leastCommentPosts, setLeastCommentPosts] = useState([]);
  const [oldestPosts, setOldestPosts] = useState([]);
  const [mostVotedPosts, setMostVotedPosts] = useState([]);
  const [leastVotedPosts, setLeastVotedPosts] = useState([]);
  const [selectedSort, setSelectedSort] = useState("mostRecent");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          topComments,
          recentPosts,
          leastComments,
          oldestPosts,
          mostVoted,
          leastVoted,
        ] = await Promise.all([
          getMostCommentPosts(-1),
          getMostRecentPosts(-1),
          getLeastCommentPosts(),
          getOldestPosts(),
          getMostVoted(),
          getLeastVoted(),
        ]);
        setPosts(recentPosts);
        setMostCommentPosts(topComments);
        setMostRecentPosts(recentPosts);
        setLeastCommentPosts(leastComments);
        setOldestPosts(oldestPosts);
        setMostVotedPosts(mostVoted);
        setLeastVotedPosts(leastVoted);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSortChange = (sortType) => {
    setSelectedSort(sortType);
    if (sortType === "mostComment") {
      setPosts(mostCommentPosts);
    } else if (sortType === "mostRecent") {
      setPosts(mostRecentPosts);
    } else if (sortType === "leastComment") {
      setPosts(leastCommentPosts);
    } else if (sortType === "oldestPosts") {
      setPosts(oldestPosts);
    } else if (sortType === "mostVoted") {
      setPosts(mostVotedPosts);
    } else if (sortType === "leastVoted") {
      setPosts(leastVotedPosts);
    }
  };

  const handlePostClick = (id) => {
    navigate(`/post/${id}`, { state: { idPost: id } });
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        width="100%"
        height="50vh"
      >
        <Spinner size="xl" color="blue.500" />
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      w="100%"
      p={4}
    >
      {/* Sorting Dropdown */}
      <Select
        value={selectedSort}
        onChange={(e) => handleSortChange(e.target.value)}
        w={{ base: "80%", md: "40%", lg: "30%" }} // Responsive width
        bg="gray.700"
        color="white"
        borderRadius="md"
        border="1px solid"
        borderColor="gray.600"
        px={3}
        py={2}
        _hover={{ bg: "gray.600" }}
        _focus={{ borderColor: "cyan.300", boxShadow: "0 0 5px cyan" }}
      >
        <option
          style={{ background: "#2D3748", color: "white" }}
          value="mostRecent"
        >
          Latest Posts
        </option>
        <option
          style={{ background: "#2D3748", color: "white" }}
          value="oldestPosts"
        >
          Oldest Posts
        </option>
        <option
          style={{ background: "#2D3748", color: "white" }}
          value="mostComment"
        >
          Most Commented
        </option>
        <option
          style={{ background: "#2D3748", color: "white" }}
          value="leastComment"
        >
          Least Commented
        </option>
        <option
          style={{ background: "#2D3748", color: "white" }}
          value="mostVoted"
        >
          Most Voted
        </option>
        <option
          style={{ background: "#2D3748", color: "white" }}
          value="leastVoted"
        >
          Least Voted
        </option>
      </Select>

      {posts.length > 0 ? (
        <VStack spacing={4} w="80%">
          {posts.map((p) => (
            <Box
              key={p.id}
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
              w="80%"
              _hover={{
                transform: "scale(1.02)",
                transition: "transform 0.2s",
                shadow: "md",
              }}
            >
              {/* Vote Component */}
              <Box>
                <Vote idPost={p.id} />
              </Box>

              {/* Post Content */}
              <Box w="70%" flex="1" onClick={() => handlePostClick(p.id)}>
                <IndividualPost
                  author={p.author}
                  title={p.title}
                  content={p.content}
                  createdOn={p.createdOn}
                />
              </Box>
            </Box>
          ))}
        </VStack>
      ) : (
        <Text color="white" fontSize="lg">
          No posts found!
        </Text>
      )}
    </Box>
  );
}
