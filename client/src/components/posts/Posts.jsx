import { useEffect } from 'react'
import { makeRequest } from '../../axios'
import Post from '../post/Post'
import './posts.scss'
import { useQuery } from '@tanstack/react-query'
const Posts = ({userId}) => {
  const { isLoading, error, data } = useQuery({
    queryKey:['posts'], 
    queryFn: () =>  makeRequest.get("/posts?userId="+userId).then(res => {
      return res.data
    }),
  }
)

if(error){
  console.log(error);
  return(
    <div className='posts'>
        Something went Wrong!
    </div>
  )
}

if(isLoading){
  return(
    <div className='posts'>
        "loading..." 
    </div>
  )
}

  return (
    <div className='posts'>
      {data&&data.map(post => (
            <div className='post'>
              <Post post = {post} key={post.id}/>
            </div>
          ))
      }
    </div>
  )
}

export default Posts