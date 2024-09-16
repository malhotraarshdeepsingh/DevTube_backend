import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweet.model.js";

const createTweet = asyncHandler(async (req, res) => {
  // get info from params and validate it 
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "Please write some TWEET!");
  }

  // get user info from payload and validate it
  if (!isValidObjectId(req.user._id)) {
    throw new ApiError(400, "User not logged in");
  }

  // create new tweet and save it in database
  const postTweet = await Tweet.create({
    owner: req.user?._id,
    content: content,
  });

  // check if post tweet exists
  if (!postTweet) {
    return new ApiError(400, "Tweet not posted!");
  }

  return res.status(200).json(new ApiResponse(200, postTweet, "Tweet Posted!"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // get info from params and validate it
  const { userId } = req.params;
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid USerId");
  }

  // get user tweets from database and validate it
  const userTweet = await Tweet.find({
    owner: new mongoose.Types.ObjectId(userId),
  });

  // check if tweet is found
  if (userTweet.length === 0) {
    return new ApiError(500, "No tweet found!");
  }

  return res
    .status(200)
    .json(
        new ApiResponse(
          200,
          {
            Total_Tweets: userTweet.length,
            Tweet: userTweet,
          },
          "Tweets found!"
        )
      );
});

const updateTweet = asyncHandler(async (req, res) => {
  // get info from params 
  const { tweetId } = req.params;
  const { content } = req.body;

  // check if tweetId is valid
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet");
  }

  // check if content is provided
  if (!content) {
    throw new ApiError(400, "Please write something!");
  }

  // make a db req to find tweet
  const findTweet = await Tweet.findOne({
    $and: [
      { owner: new mongoose.Types.ObjectId(req.user?._id) },
      { _id: tweetId },
    ],
  });

  // check if tweet is found
  if (!findTweet) {
    throw new ApiError(400, "You are not authorized to update this tweet");
  }

  // update the tweet content and save it in database
  findTweet.content = content;
  const updatedTweet = await findTweet.save();

  // check whether tweet is updated successfully
  if (!updatedTweet) {
    throw new ApiError(500, "Tweet not updated!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  // get info from params
  const { tweetId } = req.params;

  // check if tweetId is valid
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid Tweet");
  }

  // make a db req to find tweet and check if it exists and belongs to the user
  const findTweet = await Tweet.findOne({
    $and: [
      { owner: new mongoose.Types.ObjectId(req.user?._id) },
      { _id: tweetId },
    ],
  });

  // check if tweet is found
  if (!findTweet) {
    return res
      .status(500)
      .json(
        new ApiError(500, {}, "You are not authorized to delete this tweet")
      );
  }

  // delete the tweet
  const delTweet = await Tweet.findByIdAndDelete(tweetId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet deleted successfully!"));
});

export { createTweet, getUserTweets, deleteTweet, updateTweet };
