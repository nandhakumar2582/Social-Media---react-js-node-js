import { db } from "../connect.js"
import jwt from "jsonwebtoken"
import multer from "multer";
import {v2 as cloudinary} from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
})
const storage = multer.memoryStorage()
  
const upload = multer({ storage: storage })
export const getUser = (req, res) => {
    const userId = req.params.userId
    const q = "SELECT * FROM users WHERE id = ?"
    
  db.query(q, [userId], (err, data) => {
    if(err) return res.status(500).json(err)
    const {password, ...info} = data[0]
    return res.status(200).json(info)
  })
}

export const updateUser = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token,  process.env.ACCESS_TOKEN_SECRET, (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    upload.fields([{ name: 'profile_image', maxCount: 1 }, { name: 'cover_image', maxCount: 1 }])(req, res, async (err) => {
      if (err) return res.status(500).json(err);

      try {
        const profilePicFile = req.files['profile_image'] ? req.files['profile_image'][0] : null;
        const coverPicFile = req.files['cover_image'] ? req.files['cover_image'][0] : null;

        let profilePicSecureUrl = null;
        let coverPicSecureUrl = null;

        if (profilePicFile) {
          const profilePicResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream((error, result) => {
              if (error) reject("Error uploading profile picture to Cloudinary");
              resolve(result);
            }).end(profilePicFile.buffer);
          });
          profilePicSecureUrl = profilePicResult.secure_url;
        }

        if (coverPicFile) {
          const coverPicResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream((error, result) => {
              if (error) reject("Error uploading cover picture to Cloudinary");
              resolve(result);
            }).end(coverPicFile.buffer);
          });
          coverPicSecureUrl = coverPicResult.secure_url;
        }

        const q = "UPDATE users SET `name` = ?, `city` = ?, `website` = ?, `profilePic` = ?, `coverPic` = ? WHERE id = ?";
        db.query(q, [
          req.body.name,
          req.body.city,
          req.body.website,
          profilePicSecureUrl || req.body.profile_image, 
          coverPicSecureUrl || req.body.cover_image, 
          userInfo.id
        ], (err, data) => {
          if (err) return res.status(500).json(err);
          if (data.affectedRows > 0) return res.json("Updated!");
          return res.status(403).json("You can update only your post");
        });
      } catch (error) {
        res.status(500).json(error);
      }
    });
  });
};
