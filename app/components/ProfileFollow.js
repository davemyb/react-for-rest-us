import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Axios from 'axios'

import LoadingDotsIcon from './LoadingDotsIcon'

function ProfileFollowers (props) {
  const [isLoading, setIsLoading] = useState(true)
  const [followers, setFollowers] = useState([])
  const { username } = useParams()

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()

    async function fetchFollowers () {
      try {
        const response = await Axios.get(`/profile/${username}/${props.action}`, { cancelToken: ourRequest.token })
        setFollowers(response.data)
        setIsLoading(false)
        // console.log(response.data)
      } catch (e) {
        console.log(e.response.data)
      }
    }
    fetchFollowers()
    return () => {
      ourRequest.cancel()
    }
  }, [username, props.action])

  if (isLoading) return <LoadingDotsIcon />

  return (
    <div className='list-group'>
      {!followers.length && props.action === 'followers' && (
        <p className='alert alert-warning text-center shadow-sm'>You have no followers yet.</p>
      )}

      {!followers.length && props.action === 'following' && (
        <p className='alert alert-warning text-center shadow-sm'>You are not following anyone yet.</p>
      )}

      {followers.map((follower, index) => {
        return (
          <Link key={index} to={`/profile/${follower.username}`} className='list-group-item list-group-item-action'>
            <img className='avatar-tiny' src={follower.avatar} /> {follower.username}
          </Link>
        )
      })}
    </div>
  )
}

export default ProfileFollowers
