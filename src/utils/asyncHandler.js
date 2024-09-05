/*
const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req,res,next);
    } catch (error) {
        res.status(404).send(error).json({success: false, message: error.message})
    }
}
*/
const asyncHandler = (requstHandler) => {
  return (req, res, next) => {
    Promise.resolve(requstHandler(req, res, next)).catch((error) =>
      next(error)
    );
  };
};

export { asyncHandler };
