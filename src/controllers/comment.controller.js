import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { Comment } from "../models/comment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getVideoComments = asyncHandler(async (req, res) => {
  // get video id and pagenation options from params
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // make a db request to check whether the video id is valid
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid VIdeo");
  }

  // construct a pipeline to fetch the required comments for the given video
  let pipeline = [
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
  ];

  // add pagination to the pipeline
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    customLabels: {
      totalDocs: "total_comments",
      docs: "Comments",
    },
  };

  // execute the pipeline, fetch and save all comments in a variable
  const allCommnets = await Comment.aggregatePaginate(pipeline, options);

  // if no comments found, throw an error
  if (allCommnets?.total_comments === 0) {
    throw new ApiError(400, "Comments not found");
  }

  // return the paginated comments and total count of comments
  return res.status(200).json(
    new ApiResponse(200, {
      Commnets: allCommnets,
      size: allCommnets.length,
    })
  );
});

const addComment = asyncHandler(async (req, res) => {
  // get video id and comment content from params
  const { videoId } = req.params;
  const { content } = req.body;

  // validate user and video id and throw error if invalid
  if (!isValidObjectId(req.user._id)) {
    throw new ApiError(400, "User not logged in");
  }
  
  // get video id
  if (!isValidObjectId(videoId)) {
    throw new ApiError(500, {}, "Invalid video");
  }

  // check if user provided content for the comment
  if (!content) {
    throw new ApiError(400, {}, "Please enter valid comment");
  }

  // create a new comment in the database
  const comment = await Comment.create({
    content: content,
    video: videoId,
    owner: new mongoose.Types.ObjectId(req.user?._id),
  });

  // if there's a failure while saving the comment return the error
  if (!comment) {
    throw new ApiError(500, error, "Comment not Saved to Db");
  }

  // success message
  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // get comment id and updated content from parameters and body
  const { commentId } = req.params;
  const { content } = req.body;

  // validate comment id and throw error if invalid
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid commentId");
  }

  // check if content is provided throw error if invalid
  if (content.length === 0) {
    throw new ApiError(400, "Pls provide the content");
  }

  // make a db request to find out if the comment is valid
  const comment = await Comment.findOne({
    _id: commentId, 
    owner: req.user._id, 
  });

  // check whether it got the comment which is to be updated
  if (!comment) {
    throw new ApiError(400, "comment not found");
  }

  comment.content = content;

  await comment.save();

  // success message
  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // get comment id from parameters and throw error if invalid
  const { commentId } = req.params;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, {}, "Invalid commentId");
  }

  // make a db request to delete the comment if the user is the owner and comment id is valid
  const delComment = await Comment.deleteOne({
    $and: [
      { _id: commentId },
      { owner: req.user._id },
    ],
  });

  // if comment is not found send api error 
  if (!delComment) {
    throw new ApiError(500, "comment not found");
  }

  // if the user is not authorized to comment send the api error
  if (delComment.deletedCount === 0) {
    return res
      .status(500)
      .json(new ApiError(500, "You are not authorized to delete this comment"));
  }

  // success message
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

export { 
    getVideoComments, 
    addComment, 
    updateComment, 
    deleteComment 
};
