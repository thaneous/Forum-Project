import { db } from "../config/firebase-config";
import { ref, get } from "firebase/database";
export const getAllUserComments = async (userHandle) => {
  const snapshot = await get(ref(db, `users/${userHandle}/comments`));

  if (!snapshot.exists()) {
    return [];
  }

  const comments = Object.values(snapshot.val());
  return comments;
};

export const getAllUserPost = async (handle) => {
  try {
    const snapshot = await get(ref(db, `users/${handle}/posts`));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data);
    } else {
      console.error("No posts data found for handle:", handle);
      return [];
    }
  } catch (error) {
    console.error("Error fetching posts data:", error);
    throw error;
  }
};
