import React, { useContext, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import Axios from 'axios'
import { useImmer } from 'use-immer'
import StateContext from '../StateContext'

import Page from './Page'
import ProfilePosts from './ProfilePosts'

function Profile () {
  const { username } = useParams()
  const appState = useContext(StateContext)
  const [state, setState] = useImmer({
    followActionLoading: false,
    startFollowingRequestCount: 0,
    stopFollowingRequestCount: 0,
    profileData: {
      profileUsername: '...',
      profileAvatar: 'https://gravatar.com/avatar/placeholder?s=128',
      isFollowing: false,
      counts: { postCount: '', followerCount: '', followingCount: '' }
    }
  })

  // Empty array at the end of useEffect means only run this once.
  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()

    async function fetchData () {
      try {
        const response = await Axios.post(`/profile/${username}`, { token: appState.user.token }, { cancelToken: ourRequest.token })
        setState(draft => {
          draft.profileData = response.data
        })
        console.log(response.data)
      } catch (e) {
        console.log(e.response.data)
      }
    }
    fetchData()
    return () => {
      ourRequest.cancel()
    }
  }, [username])

  useEffect(() => {
    if (state.startFollowingRequestCount) {
      setState(draft => {
        draft.followActionLoading = true
      })
      const ourRequest = Axios.CancelToken.source()

      /* eslint-disable no-inner-declarations */
      async function fetchData () {
        try {
          const response = await Axios.post(`/addFollow/${state.profileData.profileUsername}`, { token: appState.user.token }, { cancelToken: ourRequest.token })
          setState(draft => {
            draft.profileData.isFollowing = true
            draft.profileData.counts.followerCount++
            draft.followActionLoading = false
          })
          console.log(response.data)
        } catch (e) {
          console.log(e.response.data)
        }
      }
      fetchData()
      return () => {
        ourRequest.cancel()
      }
    }
  }, [state.startFollowingRequestCount])

  useEffect(() => {
    if (state.stopFollowingRequestCount) {
      setState(draft => {
        draft.followActionLoading = true
      })
      const ourRequest = Axios.CancelToken.source()

      /* eslint-disable no-inner-declarations */
      async function fetchData () {
        try {
          const response = await Axios.post(`/removeFollow/${state.profileData.profileUsername}`, { token: appState.user.token }, { cancelToken: ourRequest.token })
          setState(draft => {
            draft.profileData.isFollowing = false
            draft.profileData.counts.followerCount--
            draft.followActionLoading = false
          })
          console.log(response.data)
        } catch (e) {
          console.log(e.response.data)
        }
      }
      fetchData()
      return () => {
        ourRequest.cancel()
      }
    }
  }, [state.stopFollowingRequestCount])

  function startFollowing () {
    setState(draft => {
      draft.startFollowingRequestCount++
    })
  }

  function stopFollowing () {
    setState(draft => {
      draft.stopFollowingRequestCount++
    })
  }

  return (
    <Page title='Profile Page'>
      <h2>
        <img className='avatar-small' src={state.profileData.profileAvatar} />{state.profileData.profileUsername}
        {appState.loggedIn && !state.profileData.isFollowing && appState.user.username !== state.profileData.profileUsername && state.profileData.profileUsername !== '...' && (
          <button onClick={startFollowing} disabled={state.followActionLoading} className='btn btn-primary btn-sm ml-2'>Follow <i className='fas fa-user-plus' /></button>
        )}
        {appState.loggedIn && state.profileData.isFollowing && appState.user.username !== state.profileData.profileUsername && state.profileData.profileUsername !== '...' && (
          <button onClick={stopFollowing} disabled={state.followActionLoading} className='btn btn-danger btn-sm ml-2'>Stop Following  <i className='fas fa-user-times' /></button>
        )}
      </h2>

      <div className='profile-nav nav nav-tabs pt-2 mb-4'>
        <Link to='#' className='active nav-item nav-link'>
          Posts: {state.profileData.counts.postCount}
        </Link>
        <Link to='#' className='nav-item nav-link'>
          Followers: {state.profileData.counts.followerCount}
        </Link>
        <Link to='#' className='nav-item nav-link'>
          Following: {state.profileData.counts.followingCount}
        </Link>
      </div>

      <ProfilePosts />
    </Page>
  )
}

export default Profile
