# ForumProject
posts
  |- postID (Unique Identifier)
     |- postData (actual content of the post)
     |- likes
        |- likeCount (Total number of likes)
        |- users
           |- userID (User who liked the post)
              |- timestamp (When the user liked the post)
 

users
  |- userID (Unique Identifier for user)
     |- username (User's display name)
     |- userData (Other user info)
     |- likes
        |- postID (ID of the post the user liked)
     |- receivedLikes
        |- postID (ID of the user's post that received likes)
           |- likeCount (Total likes this post received)

⦁	The title must be between 16 and 64 symbols.
⦁	The content must be between 32 symbols and 8192 symbols.
