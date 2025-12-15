import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Text } from "@chakra-ui/react";
import { IndividualPost } from "../../components/IndividualPost/IndividualPost";

/**
 * SearchPage component that displays search results and handles post navigation.
 *
 * @component
 * @returns {JSX.Element} The rendered component.
 * @version 1.0.0
 * @since 2025-02-22
 * @author
 * Nikolay Kodzheykov
 */
const SearchPage = () => {
  const [, setIdPost] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { searchResults } = location.state || { searchResults: [] };

  const handlePostClick = (id) => {
    setIdPost(id);
    navigate(`/post/${id}`, { state: { idPost: id } });
  };

  return (
    <>
      {/* Search Results */}
      <Box w="100%" display="flex" flexDirection="column" alignItems="center">
        {searchResults.length > 0 ? (
          searchResults.map((article) => (
            <Box
              w="65%"
              key={article.id}
              p={4}
              borderWidth="1px"
              borderRadius="md"
              mb={2}
              cursor="pointer"
              onClick={() => handlePostClick(article.id)}
            >
              <IndividualPost
                author={article.author}
                title={article.title}
                content={article.content}
                createdOn={article.createdOn}
              />
            </Box>
          ))
        ) : (
          <Text color="white">No results found.</Text>
        )}
      </Box>
    </>
  );
};

export default SearchPage;
