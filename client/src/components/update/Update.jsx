import { useState } from "react"
import "./update.scss"
import { makeRequest } from "../../axios"
import { useQueryClient, useMutation } from "@tanstack/react-query"

const Update = ({setOpenUpdate, user}) => {

  const [cover, setCover] = useState(null)
  const [profile, setProfile] = useState(null)
  const[texts, setTexts] = useState({
    name:"",
    city:"",
    website:""
  })

  const handleChange = (e) => {
    setTexts((prev) => ({...prev, [e.target.name]: [e.target.value]}))
  }
  const queryClient = useQueryClient()
  const {mutate} = useMutation({
    mutationFn: (user)=>{
     return makeRequest.put("/users", user)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
    }
   })
  const handleClick = async (e) => {
    e.preventDefault()
 
    let coverImg = cover ? cover : user.coverPic
    let profileImg = profile ? profile : user.profilePic
    let newName = texts.name ? texts.name : user.name
    let newCity = texts.city ? texts.city : user.city
    let newWebsite = texts.website ? texts.website : user.website

    const formData = new FormData()
    formData.append("profile_image", profileImg)
    formData.append("cover_image", coverImg)
    formData.append("name", newCity)
    formData.append("city", newCity)
    formData.append("website", newWebsite)
    mutate(formData)
    setOpenUpdate(false)
    setCover(null);
    setProfile(null);
  }

 
  return (
    <div className="update">
      Update
      <form>
        <input type="file"  onChange={(e) => setCover(e.target.files[0])}/>
        <input type="file"  onChange={(e) => setProfile(e.target.files[0])}/>
        <input type="text" name="name" onChange={handleChange}/>
        <input type="text" name="city" onChange={handleChange}/>
        <input type="text" name="website" onChange={handleChange}/>
        <button onClick={handleClick}>Update</button>
      </form>
      <button onClick={()=>setOpenUpdate(false)}>X</button>
    </div>
  )
}

export default Update