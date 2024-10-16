import moment from "moment/moment.js";
import {db} from "../connect.js" 
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

export const getPosts = (req, res) => {
    const userId = req.query.userId
    const token = req.cookies.accessToken;
    if(!token) return res.status(401).json("Not logged in!")
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, userInfo) => {
            if(err) return res.status(403).json("Token is not valid!")

            const q =
            userId !== "undefined"
              ? `SELECT p.*, u.id AS userId, name, profilePic FROM posts AS p JOIN users AS u ON (u.id = p.userId) WHERE p.userId = ? ORDER BY p.createdAt DESC`
              : `SELECT p.*, u.id AS userId, name, profilePic FROM posts AS p JOIN users AS u ON (u.id = p.userId)
          LEFT JOIN relationships AS r ON (p.userId = r.followedUserId) WHERE r.followerUserId= ? OR p.userId =?
          ORDER BY p.createdAt DESC`;
            const values = userId !== "undefined" ? [userId] : [userInfo.id, userInfo.id];
            db.query(q, values, (err, data)=>{
                if(err) return res.status(500).json(err)
                return res.status(200).json(data)
            })
    }) 
}

export const addPost = (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not logged in!");

    jwt.verify(token,  process.env.ACCESS_TOKEN_SECRET, (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        upload.single("file")(req, res, (err) => {
            if (err) return res.status(500).json(err);

            const imageFile = req.file;
            const { originalname, mimetype, buffer } = imageFile;

            cloudinary.uploader.upload_stream((error, result) => {
                if (error) {
                    console.error("Error uploading image to Cloudinary:", error);
                    return res.status(500).json("Error uploading image to Cloudinary");
                }

                const { public_id, secure_url } = result;
                const q = "INSERT INTO posts (`desc`, `img`, `createdAt`, `userId`) VALUES (?, ?, ?, ?)";
                const values = [
                    req.body.desc,
                    secure_url,
                    moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                    userInfo.id
                ];

                db.query(q, [...values], (dbErr, data) => {
                    if (dbErr) {
                        console.error("Error inserting post into database:", dbErr);
                        return res.status(500).json("Error inserting post into database");
                    }

                    return res.status(200).json("Post has been created");
                });
            }).end(buffer);
        });
    });
};


export const deletePost = (req, res) => {
    const token = req.cookies.accessToken;
    if(!token) return res.status(401).json("Not logged in!")
        jwt.verify(token,  process.env.ACCESS_TOKEN_SECRET, (err, userInfo) => {
            if(err) return res.status(403).json("Token is not valid!")
            const q = "DELETE FROM posts WHERE `id` = ? AND `userId` = ?"
           
        db.query(q, [req.params.id, userInfo.id], (err, data)=>{
            if(err) return res.status(500).json(err)
            if(data.affectedRows > 0) return res.status(200).json("Post has been deleted")
            return res.status(403).json("You can delete only your post")
        })
    }) 
}