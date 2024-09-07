import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiRespose.js"


const healthcheck = asyncHandler(async(req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(200, null, "OK!")
        )

})

export {
    healthcheck
}