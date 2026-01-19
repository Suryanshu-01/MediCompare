import multer from "multer";

import path from "path";

import fs from "fs";

const uploadDir="uploads";

if(!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,uploadDir);
    },
    filename: (req,file,cb)=>{
        const uniqueName= Date.now()+"-"+Math.round(Math.random() * 1e9);
        cb(null,uniqueName + path.extname(file.originalname));
    }
});


const fileFilter=(req,file,cb)=>{
    const allowedTypes=[
        "application/pdf",
        "image/jpeg",
        "image/png",
    ]
    
    if(!allowedTypes.includes(file.mimetype)){
        return cb(
            new Error("Only PDF,JPG and PNG files are allowed"),
            false
        )
    }
        cb(null,true);
}


const upload=multer({
    storage,
    limits:{
        fileSize:5*1024*1024,
    },
    fileFilter,
});

export default upload;