import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import { deletedFromCoudinary, uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const generateAccessToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        if (!user) {
            throw new ApiError(400, "user not found")
        }
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validareBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {

    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { fullname, username, email, password } = req.body
    if (
        [fullname, username, email, password].some((field) =>
            field.trim() === "")
    ) {
        throw new ApiError(400, "All filed are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "user or email already exist")
    }

    console.warn(req, files)
    const avatarLocalPath = await req.files?.avatar?.[0]?.path
    const coverLocalPath = await req.files?.coverImage?.[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }
    // const avatar = await uploadOnCloudinary(avatarLocalPath)
    // let coverImage = ""
    // if (coverLocalPath) {
    //     coverImage = await uploadOnCloudinary(coverImage)
    // }
    let avatar;
    try {
        avatar = await uploadOnCloudinary(avatarLocalPath)
        console.log("Upload avatar", avatar)
    }
    catch (error) {
        console.log("Error uploading avatar", error)
        throw new ApiError(500, "Failed to upload Avatar")
    }

    let coverImage;
    try {
        coverImage = await uploadOnCloudinary(coverLocalPath)
        console.log("Upload coverImage", coverImage)
    }
    catch (error) {
        console.log("Error uploading coverImage", error)
        throw new ApiError(500, "Failed to upload coverImage")
    }
    try {
        const user = await User.create({
            fullname,
            avatar: avatar.url,
            converImage: coverImage?.url || "",
            email,
            password,
            username: username.tolowerCase()

        })

        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )
        if (!createdUser) {
            throw new ApiError(500, "Somenthing went wrong while registering a user")
        }

        return res
            .status(201)
            .json(new ApiResponse(200, createdUser, "User registed succesfully"))
    } catch (error) {
        console.log("User creation failed", error)

        if (avatar) {
            await deletedFromCoudinary(avatar.public_id)
        }
        if (coverImage) {
            await deletedFromCoudinary(coverImage.public_id)
        }
        throw new ApiError(500, "Something went wrong while registering")
    }

})

const loginUser = asyncHandler(async (req, res) => { 
    const { email, username, password } = req.body
    
    if (!email) { 
        
    }
})

export { registerUser }