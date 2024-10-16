import "./post.scss";
import {ShareAltOutlined, HeartFilled, HeartOutlined, MoreOutlined, MessageFilled } from "@ant-design/icons"
import { Link } from "react-router-dom";
import Comments from "../comments/Comments";
import { useContext, useState } from "react";
import moment from "moment"
import { makeRequest } from '../../axios'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { AuthContext } from "../../context/authContext";
const Post = ({ post }) => {
  const [commentOpen, setCommentOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const {currentUser} = useContext(AuthContext)
  const queryClient = useQueryClient()
  const { isLoading, error, data } = useQuery({
    queryKey:['likes', post.id], 
    queryFn:() => makeRequest.get("/likes?postId="+post.id).then(res => {
      return res.data
    })
  }
  )
  const {mutate} = useMutation({
    mutationFn: (liked)=>{
    if(liked)
      return makeRequest.delete("/likes?postId="+post.id)
    return makeRequest.post("/likes", {postId:post.id})
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['likes'] })
    }
   })

  const deleteMutation = useMutation({
    mutationFn: (postId)=>{
      return makeRequest.delete("/posts/"+post.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    }
   })

  const handleLike = () => {
    mutate(data.includes(currentUser.id))
  }

  const handleDelete = () => {
    deleteMutation.mutate(post.id)
  }
  
  return (
    <div className="post">
      <div className="container">
        <div className="user">
          <div className="userInfo">
            <img src={post.profilePic?post.profilePic:"./images/default_profilePic.jpg"} />
            <div className="details">
              <Link
                to={`/profile/${post.userId}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="name">{post.name}</span>
              </Link>
              <span className="date">{moment(post.createdAt).fromNow()}</span>
            </div>
          </div>
          <MoreOutlined onClick={()=>setMenuOpen(!menuOpen)}/>
           {menuOpen && post.userId === currentUser.id && <button onClick={handleDelete}>delete</button>}
        </div>
        <div className="content">
          <p>{post.desc}</p>
          <img src={post.img} alt="" />
        </div>
        <div className="info">
          <div className="item like" onClick={handleLike}>
             {isLoading? "loading": data.includes(currentUser.id) ? <HeartFilled  style={{color: "red"}} /> : <HeartOutlined  />}
             <span>{data?data.length:0} Likes</span>
          </div> 
          <div className="item comment" onClick={() => setCommentOpen(!commentOpen)}>
            <MessageFilled />
            <span>comments</span>
          </div>
          {/* <div className="item share">
             <ShareAltOutlined />
            <span>Share</span>
          </div> */}
        </div>
        {commentOpen && <Comments postId = {post.id}/>}
      </div>
    </div>
  );
};

export default Post;