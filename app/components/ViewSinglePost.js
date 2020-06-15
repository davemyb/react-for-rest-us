import React, { useEffect, useState, useContext } from 'react'
import { Link, useParams, withRouter } from 'react-router-dom'
import Axios from 'axios'
import ReactMarkdown from 'react-markdown'
import ReactTooltip from 'react-tooltip'
import StateContext from '../StateContext'
import DispatchContext from '../DispatchContext'

import Page from './Page'
import LoadingDotsIcon from './LoadingDotsIcon'
import NotFound from './NotFound'

function ViewSinglePost (props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const { id } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [post, setPost] = useState()

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()

    async function fetchPost () {
      try {
        const response = await Axios.get(`/post/${id}`, { cancelToken: ourRequest.token })
        setPost(response.data)
        setIsLoading(false)
        console.log(response.data)
      } catch (e) {
        console.log(e.response.data)
      }
    }
    fetchPost()
    return () => {
      ourRequest.cancel()
    }
    // Dependency is [id] so that Axios request gets sent if you change post id e.g. from search results.
  }, [id])

  if (!isLoading && !post) {
    return (
      <NotFound />
    )
  }

  if (isLoading) return <Page title='...'><LoadingDotsIcon /></Page>

  const date = new Date(post.createdDate)
  const dateFormatted = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`

  function isOwner () {
    if (appState.loggedIn) {
      return appState.user.username === post.author.username
    }
    return false
  }

  async function deleteHandler () {
    const areYouSure = window.confirm('Do you really want to delete this post?')
    if (areYouSure) {
      try {
        const response = await Axios.delete(`/post/${id}`, { data: { token: appState.user.token } })
        if (response.data === 'Success') {
          // Display message that it was deleted.
          appDispatch({ type: 'flashMessage', value: 'Post was successfully deleted.' })
          // Redirect to profile page.
          props.history.push(`/profile/${appState.user.username}`)
        }
      } catch (e) {
        console.log(e.response.data)
      }
    }
  }

  return (
    <Page title={post.title}>
      <div className='d-flex justify-content-between'>
        <h2>{post.title}</h2>
        {isOwner() && (
          <span className='pt-2'>
            <Link to={`/post/${post._id}/edit`} data-tip='Edit' data-for='edit' className='text-primary mr-2'>
              <i className='fas fa-edit' />
            </Link>
            <ReactTooltip id='edit' className='custom-dash-tooltip' />
            {' '}
            <Link onClick={deleteHandler} to='#' data-tip='Delete' data-for='delete' className='delete-post-button text-danger'>
              <i className='fas fa-trash' />
            </Link>
            <ReactTooltip id='delete' className='custom-dash-tooltip' />
          </span>
        )}
      </div>

      <p className='text-muted small mb-4'>
        <Link to={`/profile/${post.author.username}`}>
          <img className='avatar-tiny' src={post.author.avatar} />
        </Link>
        Posted by <Link to={`/profile/${post.author.username}`}>{post.author.username}</Link> on {dateFormatted}
      </p>

      <div className='body-content'>
        <ReactMarkdown source={post.body} allowedTypes={['paragraph', 'strong', 'emphasis', 'text', 'heading', 'list', 'listItem']} />
      </div>
    </Page>
  )
}

export default withRouter(ViewSinglePost)
