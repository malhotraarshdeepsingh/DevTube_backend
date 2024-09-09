import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { uploadfile,deleteFromCloudinary } from "../utils/fileUpload.js";


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query = "", sortBy = "createdAt", sortType = 1, userId = "" } = req.query

    let matchCondition = { $and: [] };

    // Add query condition only if query is provided
    if (query.trim()) {
        matchCondition.$and.push({
            $or: [
                { title: { $regex: query, $options: "i" } },   
                { description: { $regex: query, $options: "i" } }
            ]
        });
    }

    // Add userId condition if provided
    if (userId) {
        matchCondition.$and.push({ Owner: new mongoose.Types.ObjectId(userId) });
    }

    // If matchCondition.$and is empty, match all documents
    if (matchCondition.$and.length === 0) {
        matchCondition = {}; // This will match all videos
    }

    let pipeline = [
        {
            $match: matchCondition
        },
        {
            $lookup: {
                from: "users",
                localField: "Owner",
                foreignField: "_id",
                as: "Owner",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            fullName: 1,
                            avatar: "$avatar.url",
                            username: 1,
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                Owner: { $first: "$Owner" },
            }
        },
        {
            $sort: { [sortBy]: sortType }
        }
    ];

    try{
        const options = {  
            page: parseInt( page ),
            limit: parseInt( limit ),
            customLabels: {   
                totalDocs: "totalVideos",
                docs: "videos",
            },
        };

        
        const result = await Video.aggregatePaginate( Video.aggregate( pipeline ), options );

        if ( result?.videos?.length === 0 ) { 
            return res.status( 404 ).json( new ApiResponse( 404, {}, "No Videos Found" ) ); 
        }
        
        return res
            .status( 200 )
            .json( 
                new ApiResponse( 200, result, "Videos fetched successfully" ) 
            );

    } catch ( error ) {
        console.error( error.message );
        return res
            .status( 500 )
            .json( 
                new ApiError( 500, {}, "Internal server error in video aggregation" ) 
            );
    }
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
        const videoLocalPath = req.files?.videoFile[0]?.path;
        
        // throw error if any one is not present
        if (!thumbnailLocalPath || !videoLocalPath) {
            throw new ApiError(400, "Please upload video and thumbnail ");
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
            isPublished: req.isPublished || true,
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
                new ApiResponse(200, uploadedFile, "Video Uploaded sucessfully !")
            )

    } catch (error) {
        console.log(error)
        return res
            .status( 501 )
            .json( 
                new ApiError( 501, error, "Problem in uploading video" ) 
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

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    const videofile = video.videoFile
    if (!videofile) {
        throw new ApiError(404, "video url not found")
    }

    // console.log(req.user._id, video.owner)
    // new ObjectId('66851dec790b8fda734e68ea') new ObjectId('66851dec790b8fda734e68ea')

    if (req.user?._id?.toString() === video?.owner?.toString()) {
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

            const thumbnailLocalPath = req.files?.thumbnail[0]?.path
            if ( !thumbnailLocalPath ) { 
                throw new ApiError( 400, "thumbnail not found" ) 
            }

            const newThumbnail = await uploadfile(thumbnailLocalPath)

            // upload and update new
            const videoLocalPath = req.files?.videoFile[0]?.path
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
            throw new ApiError(400, error,  "error while deleting video file from cloudinary to update video file")
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

    if (req.user?._id.toString()=== video?.owner.toString()) {
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

                await Video.findByIdAndDelete(video._id)
            } catch (error) {
                throw new ApiError(400, error, "error while deleting video file from cloudinary")
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

    const video = await Video.findOne( 
        {
            _id: videoId,
        },
    )
    if(!video) {
        throw new ApiError(404, "video not found");
    }

    
    if (req.user._id.toString()===video.owner.toString()) {
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
    } else {
        throw new ApiError(400, "user not authorised")
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
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
