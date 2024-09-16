import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";

const createPlaylist = asyncHandler(async (req, res) => {
  // get info from params and validate it
  const { name, description } = req.body;
  if (!name && !description) {
    throw new ApiError(400, "Please provide name and description");
  }

  // validate user is logged in and get id
  if (!isValidObjectId(req.user._id)) {
    throw new ApiError(400, "User not logged in");
  }

  // create new playlist with provided name and description and owner id
  const createPlayList = await Playlist.create({
    name: name,
    description: description,
    owner: new mongoose.Types.ObjectId(req.user._id),
  });

  // check whether the playlist is created successfully or not
  if (!createPlayList) {
    throw new ApiError(400, "Playlist not created please try again!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, createPlayList, "playlist Created!"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  // get info from params and validate accordingly
  const { userId } = req.params;
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid userid!");
  }

  // find all the playlists with the db request
  const getPlaylist = await Playlist.find({
    owner: userId,
  });

  // check if the playlists are found or not found
  if (!getPlaylist) {
    throw new ApiError(400, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, getPlaylist, "playlist found"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  // get info from params
  const { playlistId } = req.params;

  // validate the playlist id
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid PlayListId!");
  }

  // find the playlist with the given id from the db request
  const findPlaylist = await Playlist.findById(playlistId);
  if (!findPlaylist) {
    throw new ApiError(400, "Playlist not Found!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, findPlaylist, "Playlist Found!"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  // get info from params
  const { playlistId, videoId } = req.params;

  // validate the playlist and video id
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlistId or videoId");
  }

  // find the playlist with the given id from the db request
  const findPlaylist = await Playlist.findById(playlistId);
  if (!findPlaylist) {
    throw new ApiError(400, "Playlist not found!");
  }

  // validate owner
  if (!findPlaylist.owner.equals(req.user?._id)) {
    throw new ApiError(400, "You cant update this playlist!");
  }

  // initiate a array
  if (!Array.isArray(findPlaylist.videos)) {
    findPlaylist.video = [];
  }

  // check if video already exists in the playlist
  if (findPlaylist.videos.includes(videoId)) {
    throw new ApiError(
      400,
      "Video already exists in playlist You cant add this video in the playlist!"
    );
  }

  // console.log("Before adding video:", findPlaylist.video);
  findPlaylist.videos.push(videoId);
  // console.log("After adding video:", findPlaylist.video);

  try {
    // save new playlist object 
    const videoAdded = await findPlaylist.save();
    // console.log("Video added:", videoAdded);

    return res
      .status(200)
      .json(new ApiResponse(200, videoAdded, "Video added to the playlist!"));
  } catch (error) {
    console.error("Error saving playlist:", error);
    throw new ApiError(
      500,
      "Video is not added to the playlist. Please try again!"
    );
  }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  // get info from params and validate it
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlistId or videoId");
  }

  // find the playlist
  const findVideo = await Playlist.findOne({
    $and: [
      { _id: playlistId }, 
      { videos: videoId }
    ],
  });

  // validate user owner
  if (!findVideo.owner.equals(req.user?._id)) {
    throw new ApiError(400, "You can't update this playlist!");
  }

  // validate video exists in playlist
  if (!findVideo) {
    throw new ApiError(400, "Playlist not found!");
  }

  // remove the video and save in db
  findVideo.videos.pull(videoId);
  const videoRemoved = await findVideo.save();

  // check if the changes have been done
  if (!videoRemoved) {
    throw new ApiError(400, "Please Try again!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videoRemoved, "Video Removed Successsfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  // get info from params and validate it
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlistId");
  }

  // find the playlist and validate user owner
  const findPlaylist = await Playlist.findById(playlistId);
  if (!findPlaylist.owner.equals(req.user?._id)) {
    throw new ApiError(400, "You can't delete this playlist!");
  }

  // check whether playlist is found
  if (!findPlaylist) {
    throw new ApiError(500, "playlist not found!");
  }

  // delete the playlist with db req and check if it is deleted properly
  const playlistDeleted = await Playlist.findByIdAndDelete(playlistId);
  if (!playlistDeleted) {
    throw new ApiError(500, "playlist not delete. Please try again!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlistDeleted, "playlist deleted successfully!")
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
  // get info from params and validate it
  const { playlistId } = req.params;
  const { name, description } = req.body;

  // validate playlist id 
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlistId");
  }

  // validate name and description
  if (!name || !description) {
    throw new ApiError(400, "Please provide name and description");
  }

  // find the playlist and validate user owner
  const findPlaylist = await Playlist.findById(playlistId);
  if (!findPlaylist) {
    throw new ApiError(500, "Playlist not found!");
  }

  if (!findPlaylist.owner.equals(req.user?._id)) {
    throw new ApiError(400, "You can't update this playlist!");
  }

  // make changes in playlist object 
  findPlaylist.name = name;
  findPlaylist.description = description;

  // save changes in db request and check if it is saved properly
  const playlistUpdated = await findPlaylist.save();
  if (!playlistUpdated) {
    throw new ApiError(500, "Please try again!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, {}, "Playlist updated successfully!")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
