import { useState, useEffect, useContext } from "react";
import {
  BiUpvote,
  BiSolidUpvote,
  BiDownvote,
  BiSolidDownvote,
} from "react-icons/bi";
import { IconButton, Box, Text } from "@chakra-ui/react";
import { AppContext } from "../../store/app.context";
import { setVote, fetchVotes } from "../../services/vote.service";

const Vote = ({ idPost }) => {
  const { userData, openLogin } = useContext(AppContext);
  const [voteCount, setVoteCount] = useState(0);
  const [userVote, setUserVote] = useState(0);

  useEffect(() => {
    const loadVotes = async () => {
      if (!userData?.uid) return;
      const { upVotes, downVotes, userVote } = await fetchVotes(
        idPost,
        userData.uid
      );
      setVoteCount(upVotes - downVotes);
      setUserVote(userVote);
      localStorage.setItem(`vote-${idPost}-${userData.uid}`, userVote);
    };
    loadVotes();
  }, [idPost, userData]);

  const handleVote = async (type) => {
    if (!userData) {
      openLogin();
      return;
    }

    let newVote = userVote;
    if (type === "upvote") {
      newVote = userVote === 1 ? 0 : 1;
    } else if (type === "downvote") {
      newVote = userVote === -1 ? 0 : -1;
    }

    setUserVote(newVote);
    setVoteCount((prevCount) =>
      type === "upvote"
        ? newVote === 1
          ? prevCount + 1
          : prevCount - 1
        : newVote === -1
        ? prevCount - 1
        : prevCount + 1
    );

    const success = await setVote(idPost, userData.handle, type);
    if (success) {
      localStorage.setItem(`vote-${idPost}-${userData.uid}`, newVote);
    } else {
      setUserVote(userVote);
      setVoteCount((prevCount) =>
        type === "upvote"
          ? userVote === 1
            ? prevCount - 1
            : prevCount + 1
          : userVote === -1
          ? prevCount + 1
          : prevCount - 1
      );
    }
  };

  // Load vote from local storage on component mount
  useEffect(() => {
    if (userData?.uid) {
      const storedVote = localStorage.getItem(`vote-${idPost}-${userData.uid}`);
      if (storedVote !== null) {
        setUserVote(parseInt(storedVote, 10));
      }
    }
  }, [idPost, userData]);

  return (
    <Box
      bg="gray.700"
      w="40px"
      borderRadius="md"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      p={2}
      boxShadow="md"
      _hover={{ bg: "gray.600", transition: "all 0.2s ease-in-out" }}
    >
      <IconButton
        size="sm"
        onClick={() => handleVote("upvote")}
        colorScheme={userVote === 1 ? "green" : "gray"}
        icon={userVote === 1 ? <BiSolidUpvote /> : <BiUpvote />}
        variant="ghost"
      />

      <Text fontSize="sm" color="white" fontWeight="bold" mt={1} mb={1}>
        {voteCount}
      </Text>

      <IconButton
        size="sm"
        onClick={() => handleVote("downvote")}
        colorScheme={userVote === -1 ? "red" : "gray"}
        icon={userVote === -1 ? <BiSolidDownvote /> : <BiDownvote />}
        variant="ghost"
      />
    </Box>
  );
};

export default Vote;
