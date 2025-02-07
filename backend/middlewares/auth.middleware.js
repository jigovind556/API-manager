const jwt = require("jsonwebtoken");
const { asyncHandler } = require("../utils/asyncHandler");
const { User } = require("../schema");
const { ApiError } = require("../utils/ApiError");


const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    
        if(!user){
            throw new ApiError(401, "Invalid access Token");
        }
    
        req.user =user;
        next();
    } catch (err) {
        throw new ApiError(err.statusCode || 401, err.message || "Something went wrong in validating  JWT");
    }
});

module.exports = { verifyJWT };