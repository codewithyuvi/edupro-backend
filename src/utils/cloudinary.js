import { v2 as cloudinary} from "cloudinary";
import fs from "fs"; 

// Configuration
cloudinary.config({ 
    cloud_name: `${process.env.CLOUDINARY_CLOUD_NAME}`, 
    api_key: `${process.env.CLOUDINARY_API_KEY}`, 
    api_secret: `${process.env.CLOUDINARY_API_SECRET}` 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        //console.log("error just after try");
        if(!localFilePath) return null; //could not find the path
        //console.log("error after !localfilepath");
        
        //upload the file on cloudinary
        const response=await cloudinary.uploader.upload(localFilePath, {
            resource_type: "raw",
            // moderation: "none"
        })


        //file has been uploaded successfully
        //console.log("file has been uploaded on cloudinary", response.url);
        fs.unlinkSync(localFilePath)
        //console.log("unlink in try done");
        return response;

    } catch (error) {
        //ab agr itna ho chuka hai (localFilePath) hmko mil gya h, means image apne local server pr to ja chuki hai. but upload nhi huihai, to for safe cleaning purpose use delete krdena chaiye

        //fs.unlink se unlink hota but fs.unlinkSync means phle unlink kro hee tb he age bhado.
        //console.log("error in catch");
        
        fs.unlinkSync(localFilePath) //remove the locally saved temporary files as the upload operation got failed.
        //console.log("unlink in catch done");
        return null;
    }
} 
export {uploadOnCloudinary}