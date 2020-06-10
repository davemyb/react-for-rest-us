import React, { useContext, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Axios from 'axios'
import StateContext from '../StateContext'

import Page from './Page'
import ProfilePosts from './ProfilePosts'

function Profile () {
  const { username } = useParams()
  const appState = useContext(StateContext)
  const [profileData, setProfileData] = useState({
    profileUsername: '...',
    profileAvatar: 'https://gravatar.com/avatar/placeholder?s=128',
    isFollowing: false,
    counts: { postCount: '', followerCount: '', followingCount: '' }
  })

  // Empty array at the end of useEffect means only run this once.
  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()

    async function fetchData () {
      try {
        const response = await Axios.post(`/profile/${username}`, { token: appState.user.token }, { cancelToken: ourRequest.token })
        setProfileData(response.data)
        console.log(response.data)
      } catch (e) {
        console.log(e.response.data)
      }
    }
    fetchData()
    return () => {
      ourRequest.cancel()
    }
  }, [])

  return (
    <Page title='Profile Page'>
      <h2>
        <img className='avatar-small' src={profileData.profileAvatar} />{profileData.profileUsername}
        <button className='btn btn-primary btn-sm ml-2'>Follow <i className='fas fa-user-plus' /></button>
      </h2>

      <div className='profile-nav nav nav-tabs pt-2 mb-4'>
        <Link to='#' className='active nav-item nav-link'>
          Posts: {profileData.counts.postCount}
        </Link>
        <Link to='#' className='nav-item nav-link'>
          Followers: {profileData.counts.followerCount}
        </Link>
        <Link to='#' className='nav-item nav-link'>
          Following: {profileData.counts.followingCount}
        </Link>
      </div>

      <ProfilePosts />
    </Page>
  )
}

export default Profile
