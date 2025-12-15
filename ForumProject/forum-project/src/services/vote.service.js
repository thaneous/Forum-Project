import { ref, get, runTransaction, set, remove } from "firebase/database";
import { db } from "../config/firebase-config";

/**
 * Handles upvoting/downvoting logic.
 * Ensures users cannot vote both up and down at the same time.
 * @param {string} postId - The ID of the post.
 * @param {string} userId - The ID of the user voting.
 * @param {"upvote" | "downvote"} type - The type of vote.
 */
export const setVote = async (postId, userHandle, type) => {
  const postRef = ref(db, `posts/${postId}/votes`);
  const userUpvoteRef = ref(db, `users/${userHandle}/upvotes/${postId}`);
  const userDownvoteRef = ref(db, `users/${userHandle}/downvotes/${postId}`);

  try {
    await runTransaction(postRef, (votes) => {
      if (!votes) {
        votes = { upVotesCounter: 0, downVotesCounter: 0, voters: {} };
      }
      if (!votes.voters) votes.voters = {};

      let currentVote = votes.voters[userHandle] || 0;

      if (type === "upvote") {
        if (currentVote === 1) {
          // Remove upvote
          votes.upVotesCounter -= 1;
          currentVote = 0;
          remove(userUpvoteRef);
        } else {
          // Add upvote and remove downvote if it exists
          votes.upVotesCounter += 1;
          if (currentVote === -1) {
            votes.downVotesCounter -= 1;
            remove(userDownvoteRef);
          }
          currentVote = 1;
          set(userUpvoteRef, postId);
        }
      } else if (type === "downvote") {
        if (currentVote === -1) {
          // Remove downvote
          votes.downVotesCounter -= 1;
          currentVote = 0;
          remove(userDownvoteRef);
        } else {
          // Add downvote and remove upvote if it exists
          votes.downVotesCounter += 1;
          if (currentVote === 1) {
            votes.upVotesCounter -= 1;
            remove(userUpvoteRef);
          }
          currentVote = -1;
          set(userDownvoteRef, postId);
        }
      }

      votes.voters[userHandle] = currentVote;
      return votes;
    });

    return true;
  } catch (error) {
    console.error("Vote transaction failed:", error);
    return false;
  }
};

export const fetchVotes = async (postId, userId) => {
  const postRef = ref(db, `posts/${postId}/votes`);

  try {
    const snapshot = await get(postRef);
    if (!snapshot.exists()) {
      return { upVotes: 0, downVotes: 0, userVote: 0 };
    }

    const votes = snapshot.val();
    return {
      upVotes: votes.upVotesCounter || 0,
      downVotes: votes.downVotesCounter || 0,
      userVote: votes.voters?.[userId] || 0,
    };
  } catch (error) {
    console.error("Error fetching votes:", error);
    return { upVotes: 0, downVotes: 0, userVote: 0 };
  }
};
