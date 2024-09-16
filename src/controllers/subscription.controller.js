import { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { mongoose } from "mongoose";

const toggleSubscription = asyncHandler(async (req, res) => {
  // Validate the channelId parameter is a valid ObjectId
  const { channelId } = req.params;
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Channel Id is not available !");
  }

  // check if the user is authenticated
  if (!req.user?._id) {
    throw new ApiError(400, "Invalid LoggedIn user Id  !");
  }

  // Fetch the user's subscriptions and check if the channel is already subscribed
  const subscriberId = req.user?._id;

  // Check if the user is already subscribed to the channel
  const isSubscribed = await Subscription.findOne({
    channel: channelId,
    subscriber: subscriberId,
  });

  // Toggle the subscription status and update the user's subscriptions array accordingly
  let subscriptionStatus;
  try {
    if (isSubscribed) {
      await Subscription.deleteOne({ _id: isSubscribed._id });
      subscriptionStatus = { isSubscribed: false };
    } else {
      await Subscription.create({
        channel: channelId,
        subscriber: subscriberId,
      });
      subscriptionStatus = { isSubscribed: true };
    }
  } catch (error) {
    new ApiError(400, "Error while toggle subscription", error);
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscriptionStatus,
        "Toggle Subscription Sucessfully !"
      )
    );
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  // get information from params
  const { channelId } = req.params;

  // check if channel id is valid
  if (!isValidObjectId(channelId)) {
    throw new ApiError(401, "Invalid Channel ID!");
  }

  // fetch total subscribers for the given channel
  const userSubscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $group: {
        _id: null,
        totalSubscribers: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalSubscribers: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        userSubscribers[0] || { subscribers: 0 },
        "Subscribers fetched sucessfully !"
      )
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  // get info from params
  const { subscriberId } = req.params;

  // validate subscription id 
  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(401, "Invalid subscriber Id!");
  }

  // fetch subscribed channels for the given subscriber
  const userchannel = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "subscribedTo",
        pipeline: [
          {
            $project: {
              fullname: 1,
              username: 1,
              isSubscribed: 1,
            },
          },
        ],
      },
    },

    {
      $addFields: {
        subscribedTo: {
          $first: "$subscribedTo",
        },
      },
    },
  ]);

  // return a array with map function of all subscribers
  const channelsList = userchannel.map((i) => i.subscribedTo);

  return res
    .status(200)
    .json(new ApiResponse(200, channelsList, "subscribed channels fetched"));
});

export { 
    toggleSubscription, 
    getUserChannelSubscribers, 
    getSubscribedChannels 
};
