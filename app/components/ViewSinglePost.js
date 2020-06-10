import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Axios from 'axios'
import ReactMarkdown from 'react-markdown'

import Page from './Page'
import LoadingDotsIcon from './LoadingDotsIcon'

function ViewSinglePost () {
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
  }, [])

  if (isLoading) return <Page title='...'><LoadingDotsIcon /></Page>

  const date = new Date(post.createdDate)
  const dateFormatted = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`

  return (
    <Page title={post.title}>
      <div className='d-flex justify-content-between'>
        <h2>{post.title}</h2>
        <span className='pt-2'>
          <Link to='/post' className='text-primary mr-2' title='Edit'><i className='fas fa-edit' /></Link>
          <Link className='delete-post-button text-danger' title='Delete'><i className='fas fa-trash' /></Link>
        </span>
      </div>

      <p className='text-muted small mb-4'>
        <Link to={`/profile/${post.author.username}`}>
          <img className='avatar-tiny' src={post.author.avatar} />
        </Link>
        Posted by <Link to={`/profile/${post.author.username}`}>{post.author.username}</Link> on {dateFormatted}
      </p>

      <div className='body-content'>
        <ReactMarkdown source={post.body} allowedTypes={['paragraph', 'strong', 'emphasis', 'text', 'headings', 'list', 'listitem']} />
      </div>
    </Page>
  )
}

export default ViewSinglePost
