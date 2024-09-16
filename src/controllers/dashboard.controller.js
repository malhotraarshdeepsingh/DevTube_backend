import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscription.model.js";
import { Tweet } from "../models/tweet.model.js";
import { Comment } from "../models/comment.model.js";
import { Like } from "../models/like.model.js";
import { User } from "../models/user.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // get info from params
  let { channel } = req.params;

  // validate the channel id
  channel = await User.findOne({ username: channel });
  const channelID = new mongoose.Types.ObjectId(channel?._id);
  if ( !channel || !isValidObjectId(channelID) ) {
    throw new ApiError(400, "channel not found");
  }

  // calculate total views and videos of videos by this channel
  const totalViewsAndVideos = await Video.aggregate([
    {
      $match: {
        $and: [
          { Owner: new mongoose.Types.ObjectId(channelID) },
          { isPUblished: true },
        ],
      },
    },
    {
      $group: {
        _id: "$Owner",
        totalViews: { $sum: "$views" }, 
        totalVideos: { $sum: 1 },
      },
    },
  ]);

  // calculate total subscribers, tweets, comments, and video likes by this channel
  const totalSubs = await Subscription.aggregate([
    { $match: 
        { channel: new mongoose.Types.ObjectId(channelID) } 
    },
    { $count: "totalSubcribers" }, 
  ]);

  const totalTweets = await Tweet.aggregate([
    { $match: 
        { owner: new mongoose.Types.ObjectId(channelID) } 
    },
    { $count: "totalTweets" },
  ]);

  const totalComments = await Comment.aggregate([
    { $match: 
        { owner: new mongoose.Types.ObjectId(channelID) } 
    },
    { $count: "totalComments" },
  ]);

  const totalVideoLikes = await Like.aggregate([
    {
      $match: {
        $and: [
          { likedBy: new mongoose.Types.ObjectId(channelID) },
          { video: { $exists: true } },
        ],
      },
    },
    { $count: "totalVideoLikes" },
  ]);

  const totalCommentLikes = await Like.aggregate([
    {
      $match: {
        $and: [
          { likedBy: new mongoose.Types.ObjectId(channelID) },
          { Comment: { $exists: true } },
        ],
      },
    },
    { $count: "totalCommentLikes" },
  ]);

  const totalTweetLikes = await Like.aggregate([
    {
      $match: {
        $and: [
          { likedBy: new mongoose.Types.ObjectId(channelID) },
          { tweet: { $exists: true } },
        ],
      },
    },
    { $count: "totalTweetLikes" },
  ]);

  // send all the information
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalViews: totalViewsAndVideos[0]?.totalViews,
        totalVideos: totalViewsAndVideos[0]?.totalVideos,
        totalSubs: totalSubs[0]?.totalSubcribers,
        totalTweets: totalTweets[0]?.totalTweets,
        totalComments: totalComments[0]?.totalComments,
        totalVideoLikes: totalVideoLikes[0]?.totalVideoLikes,
        totalCommentLikes: totalCommentLikes[0]?.totalCommentLikes,
        totalTweetLikes: totalTweetLikes[0]?.totalTweetLikes,
      },
      "Stats of the chanel"
    )
  );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // get info from params and query 
  const { channel } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // check if channel id is valid
  if (!isValidObjectId(channel)) {
    throw new ApiError(400, "channel not found");
  }

  // fetch all the videos related to the channel
  let pipeline = [
    {
      $match: {
        $and: [
          { Owner: new mongoose.Types.ObjectId(channel) },
          { isPUblished: true },
        ],
      },
    },
    {
      $lookup: {
        from: "users", 
        localField: "Owner", 
        foreignField: "_id", 
        as: "ownerDetails", 
      },
    },
    {
      $unwind: "$ownerDetails", 
    },
    {
      $addFields: {
        username: "$ownerDetails.username",
        fullName: "$ownerDetails.fullName",
        avatar: "$ownerDetails.avatar",
      },
    },
    {
      $project: {
        ownerDetails: 0,
      },
    },
  ];

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    customLabels: {
      totalDocs: "total_videos",
      docs: "Videos",
    },
  };

  // Create pagination
  const videos = await Video.aggregatePaginate(pipeline, options);

  // Check if there are no videos found for the channel  and throw an error if true  else return the videos
  if (videos?.total_videos === 0) {
    throw new ApiError(400, "Videos Not Found");
  }
  
  // Return the paginated videos
  return res
        .status(200)
        .json(new ApiResponse(200, { videos }, "Videos Found"));
});

export { getChannelStats, getChannelVideos };
