import { Box, Text } from "@chakra-ui/react";
import PropTypes from "prop-types";

export const IndividualPost = ({ author, title, content, createdOn }) => {
  return (
    <Box
      p={6}
      borderWidth={1}
      borderRadius="lg"
      boxShadow="lg"
      mx="1"
      my={6}
      bg="gray.800"
      color="white"
    >
      <Text as="span" fontWeight="semibold" color="teal.300" fontSize="sm">
        {author}
      </Text>
      <Text fontSize="xl" fontWeight="bold" mt={2} mb={3} color="white">
        {title}
      </Text>
      <Text fontSize="md" color="gray.300" mb={3}>
        {content ? content.slice(0, 100) : "No content available"}...
      </Text>
      <Text fontSize="sm" color="gray.400">
        on {new Date(createdOn).toLocaleDateString()}
      </Text>
    </Box>
  );
};

IndividualPost.propTypes = {
  author: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  content: PropTypes.string,
  createdOn: PropTypes.string.isRequired,
};
