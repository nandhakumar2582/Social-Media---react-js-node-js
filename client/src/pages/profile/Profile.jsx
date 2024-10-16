import "./profile.scss";
import Posts from "../../components/posts/Posts"
import { makeRequest } from '../../axios'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/authContext";
import Update from "../../components/update/Update"

const Profile = () => {
  const [openUpdate, setOpenUpdate] = useState(false)
  const { currentUser } = useContext(AuthContext)
  const userId = parseInt(useLocation().pathname.split("/")[2])
  
  const { isLoading, error, data } = useQuery({
    queryKey:['user'], 
    queryFn:() => makeRequest.get("/users/find/"+userId).then(res => {
      return res.data
    })
  })

  console.log(data);

  const { isLoading: rIsLoading,data: relationshipData } = useQuery({
    queryKey:['relationship'], 
    queryFn:() => makeRequest.get("/relationships?followedUserId="+userId).then(res => {
      return res.data
    })
  })

  console.log("relationshipData",relationshipData);
  if(relationshipData)
  console.log(relationshipData.includes(currentUser.id), currentUser)
  const queryClient = useQueryClient()
  const {mutate} = useMutation({
    mutationFn: (following)=>{
    if(following)
      return makeRequest.delete("/relationships?userId="+userId)
    return makeRequest.post("/relationships", {userId})
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relationship'] })
    }
   })
  const handleFollow = () => {
    mutate(relationshipData.includes(currentUser.id))
  }
  
  return (
    <div className="profile">
      {isLoading?("Loading"):
      (
       <>
        <div className="images">
          <img
            src={data.coverPic?data.coverPic:"./images/default_profilePic.jpg"}
            className="cover"
          />
          <img
            src={data.profilePic?data.profilePic:"./images/default_profilePic.jpg"}
            className="profilePic"
          />
        </div>
        <div className="profileContainer">
          <div className="uInfo">
            <div className="left">
             
            </div>
            <div className="center">
              <span>{data.name}</span>
              <div className="info">
                <div className="item">
                  {/* <PlaceIcon /> */}
                  <span>{data.city}</span>
                </div>
                <div className="item">
                  {/* <LanguageIcon /> */}
                  <span>{data.website}</span>
                </div>
              </div>
              {rIsLoading ? "Loading" :userId === currentUser.id? (<button onClick={()=>setOpenUpdate(true)}>update</button>) : (<button onClick={handleFollow}>{relationshipData.includes(currentUser.id)?"Unfollow":"Follow"}</button>)}
            </div>
            <div className="right">
              {/* <EmailOutlinedIcon />
              <MoreVertIcon /> */}
            </div>
          </div>
        <Posts userId = {userId}/>
        </div>
      </>)}
      {openUpdate && <Update setOpenUpdate={setOpenUpdate} user={data}/>}
    </div>
   
  );
};

export default Profile;