import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Axios from 'axios'

import LoadingDotsIcon from './LoadingDotsIcon'
import Post from './Post'

function ProfilePosts () {
  const [isLoading, setIsLoading] = useState(true)
  const [posts, setPosts] = useState([])
  const { username } = useParams()

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()

    async function fetchPosts () {
      try {
        const response = await Axios.get(`/profile/${username}/posts`, { cancelToken: ourRequest.token })
        setPosts(response.data)
        setIsLoading(false)
        // console.log(response.data)
      } catch (e) {
        console.log(e.response.data)
      }
    }
    fetchPosts()
    return () => {
      ourRequest.cancel()
    }
  }, [username])

  if (isLoading) return <LoadingDotsIcon />

  return (
    <div className='list-group'>
      {posts.length && posts.map(post => {
        return <Post post={post} key={post._id} noAuthor />
      })}
    </div>
  )
}

export default ProfilePosts
