const { User } = require("../schema");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const { asyncHandler } = require("../utils/asyncHandler");
const jwt = require("jsonwebtoken");

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (e) {
        throw new ApiError(500, "Something went wrong in generating access and refresh token");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // console.log("body : ",req.body);
    const { name, username, password } = req.body;
    if (
        [name, username, password].some((field) => (!field || field?.trim() === ""))
    ) {
        console.log("\nrequired field not received !!!!");
        throw new ApiError(400, "All fields are required");
    }
    console.log(username);

    const existedUser = await User.findOne({ username });

    if (existedUser) {
        throw new ApiError(409, "Username already in use");
    }

    const user = await User.create({
        username, name, password
    });

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Server Error: Could not create the user")
    }
    const options = {
        // maxAge: 900000,
        httpOnly: true,
        secure: true
    }
    res.status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(
            new ApiResponse(200,{user:createdUser, accessToken, refreshToken,},"User registered successfully!")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    console.log("loging route ", username);
    if (!username || !password) {
        throw new ApiError(400, "Please provide an username and a password");
    }

    const user = await User.findOne({ username });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }
    const isMatch = await user.isCorrectPassword(password);
    if (!isMatch) {
        throw new ApiError(401, "Incorrect Password!");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        // maxAge: 900000,
        httpOnly: true,
        secure: true
    }
    res.status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(
            new ApiResponse(201, {
                user: loggedUser, accessToken, refreshToken
            }, 'Logged in successfully')
        )
});

const checkUser = asyncHandler(async (req, res) => {
    const user  = req.user;
    res.status(200).json(new ApiResponse(200, {user}, "User data fetched successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        }, { new: true }
    );
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .clearCookie('accessToken', options)
        .clearCookie('refreshToken', options)
        .json(
            new ApiResponse(200, {}, "User Successfully Logged Out")
        )
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(403, "No token provided");
    };

    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken._id);

    if (!user) {
        throw new ApiError(401, "Invalid refresh Token");
    }
    if (incomingRefreshToken !== user.refreshToken) {
        throw new ApiError(400, "Refresh token is  stale. Please login again.");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        // maxAge: 600000,
    }

    res.status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(
            new ApiResponse(201, {
                accessToken, refreshToken
            }, 'Access token refreshed')
        );

})



module.exports = { registerUser, loginUser,checkUser, logoutUser, refreshAccessToken};