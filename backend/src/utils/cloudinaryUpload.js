import fs from "fs";
import cloudinary from "../config/cloudinary.js";


const uploadToCloudinary = async (filepath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filepath, {
      resource_type: "auto",
      folder: options.folder || "Medi-Compare/Hospital-Documents",
    });
    
    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
    };
  } finally {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  }
};

export default uploadToCloudinary;
