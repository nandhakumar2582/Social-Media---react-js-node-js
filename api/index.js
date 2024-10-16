import express from "express";
import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/users.js"
import postRoutes from "./routes/posts.js"
import commentRoutes from "./routes/comments.js"
import likeRoutes from "./routes/likes.js"
import relationshipRoutes from "./routes/relationships.js"
import searchRoutes from "./routes/search.js"
import cors from "cors"
import cookieParser from "cookie-parser";
import { db } from "./connect.js";

const app = express()

//middlewares
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Credentials", true)
    next()
})
app.use(express.json())
app.use(cors({
    origin: "http://localhost:3000"
}))
app.use(cookieParser())



app.post("/api/upload",(req, res)=>{
    const file = req.file

    res.status(200).json(file.filename)
})
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/comments", commentRoutes)
app.use("/api/likes", likeRoutes)
app.use("/api/relationships", relationshipRoutes)
app.use("/api/search", searchRoutes)

app.listen(8000,() => {
    if(db){
        console.log("connected");
       //r console.log(db);
    }
    console.log("API working!");
})