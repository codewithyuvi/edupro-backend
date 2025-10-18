import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { Admin } from "../models/admin.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async(adminId) => {
    try {
        const admin = await Admin.findById(adminId)
        
        const accessToken = admin.generateAccessToken()
        const refreshToken = admin.generateRefreshToken()

        admin.refreshToken = refreshToken
        await admin.save({validateBeforeSave: false})
        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

const registerAdmin = asyncHandler( async (req, res) => {

    //get user details from frontend (postman)
    const {username, email, fullName, password} = req.body
    //console.log("email:", email);
    
    // validation - not empty
    if([username, email, fullName, password].some((field) => field?.trim() === "")){
        throw new ApiError(400, "All fields are required")
    }

    // check if user already exists: username, or with email
    // ye vala user, sidha mongo db me check kr rha h. 
    const existedUser = await Admin.findOne({
        $or: [{ username }, { email }]
    })

    if(existedUser){
        throw new ApiError(409, "User with email or username already exits")
    }

    //console.log(req.files);
    
    // check for images, check for avatar
    // const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let avatarLocalPath;
    if(req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0){
        avatarLocalPath = req.files.avatar[0].path;
    }

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar Image is required")
    }

    // upload them to cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if(!avatar){
        throw new ApiError(400, "Avatar Image is required")
    }

    // create user object - create entry in db
    //User he bat kr rha hai db se aur koi nhi
    const admin = await Admin.create({
        username: username.toLowerCase(),
        fullName,
        avatar: avatar.url,
        email,
        password,
    })

    // remove password and refresh token field from response
    const createdAdmin = await Admin.findById(admin._id).select(
        "-password -refreshToken"
    )

    // check for user creation 
    if(!createdAdmin){
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    // return res
    return res.status(201).json(
        new ApiResponse(200, createdAdmin, "User registered Successfully")
    )
})

const loginAdmin = asyncHandler(async (req, res) => {
    // get user details from frontend (postman)
    // check if required field are not empty
    // check if username or email exist in db or not. 
    // check if the password matches. 
    // access and refresh token generate
    // send secure cookies
    // successfully logged in 

    const {email, username, password } = req.body

    
    if(!username && !email){
        throw new ApiError(400, "username or password is required")
    } 

    // ya to username dhundh do ya fir email dhund do dono me se kuch v mil jaye to shi h 
    const admin = await Admin.findOne({
        $or: [{username}, {email}]
    })

    if(!admin){
        throw new ApiError(404, "User does not exist")
    }
    //console.log(user);
    
    const isPasswordValid = await admin.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials")
    }
    else{
        console.log("logged in");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(admin._id)

    const loggedInUser = await Admin.findById(admin._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
        // in dono se, cookies frontend se uneditable bn jati hai, by default editable hoti hai. 
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                admin: loggedInUser, accessToken,
                refreshToken
            },
            "User Logged In Successfully"
        )
    )
})

const logoutAdmin = asyncHandler(async(req, res) => {
    // cookies clear + refresh token ko reset 
    // created a middleware auth.middleware.js
    // middle ware auth.middleware.js bnaya islie user ko ab access kr pa rhe h, otherwise apne pas vo nhi tha.
    // user authenticated hai ya nhi, uske lie ye middleware likha, ab ye har jgh kam ayega, like krne ke lie subscribe krne ke lie sbke lie phle check krenge ki user authenticated hai ya nhi. 
    Admin.findByIdAndUpdate(
        await req.admin._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    console.log("logged out");
    
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET
        )
    
        const admin = await Admin.findById(decodedToken?._id)
    
        if(!admin){
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if(incomingRefreshToken !== admin?.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used")
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(admin._id)
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message) || "Invalid refresh token"
    }
})

// change password later

const getCurrentAdmin = asyncHandler(async (req, res) => {
    // const currentUser = await User.findById(req.user?.id)
    return res
    .status(200)
    .json(200, req.admin, "Current user fetched successfully")
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const {fullName, email} = req.body

    if(!fullName || !email){
        throw new ApiError(400, "All fields are required")
    }

    const admin = await Admin.findByIdAndUpdate(
        req.admin?._id,
        {
            $set: {
                fullName, // we can also write like this fullName = fullName
                email, // email = email
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, admin, "Account details updated successfully"))

})

const updateAdminAvatar = asyncHandler(async (req, res) => {
    //ek he file leni hai so. "file" not "files"
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400, "Error while uploading on avatar")
    }

    const admin = await Admin.findByIdAndUpdate(
        req.admin?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, admin, "Avatar Image updated successfully")
    )
})

export {
    registerAdmin,
    loginAdmin,
    logoutAdmin,
    refreshAccessToken,
    getCurrentAdmin,
    updateAccountDetails,
    updateAdminAvatar
}