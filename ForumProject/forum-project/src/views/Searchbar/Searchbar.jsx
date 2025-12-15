import { useState } from "react";
import { Box, Input, Spacer } from "@chakra-ui/react";
import { ref, get, getDatabase } from "firebase/database";
import { useNavigate } from "react-router-dom";

/**
 * Search component for searching posts.
 * @component
 * @example
 * return (
 *   <Search />
 * )
 * @returns {JSX.Element} The Search component.
 * @version 1.0.0
 * @since 2025-02-22
 * @author
 * Nikolay Kodzeykov
 */
const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  /**
   * Handles the search operation.
   * Fetches posts from the database and filters them based on the search query.
   * Navigates to the search results page with the filtered results.
   * @async
   * @function
   * @returns {Promise<void>}
   */
  const handleSearch = async (query) => {
    if (!query.trim()) return;

    const db = getDatabase();
    const postsRef = ref(db, "posts");

    try {
      const snapshot = await get(postsRef);
      if (snapshot.exists()) {
        const allPosts = Object.entries(snapshot.val()).map(([id, post]) => ({
          id,
          title: post.title,
          author: post.author,
          content: post.content,
          createdOn: post.createdOn,
        }));

        // Local filtering (case-insensitive)
        const filteredResults = allPosts.filter((post) =>
          post.title.toLowerCase().includes(query.toLowerCase())
        );

        navigate("/search", {
          state: { searchResults: filteredResults },
        });
      } else {
        navigate("/search", { state: { searchResults: [] } });
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    handleSearch(query);
  };

  return (
    <>
      {/* Search Bar */}
      <Box w="50%" display="flex" mb={4}>
        <Input
          color="white"
          placeholder="Search Title..."
          value={searchQuery}
          type="text"
          onChange={handleInputChange}
          _placeholder={{ color: "white" }}
        />
      </Box>
      <Spacer />{" "}
    </>
  );
};

export default Search;
