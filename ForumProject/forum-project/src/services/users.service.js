import {
  get,
  ref,
  query,
  orderByChild,
  equalTo,
  set,
  update,
} from "firebase/database";
import { db } from "../config/firebase-config";

// Get user data by UID
export const getUserData = async (uid) => {
  const snapshot = await get(
    query(ref(db, "users"), orderByChild("uid"), equalTo(uid))
  );
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return null;
};

// Update user profile (without changing handle)
export const updateUserProfile = async (handle, updates) => {
  try {
    const userRef = ref(db, `users/${handle}`);
    // First, get the current user data
    const snapshot = await get(userRef);
    if (!snapshot.exists()) {
      throw new Error("User not found");
    }

    // Merge existing data with updates
    const updatedData = {
      ...snapshot.val(),
      ...updates,
      updatedOn: new Date().toISOString(),
    };

    // Update the database with merged data
    await set(userRef, updatedData);
    return true;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

// Get user by handle
export const getUserByHandle = async (handle) => {
  const snapshot = await get(ref(db, `users/${handle}`));
  return snapshot.exists() ? snapshot.val() : null;
};
// Get user by email
export const getUserByEmail = async (email) => {
  const snapshot = await get(ref(db, "users"));
  if (!snapshot.exists()) return null;

  const users = snapshot.val();
  return Object.values(users).find((user) => user.email === email) || null;
};
export const createUserHandle = async (
  handle,
  uid,
  email,
  firstName,
  lastName
) => {
  try {
    await set(ref(db, `users/${handle}`), {
      uid,
      email,
      handle,
      firstName, // Added default empty firstName
      lastName, // Added default empty lastName
      profilePhoto: "", // Added default empty profilePhoto
      createdOn: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error("Error creating user handle:", error);
    throw error;
  }
};

export const usersBookmarks = async (user, idPost) => {
  try {
    const userBookmarksRef = ref(db, `users/${user}/bookmarks`);

    const snapshot = await get(userBookmarksRef);
    const existingBookmarks = snapshot.exists() ? snapshot.val() : [];

    let updatedBookmarks;
    if (Array.isArray(existingBookmarks)) {
      if (existingBookmarks.includes(idPost)) {
        // Remove bookmark
        updatedBookmarks = existingBookmarks.filter(
          (bookmark) => bookmark !== idPost
        );
      } else {
        // Add bookmark
        updatedBookmarks = [...existingBookmarks, idPost];
      }
    } else {
      updatedBookmarks = [idPost];
    }

    await set(userBookmarksRef, updatedBookmarks);

    return updatedBookmarks;
  } catch (error) {
    console.error("Error updating user bookmarks:", error);
    throw error;
  }
};

/**
 * Migrates existing users
 */
export const migrateExistingUsers = async () => {
  try {
    /**
     * Retrieves a snapshot of the "users" reference from the database.
     *
     * @returns {Promise<DataSnapshot>} A promise that resolves to the snapshot of the "users" reference.
     *
     * @author Atanas Zaykov
     */
    const snapshot = await get(ref(db, "users"));
    if (snapshot.exists()) {
      const updates = {};
      Object.entries(snapshot.val()).forEach(([handle, userData]) => {
        if (
          !userData.firstName ||
          !userData.lastName ||
          !userData.profilePhoto
        ) {
          updates[`users/${handle}`] = {
            ...userData,
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            profilePhoto: userData.profilePhoto || "",
          };
        }
      });
      if (Object.keys(updates).length > 0) {
        await update(ref(db), updates);
      }
    }
  } catch (error) {
    console.error("Error migrating users:", error);
    throw error;
  }
};

/**
 * Checks if a user is an admin.
 *
 * @param {string} uid - The UID of the user to check.
 * @returns {Promise<boolean>} A promise that resolves to true if the user is an admin, otherwise false.
 *
 * @throws {Error} If there is an error while checking the admin status.
 *
 * @author
 * Atanas Zaykov
 */
export const isAdmin = async (uid) => {
  try {
    const snapshot = await get(
      query(ref(db, "users"), orderByChild("uid"), equalTo(uid))
    );
    if (snapshot.exists()) {
      const userData = Object.values(snapshot.val())[0];
      return userData.role === "admin";
    }
    return false;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};

// Assign admin role to a user
/**
 * Assigns the admin role to a specified user.
 *
 * @param {string} adminUid - The UID of the admin requesting the role assignment.
 * @param {string} targetHandle - The handle of the user to be assigned the admin role.
 * @returns {Promise<boolean>} - Returns true if the role assignment is successful.
 * @throws {Error} - Throws an error if the requesting user is not an admin or if the target user is not found.
 *
 * @author Atanas Zaykov
 */
export const assignAdminRole = async (adminUid, targetHandle) => {
  try {
    // First check if the requesting user is an admin
    const isRequestingUserAdmin = await isAdmin(adminUid);
    if (!isRequestingUserAdmin) {
      throw new Error("Unauthorized: Only admins can assign admin roles");
    }

    const userRef = ref(db, `users/${targetHandle}`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      throw new Error("User not found");
    }

    await update(userRef, {
      role: "admin",
      updatedOn: new Date().toISOString(),
      updatedBy: adminUid,
    });

    return true;
  } catch (error) {
    console.error("Error assigning admin role:", error);
    throw error;
  }
};

// Search users by handle, email, or name
/**
 * Searches for users based on a search term. Only admins are authorized to perform this search.
 *
 * @param {string} adminUid - The UID of the requesting admin user.
 * @param {string} searchTerm - The term to search for in user handles, emails, first names, and last names.
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of user objects matching the search term.
 * @throws {Error} - Throws an error if the requesting user is not an admin or if there is an issue with the search.
 *
 * @author Atanas Zaykov
 */
export const searchUsers = async (adminUid, searchTerm) => {
  try {
    // First check if the requesting user is an admin
    const isRequestingUserAdmin = await isAdmin(adminUid);
    if (!isRequestingUserAdmin) {
      throw new Error("Unauthorized: Only admins can search users");
    }

    const snapshot = await get(ref(db, "users"));
    if (!snapshot.exists()) {
      return [];
    }

    const users = Object.entries(snapshot.val()).map(([handle, userData]) => ({
      handle,
      ...userData,
    }));

    // Filter users based on search term
    const searchTermLower = searchTerm.toLowerCase();
    return users.filter(
      (user) =>
        (user.handle && user.handle.toLowerCase().includes(searchTermLower)) ||
        (user.email && user.email.toLowerCase().includes(searchTermLower)) ||
        (user.firstName &&
          user.firstName.toLowerCase().includes(searchTermLower)) ||
        (user.lastName && user.lastName.toLowerCase().includes(searchTermLower))
    );
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
};

// Get all users (admin only)
/**
 * Retrieves all users from the database if the requesting user is an admin.
 *
 * @async
 * @function getAllUsers
 * @param {string} adminUid - The UID of the requesting user.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of user objects.
 * @throws {Error} Throws an error if the requesting user is not an admin or if there is an issue retrieving users.
 *
 * @author Atanas Zaykov
 */
export const getAllUsers = async (adminUid) => {
  try {
    // First check if the requesting user is an admin
    const isRequestingUserAdmin = await isAdmin(adminUid);
    if (!isRequestingUserAdmin) {
      throw new Error("Unauthorized: Only admins can view all users");
    }

    const snapshot = await get(ref(db, "users"));
    if (!snapshot.exists()) {
      return [];
    }

    return Object.entries(snapshot.val()).map(([handle, userData]) => ({
      handle,
      ...userData,
    }));
  } catch (error) {
    console.error("Error getting all users:", error);
    throw error;
  }
};

// Remove admin role
/**
 * Removes the admin role from a user.
 *
 * @param {string} adminUid - The UID of the admin requesting the role removal.
 * @param {string} targetHandle - The handle of the user whose admin role is to be removed.
 * @returns {Promise<boolean>} - Returns true if the admin role was successfully removed.
 * @throws {Error} - Throws an error if the requesting user is not an admin, the target user is not found, or if there is an issue with the database update.
 *
 * @author Atanas Zaykov
 */
export const removeAdminRole = async (adminUid, targetHandle) => {
  try {
    // First check if the requesting user is an admin
    const isRequestingUserAdmin = await isAdmin(adminUid);
    if (!isRequestingUserAdmin) {
      throw new Error("Unauthorized: Only admins can remove admin roles");
    }

    const userRef = ref(db, `users/${targetHandle}`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      throw new Error("User not found");
    }

    await update(userRef, {
      role: "user",
      updatedOn: new Date().toISOString(),
      updatedBy: adminUid,
    });

    return true;
  } catch (error) {
    console.error("Error removing admin role:", error);
    throw error;
  }
};

/**
 * Block a user from creating posts and comments
 * @param {string} adminUid - The UID of the admin performing the block
 * @param {string} targetHandle - The handle of the user to block
 * @param {string} reason - The reason for blocking
 * @returns {Promise<boolean>}
 * @author Atanas Zaykov
 */
export const blockUser = async (adminUid, targetHandle, reason) => {
  try {
    const isRequestingUserAdmin = await isAdmin(adminUid);
    if (!isRequestingUserAdmin) {
      throw new Error("Unauthorized: Only admins can block users");
    }

    const userRef = ref(db, `users/${targetHandle}`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      throw new Error("User not found");
    }

    await update(userRef, {
      status: "blocked",
      blockReason: reason,
      blockedOn: new Date().toISOString(),
      blockedBy: adminUid,
    });

    return true;
  } catch (error) {
    console.error("Error blocking user:", error);
    throw error;
  }
};

/**
 * Unblock a previously blocked user
 * @param {string} adminUid - The UID of the admin performing the unblock
 * @param {string} targetHandle - The handle of the user to unblock
 * @returns {Promise<boolean>}
 * @author Atanas Zaykov
 */
export const unblockUser = async (adminUid, targetHandle) => {
  try {
    const isRequestingUserAdmin = await isAdmin(adminUid);
    if (!isRequestingUserAdmin) {
      throw new Error("Unauthorized: Only admins can unblock users");
    }

    const userRef = ref(db, `users/${targetHandle}`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      throw new Error("User not found");
    }

    await update(userRef, {
      status: "active",
      blockReason: null,
      blockedOn: null,
      blockedBy: null,
      unblockedOn: new Date().toISOString(),
      unblockedBy: adminUid,
    });

    return true;
  } catch (error) {
    console.error("Error unblocking user:", error);
    throw error;
  }
};

/**
 * Check if a user is blocked
 * @param {string} handle - The handle of the user to check
 * @returns {Promise<boolean>}
 */
export const isUserBlocked = async (handle) => {
  try {
    const userRef = ref(db, `users/${handle}`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      throw new Error("User not found");
    }

    return snapshot.val().status === "blocked";
  } catch (error) {
    console.error("Error checking user block status:", error);
    throw error;
  }
};
