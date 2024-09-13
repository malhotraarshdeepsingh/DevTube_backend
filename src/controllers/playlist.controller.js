import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name && !description) {
    throw new ApiError(400, "Please provide name and description");
  }

  if (!isValidObjectId(req.user._id)) {
    throw new ApiError(400, "User not logged in");
  }

  const createPlayList = await Playlist.create({
    name: name,
    description: description,
    owner: new mongoose.Types.ObjectId(req.user._id),
  });

  if (!createPlayList) {
    throw new ApiError(400, "Playlist not created please try again!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, createPlayList, "playlist Created!"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid userid!");
  }

  const getPlaylist = await Playlist.find({
    owner: userId,
  });

  if (!getPlaylist) {
    throw new ApiError(400, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, getPlaylist, "playlist found"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid PlayListId!");
  }

  const findPlaylist = await Playlist.findById(playlistId);
  if (!findPlaylist) {
    throw new ApiError(400, "Playlist not Found!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, findPlaylist, "Playlist Found!"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlistId or videoId");
  }

  const findPlaylist = await Playlist.findById(playlistId);
  if (!findPlaylist) {
    throw new ApiError(400, "Playlist not found!");
  }

  if (!findPlaylist.owner.equals(req.user?._id)) {
    throw new ApiError(400, "You cant update this playlist!");
  }

  if (!Array.isArray(findPlaylist.videos)) {
    findPlaylist.video = [];
  }

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
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlistId or videoId");
  }

  const findVideo = await Playlist.findOne({
    $and: [{ _id: playlistId }, { videos: videoId }],
  });

  if (!findVideo.owner.equals(req.user?._id)) {
    throw new ApiError(400, "You can't update this playlist!");
  }

  if (!findVideo) {
    throw new ApiError(400, "Playlist not found!");
  }

  findVideo.videos.pull(videoId);
  const videoRemoved = await findVideo.save();

  if (!videoRemoved) {
    throw new ApiError(400, "Please Try again!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videoRemoved, "Video Removed Successsfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlistId");
  }

  const findPlaylist = await Playlist.findById(playlistId);
  if (!findPlaylist.owner.equals(req.user?._id)) {
    throw new ApiError(400, "You can't delete this playlist!");
  }

  if (!findPlaylist) {
    throw new ApiError(500, "playlist not found!");
  }

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
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlistId");
  }

  if (!name || !description) {
    throw new ApiError(400, "Please provide name and description");
  }

  const findPlaylist = await Playlist.findById(playlistId);
  if (!findPlaylist) {
    throw new ApiError(500, "Playlist not found!");
  }

  if (!findPlaylist.owner.equals(req.user?._id)) {
    throw new ApiError(400, "You can't update this playlist!");
  }

  findPlaylist.name = name;
  findPlaylist.description = description;

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
