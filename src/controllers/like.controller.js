import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/like.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  // get info from params
  const { videoId } = req.params;

  // make a db req to validate video id
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video");
  }

  // check if user has already liked this video
  const VideoLike = await Like.findOne({
    $and: [
        { likedBy: req.user?._id }, 
        { video: videoId }
    ],
  });

  // if user has liked this video, remove the like
  if (VideoLike) {
    await Like.findByIdAndDelete(VideoLike._id);
    return res.status(200).json(new ApiResponse(200, {}, "Like removed"));
  }

  // if user has not liked then create like object
  const Liked = await Like.create({
    likedBy: req.user?._id,
    video: videoId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, Liked, "Like added"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  // get info from params
  const { commentId } = req.params;

  // validate comment id with db req
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment");
  }

  // check if user has already liked this comment
  const commentLike = await Like.findOne({
    $and: [
        { likedBy: req.user?._id }, 
        { comment: commentId }
    ],
  });

  // if user has liked this comment, remove the like
  if (commentLike) {
    await Like.findByIdAndDelete(commentLike._id);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Like removed"));
  }

  // if user has not liked then create like object
  const Liked = await Like.create({
    likedBy: req.user?._id,
    comment: commentId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, Liked, "Like added"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  // get info from params
  const { tweetId } = req.params;

  // validate tweet id with db req
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet");
  }

  // check if user has already liked this tweet
  const tweetLike = await Like.findOne({
    $and: [
        { likedBy: req.user?._id }, 
        { tweet: tweetId }
    ],
  });

  // if user has liked this tweet, remove the like
  if (tweetLike) {
    await Like.findByIdAndDelete(tweetLike._id);
    return res.status(200).json(new ApiResponse(200, {}, "Like removed"));
  }

  // if user has not liked then create like object
  const Liked = await Like.create({
    likedBy: req.user?._id,
    tweet: tweetId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, Liked, "Like added"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  // find all videos liked by user by db request
  const LikedVideos = await Like.find({
    $and: [
        { likedBy: req.user?._id }, 
        { video: { $exists: true } }
    ],
  });

  // if no videos found, throw an error
  if (!LikedVideos) {
    throw new ApiError(500, "Liked Videos Not Found!");
  }

  // return the videos
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { 
            Total_Videos: LikedVideos.length, 
            Videos: LikedVideos 
        },
        "Videos found!"
      )
    );
});

export { 
    toggleCommentLike, 
    toggleTweetLike, 
    toggleVideoLike, 
    getLikedVideos 
};
