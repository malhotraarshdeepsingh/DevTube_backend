import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { uploadfile } from "../utils/fileUpload.js";


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    try {
        const { title, description } = req.body
        
        // throw errors if title or description is not present
        if (
            [title, description].some((field) => {
              field?.trim() === "";
            })
        ) {
            throw new ApiError(400, "All fields are required");
        }
    
        // get thumbnail and video
        const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
        const videoLocalPath = req.files?.video[0]?.path;
        
        // throw error if any one is not present
        if (!thumbnailLocalPath && !videoLocalPath) {
            throw new ApiError(400, "Please upload avatar and cover image");
        }
    
        // handle to uploadagent
        const thumbnail = await uploadfile(thumbnailLocalPath);
        const videofile = await uploadfile(videoLocalPath);
    
        // create video object
        const video = await Video.create({
            title,
            description,
            thumbnail: thumbnail?.url,
            videoFile: videofile?.url,
            owner: req.user._id,
            isPublished: true,
            duration: videofile?.duration,
        })
    
        const uploadedFile = await Video.findById(video._id)
    
        // check for uploaded video
        if (!uploadedFile) {
            throw new ApiError(500, "Failed to upload video");
        }
    
        return res
            .status(200)
            .json(
                new ApiResponse(200, videoUploaded, "Video Uploaded sucessfully !")
            )

    } catch (error) {
        return res
            .status( 501 )
            .json( 
                new ApiError( 501, {}, "Problem in uploading video" ) 
            )
    }
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    // 1. Get the video id from the request params(frontend)  [http://localhost:8000/video/get-video/:videoId]
    // 2. Check if the videoId id is valid
    // 3. Find the video in the database
    
    try {
        // 1. Get the video id from the request params(frontend)  [http://localhost:8000/video/get-video/:videoId]
        const { videoId } = req.params

        // 2. Check if the videoId id is valid
        if ( !isValidObjectId( videoId ) ) { 
            throw new ApiError( 400, "Invalid VideoID" )
        }

        // 3. Find the video in the database
        const video = await Video.findById( videoId )

        if ( !video || (
            (!video?.isPublished) && (!video?.owner === req.user?._id)
        )) { 
            throw new ApiError( 400, "No such video exists" ) 
        }

        // 4. Increment views of video
        const user = await User.findById(req.user?._id)

        if (!(user.watchHistory.includes(videoId))) {
            await Video.findByIdAndUpdate(videoId,
                {
                    $inc: {
                        views: 1
                    }
                },
                {
                    new: true
                }
            )
        }

        // 5. Set video_id in watchHistory of user
        await User.findByIdAndUpdate(req.user?._id,
            {
                $addToSet: {
                    watchHistory: videoId
                }
            },
            {
                new: true
            }
        )

        return res
            .status( 200 )
            .json( 
                new ApiResponse( 200, video, "Video found " ) 
            )

    } catch (error) {
        res
            .status( 501 )
            .json( 
                new ApiError( 501, {}, "Video not found" ) 
            )
    }
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
