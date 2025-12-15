import { ref, push, update, get, set } from "firebase/database";
import { db } from "../config/firebase-config";
import { isAdmin } from "./users.service";

/**
 * Creates a new post after checking user's blocked status
 *
 * @param {string} author - The author of the post.
 * @param {string} title - The title of the post.
 * @param {string} content - The content of the post.
 * @param {string} uid - The unique identifier of the user.
 * @returns {Promise<void>} A promise that resolves when the post is created and updated with its ID.
 *
 * @author Nikolay Kodzheykov
 */
export const createpost = async (author, title, content, uid, userHandle) => {
  try {
    const post = {
      author,
      title,
      content,
      uid,
      createdOn: new Date().toString(),
    };

    const result = await push(ref(db, "posts"), post);
    await update(ref(db, `posts/${result.key}`), { id: result.key });
    await update(ref(db, `users/${userHandle}/posts/${result.key}`), {
      id: result.key,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

/**
 * Fetches post data from the database based on the provided post ID.
 *
 * @param {string} id - The ID of the post to retrieve.
 * @returns {Promise<Object|null>} A promise that resolves to an object containing the post data if it exists, or null if it does not.
 * @property {string} username - The author of the post.
 * @property {string} title - The title of the post.
 * @property {string} content - The content of the post.
 * @property {string} createdOn - The creation date of the post.
 *
 * @author Nikolay Kodzheykov
 */

export const getPostData = async (postId) => {
  try {
    const snapshot = await get(ref(db, `posts/${postId}`));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return data;
    } else {
      console.error("No post data found for postId:", postId);
      return null;
    }
  } catch (error) {
    console.error("Error fetching post data:", error);
    throw error;
  }
};

/**
 * Updates post data in the database based on the provided post ID, title, and content.
 *
 * @param {string} postId - The ID of the post to update.
 * @param {string} title - The new title of the post.
 * @param {string} content - The new content of the post.
 * @returns {Promise<void>} A promise that resolves when the post is updated.
 *
 * @throws Will throw an error if there is an issue updating the post data.
 */
export const updatePostData = async (postId, title, content) => {
  try {
    await update(ref(db, `posts/${postId}`), {
      title,
      content,
      updatedOn: new Date().toString(),
    });
  } catch (error) {
    console.error("Error updating post data:", error);
    throw error;
  }
};

/**
 * Fetches all posts from the database and optionally filters them by a search term.
 *
 * @param {string} [search=""] - The search term to filter posts by title. If empty, all posts are returned.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of post objects.
 *
 * @author Martin Mesechkov
 */
export const getAllPosts = async (search = "") => {
  const snapshot = await get(ref(db, "posts"));

  if (!snapshot.exists()) {
    return [];
  }

  const posts = Object.values(snapshot.val());

  if (search) {
    return posts.filter((post) =>
      post.title.toLowerCase().includes(search.toLowerCase())
    );
  }

  return posts;
};

/**
 * Fetches the most recent posts from the database.
 *
 * @async
 * @function getMostRecentPosts
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of the most recent posts.
 * @throws Will throw an error if there is an issue fetching the posts.
 *
 * @author Martin Mesechkov
 */
export const getMostRecentPosts = async (elementsCount = -1) => {
  try {
    const snapshot = await get(ref(db, "posts"));
    if (!snapshot.exists()) {
      return [];
    }

    let posts = Object.values(snapshot.val());

    posts.sort((a, b) => {
      const aDate = new Date(a.createdOn);
      const bDate = new Date(b.createdOn);
      return bDate - aDate;
    });

    return posts.slice(0, elementsCount);
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
};

/**
 * Fetches the oldest posts from the database.
 *
 * @returns {Promise<Array>} A promise that resolves to an array of posts sorted by creation date in ascending order.
 * @throws Will throw an error if there is an issue fetching the posts.
 *
 * @author Martin Mesechkov
 */
export const getOldestPosts = async () => {
  try {
    const snapshot = await get(ref(db, "posts"));
    if (!snapshot.exists()) {
      return [];
    }

    let posts = Object.values(snapshot.val());

    posts.sort((a, b) => {
      const aDate = new Date(a.createdOn);
      const bDate = new Date(b.createdOn);
      return aDate - bDate;
    });

    return posts.slice(0);
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
};

/**
 * Fetches the posts with the most comments from the database.
 *
 * @async
 * @function getMostCommentPosts
 * @returns {Promise<Array>} A promise that resolves to an array of the top 10 posts with the most comments.
 * @throws Will throw an error if there is an issue fetching the posts from the database.
 *
 * @author Martin Mesechkov
 */
export const getMostCommentPosts = async (elementsCount = -1) => {
  try {
    const snapshot = await get(ref(db, "posts"));
    if (!snapshot.exists()) {
      return [];
    }

    let posts = Object.values(snapshot.val());

    posts.sort((a, b) => {
      const aComments = a.comments ? Object.keys(a.comments).length : 0;
      const bComments = b.comments ? Object.keys(b.comments).length : 0;
      return bComments - aComments;
    });

    return posts.slice(0, elementsCount);
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
};

/**
 * Fetches posts from the database and returns them sorted by the number of comments in ascending order.
 *
 * @returns {Promise<Array>} A promise that resolves to an array of posts sorted by the number of comments in ascending order.
 * @throws Will throw an error if there is an issue fetching the posts from the database.
 *
 * @author Martin Mesechkov
 */
export const getLeastCommentPosts = async () => {
  try {
    const snapshot = await get(ref(db, "posts"));
    if (!snapshot.exists()) {
      return [];
    }

    let posts = Object.values(snapshot.val());

    posts.sort((a, b) => {
      const aComments = a.comments ? Object.keys(a.comments).length : 0;
      const bComments = b.comments ? Object.keys(b.comments).length : 0;
      return aComments - bComments;
    });

    return posts.slice(0);
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
};

/**
 * Delete a post (admin only)
 * @param {string} adminUid - The UID of the admin deleting the post
 * @param {string} postId - The ID of the post to delete
 * @returns {Promise<boolean>}
 * @author Atanas Zaykov
 */
export const deletePost = async (adminUid, postId) => {
  try {
    const isAdminUser = await isAdmin(adminUid);
    if (!isAdminUser) {
      throw new Error("Unauthorized: Only admins can delete posts");
    }

    const postRef = ref(db, `posts/${postId}`);
    const snapshot = await get(postRef);

    if (!snapshot.exists()) {
      throw new Error("Post not found");
    }

    // Store deletion record
    await set(ref(db, `deletedPosts/${postId}`), {
      ...snapshot.val(),
      deletedBy: adminUid,
      deletedOn: new Date().toISOString(),
    });

    // Remove the post
    await set(postRef, null);
    return true;
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
};

/**
 * Fetches the most voted posts from the database.
 *
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of posts sorted by votes in descending order.
 * @throws Will throw an error if there is an issue fetching the posts.
 *
 * @author Martin Mesechkov
 */
export const getMostVoted = async () => {
  try {
    const snapshot = await get(ref(db, "posts"));
    if (!snapshot.exists()) {
      return [];
    }

    let posts = Object.values(snapshot.val());

    const result = posts.map((post) => {
      const upVotes = post.votes ? post.votes.upVotesCounter : 0;
      const downVotes = post.votes ? post.votes.downVotesCounter : 0;
      return {
        ...post,
        votes: upVotes - downVotes,
      };
    });

    return result.sort((a, b) => b.votes - a.votes);
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
};

/**
 * Fetches posts from the database and returns them sorted by the least number of votes.
 *
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of post objects sorted by the least number of votes.
 * @throws Will throw an error if there is an issue fetching the posts from the database.
 * 
 * @author Martin Mesechkov
 */
export const getLeastVoted = async () => {
  try {
    const snapshot = await get(ref(db, "posts"));
    if (!snapshot.exists()) {
      return [];
    }

    let posts = Object.values(snapshot.val());

    const result = posts.map((post) => {
      const upVotes = post.votes ? post.votes.upVotesCounter : 0;
      const downVotes = post.votes ? post.votes.downVotesCounter : 0;
      return {
        ...post,
        votes: upVotes - downVotes,
      };
    });

    return result.sort((a, b) => a.votes - b.votes);
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
};

/**
 * Deletes a post for a single user.
 *
 * @param {string} postId - The ID of the post to delete.
 * @param {string} userHandle - The handle of the user who owns the post.
 * @returns {Promise<boolean>} - A promise that resolves to true if the post was successfully deleted.
 * @throws {Error} - Throws an error if the post or user is not found, or if there is an issue deleting the post.
 * 
 * @author Martin Mesechkov
 */
export const deletePostForSinglePost = async (postId, userHandle) => {
  try {
    const postRef = ref(db, `posts/${postId}`);
    const userRef = ref(db, `users/${userHandle}/posts/${postId}`);
    const snapshot = await get(postRef);
    const snapshotUser = await get(userRef);

    if (!snapshot.exists()) {
      throw new Error("Post not found");
    }
    if (!snapshotUser.exists()) {
      throw new Error("User not found");
    }

    await set(postRef, null);
    await set(userRef, null);
    return true;
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
};
