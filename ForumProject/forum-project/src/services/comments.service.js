import { db } from "../config/firebase-config";
import { ref, push, update, get } from "firebase/database";
import { isUserBlocked } from "./users.service";

/**
 * Creates a new comment and updates after checking user's blocked status.
 *
 * @param {string} author - The author of the comment.
 * @param {string} content - The content of the comment.
 * @param {string} postId - The ID of the post to which the comment belongs.
 * @param {string} userId - The ID of the user who is creating the comment.
 * @returns {Promise<void>} A promise that resolves when the comment has been created and the records have been updated.
 *
 * @author Martin Mesechkov
 */
export const createComment = async (author, content, postId, userId) => {
  try {
    // Check if user is blocked before allowing comment creation
    const isBlocked = await isUserBlocked(author);
    if (isBlocked) {
      throw new Error("You are blocked from creating comments");
    }

    const commentForUsers = {
      author,
      content,
      postId,
      createdOn: new Date().toString(),
    };

    const commentForPosts = {
      author,
      content,
      userId,
      createdOn: new Date().toString(),
    };

    const result = await push(
      ref(db, `users/${author}/comments`),
      commentForUsers
    );
    const id = result.key;

    await update(ref(db, `posts/${postId}/comments/${id}`), commentForPosts);
    await update(ref(db, `posts/${postId}/comments/${id}`), { id });
    await update(ref(db, `users/${author}/comments/${id}`), { id });
  } catch (error) {
    console.error("Error creating comment:", error);
    throw error;
  }
};

/**
 * Fetches all comments for a given post.
 *
 * @param {string} postId - The ID of the post to fetch comments for.
 * @returns {Promise<Array>} A promise that resolves to an array of comments.
 *
 * @author Martin Mesechkov
 */
export const getAllComments = async (postId) => {
  const snapshot = await get(ref(db, `posts/${postId}/comments`));

  if (!snapshot.exists()) {
    return [];
  }

  const comments = Object.values(snapshot.val());
  return comments;
};
