import { v2 as fileagent } from "cloudinary";
import fs from "fs";

fileagent.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadfile = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // fileagent upload file
    const response = await fileagent.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file was uploaded succesfully by file agent
    //console.log("hurray", response);
    /*
    {
      asset_id: '7673c955f322d84adcd39978f46fba9e',
      public_id: 'rirnwocfeyagv1vzzndq',
      version: 1719999978,
      version_id: 'f273789d56ece6d6823533e162699cc1',       
      signature: '363abccc2039688705ba75f65c6fbdf33a39a059',
      width: 818,
      height: 525,
      format: 'png',
      resource_type: 'image',
      created_at: '2024-07-03T09:46:18Z',
      tags: [],
      bytes: 35145,
      type: 'upload',
      etag: '363bda68b2be7c3f7216165129b3cd7c',
      placeholder: false,
      url: 'http://res.cloudinary.com/dpgzyhipl/image/upload/v1719999978/rirnwocfeyagv1vzzndq.png',
      secure_url: 'https://res.cloudinary.com/dpgzyhipl/image/upload/v1719999978/rirnwocfeyagv1vzzndq.png',
      asset_folder: '',
      display_name: 'rirnwocfeyagv1vzzndq',
      original_filename: '1',
      original_extension: 'PNG-1719999976637-104417060',
      api_key: '813841374362737'
    }
    */ 
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    // remove the locally saved temp file as the uploaded operation got failed
    fs.unlinkSync(localFilePath);
    return null;
  }
};

// Delete from cloudnary
const deleteFromCloudinary = async(cloudinaryFilePath, resource_type) => {
  try {
    if (!cloudinaryFilePath) return null

    const publicId = cloudinaryFilePath.split("/").pop().split(".")[0];

    const response = await fileagent.uploader.destroy(publicId,{
      resource_type: resource_type
    })

    console.log(response)

    if (response.result !== "ok") {
      console.error("Cloudinary deletion failed:", response);
      return null;
    }
    
    return response

  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
    return null;
  }
}

export { uploadfile, deleteFromCloudinary }