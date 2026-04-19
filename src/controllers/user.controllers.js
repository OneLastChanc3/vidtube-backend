import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, username, email, password } = req.body
    if (
        [fullName, username, email, password].some((field) =>
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

    const avatarLocalPath = await req.files?.avatar[0]?.path
    const coverLocalPath = await req.files?.coverImage[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    let coverImage = ""
    if (coverLocalPath) {
        coverImage = await uploadOnCloudinary(coverImage)
    }

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
})

export { registerUser}