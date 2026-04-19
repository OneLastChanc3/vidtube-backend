import cloudinary from "cloudinary"
import fs from "fs"
import dotenv from "dotenv"

dotenv.config()

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME ,
    api_key:process.env.CLOUDINARY_API_KEY ,
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => { 
    try {
        if (!localFilePath) return null
        const response = await cloudinary.uploader.upload(
            localFilePath, {
                resorce_type: "auto"
            }
        )
        console.log("upload on cloudinary src: " + response.url)
        fs.unlinkSync(localFilePath)
        return response
    } catch (err) {
        fs.unlinkSync(localFilePath)
        return null
    }
}
const deletedFromCoudinary = async (publicId) => { 
    try {
        const result = await cloudinary.uploader.destroy(publicId)
        console.log("Deleted from Cloudinary ", publicId)
    } catch (error) { 
        console.log("Erro deleting from cloudinary", error)
        return null
    }
}

export { uploadOnCloudinary,deletedFromCoudinary}