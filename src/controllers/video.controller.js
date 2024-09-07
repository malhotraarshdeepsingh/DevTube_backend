import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { uploadfile,deleteFromCloudinary } from "../utils/fileUpload.js";


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
                new ApiResponse( 200, video, "Video found" ) 
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
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "videoId is not correct to update video")
    }

    const videofile = video.videoFile
    if (!videofile) {
        throw new ApiError(404, "video url not found")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    
    if (req.user?._id === video?.owner) {
        try {
            const { title, description } = req.body
            if ( 
                [ title, description ].some( ( feild ) => feild.trim() === "" ) 
            ) { 
                throw new ApiError( 400, "Please provide title, description, thumbnail" ) 
            }
            
            // delete old video
            const oldVideoUrl = video.videoFile
            const deleteOldVideoUrl = await deleteFromCloudinary( oldVideoUrl )
            if ( !deleteOldVideoUrl ) { 
                throw new ApiError( 400, "video not deleted" ) 
            }

            // delete old thumbnail
            const thumbnailOldUrl = video.thumbnail
            const deleteThumbnailOldUrl = await deleteFromCloudinary( thumbnailOldUrl )
            if ( !deleteThumbnailOldUrl ) { 
                throw new ApiError( 400, "thumbnail not deleted" ) 
            }

            const thumbnailLocalPath = req.file?.path
            if ( !thumbnailLocalPath ) { 
                throw new ApiError( 400, "thumbnail not found" ) 
            }

            const newThumbnail = await uploadfile(thumbnailLocalPath)

            // upload and update new
            const videoLocalPath = req.file?.path

            if (!videoLocalPath) {
                throw new ApiError(400, "video file is required please choose the file to update")
            }

            const newVideo = await uploadfile(videoLocalPath)

            if (!newVideo.url) {
                throw new ApiError(400, "Error while uploading on cloudinary")
            }

            const updatedVideo = await Video.findByIdAndUpdate(videoId,
                {
                    $set: {
                        videoFile: newVideo.url,
                        duration: newVideo.duration,
                        title,
                        description,
                        thumbnail: newThumbnail.url,
                    }
                },
                {
                    new: true
                }
            )

            return res
                .status(200)
                .json(
                    new ApiResponse(200, updatedVideo, "Video Updated Sucessfully !")
                )
        } catch (error) {
            throw new ApiError(400, "error while deleting video file from cloudinary to update video file")
        }
    } else {
        throw new ApiError(400, "User is not authorised")
    }
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "videoId is not correct to delete video")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (req.user?._id=== video?.owner) {
        const videofile = video.videoFile
    
        if (videofile) {
            try {
                const oldVideoUrl = video.videoFile
                const deleteOldVideoUrl = await deleteFromCloudinary( oldVideoUrl )
                if ( !deleteOldVideoUrl ) { 
                    throw new ApiError( 400, "video not deleted" ) 
                }

                // delete old thumbnail
                const thumbnailOldUrl = video.thumbnail
                const deleteThumbnailOldUrl = await deleteFromCloudinary( thumbnailOldUrl )
                if ( !deleteThumbnailOldUrl ) { 
                    throw new ApiError( 400, "thumbnail not deleted" ) 
                }

                await Video.findByIdAndDelete(video._id, (err) => {
                    if (err) {
                      console.log("Founded an Error in deleting a video : ", +err);
                      throw new ApiError(400, "Video Not Deleted Successfully");
                    }
                })
            } catch (error) {
                throw new ApiError(400, "error while deleting video file from cloudinary")
            }
        } else {
            throw new ApiError(404, "Video file not found")
        }
    
        return res
            .status(200)
            .json(
                new ApiResponse(200, [], "Video is deleted successfully !")
            )
    }
    //TODO: to delete comments and likes 
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Video id is not valid");
    }

    const video = await VideofindOne( 
        {
            _id: videoId,     
            Owner: req.user._id, 
        },
    )
    if(!video) {
        throw new ApiError(404, "Unauthorised user!");
    }

    
    const publishedStatus = video.isPublished
    
    const toggleStatus = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !publishedStatus,
            }
        },
        {
            new: true
        }
    )

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            toggleStatus,
            "Status is updated successfully"
        ))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
