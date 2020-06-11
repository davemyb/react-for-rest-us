import React, { useEffect, useContext } from 'react'
import { useImmerReducer } from 'use-immer'
import { Link, useParams, withRouter } from 'react-router-dom'
import Axios from 'axios'
import StateContext from '../StateContext'
import DispatchContext from '../DispatchContext'

import Page from './Page'
import LoadingDotsIcon from './LoadingDotsIcon'
import NotFound from './NotFound'

function EditPost (props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)

  const originalState = {
    title: {
      value: '',
      hasErrors: false,
      message: ''
    },
    body: {
      value: '',
      hasErrors: false,
      message: ''
    },
    isFetching: true,
    isSaving: false,
    id: useParams().id,
    sendCount: 0,
    notFound: false
  }

  function ourReducer (draft, action) {
    switch (action.type) {
      case 'fetchComplete':
        draft.title.value = action.value.title
        draft.body.value = action.value.body
        draft.isFetching = false
        break
      case 'titleChange':
        draft.title.hasErrors = false
        draft.title.value = action.value
        break
      case 'titleRules':
        if (!action.value.trim()) {
          draft.title.hasErrors = true
          draft.title.message = 'You must provide a title.'
        }
        break
      case 'bodyChange':
        draft.body.hasErrors = false
        draft.body.value = action.value
        break
      case 'bodyRules':
        if (!action.value.trim()) {
          draft.body.hasErrors = true
          draft.body.message = 'You must provide body text.'
        }
        break
      case 'submitRequest':
        if (!draft.title.hasErrors && !draft.body.hasErrors) {
          draft.sendCount++
        }
        break
      case 'saveRequestStarted':
        draft.isSaving = true
        break
      case 'saveRequestFinished':
        draft.isSaving = false
        break
      case 'notFound':
        draft.notFound = true
        break
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, originalState)

  function submitHandler (e) {
    e.preventDefault()
    dispatch({ type: 'titleRules', value: state.title.value })
    dispatch({ type: 'bodyRules', value: state.body.value })
    dispatch({ type: 'submitRequest' })
  }

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()

    async function fetchPost () {
      try {
        const response = await Axios.get(`/post/${state.id}`, { cancelToken: ourRequest.token })
        if (response.data) {
          dispatch({ type: 'fetchComplete', value: response.data })
          if (appState.user.username !== response.data.author.username) {
            appDispatch({ type: 'flashMessage', value: 'You don\'t have permission to edit that post.' })
            // Redirect to home page if access denied.
            props.history.push('/')
          }
        } else {
          dispatch({ type: 'notFound' })
        }
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

  useEffect(() => {
    if (state.sendCount) {
      dispatch({ type: 'saveRequestStarted' })
      const ourRequest = Axios.CancelToken.source()

      /* eslint-disable no-inner-declarations */
      async function fetchPost () {
        try {
          const response = await Axios.post(`/post/${state.id}/edit`, { title: state.title.value, body: state.body.value, token: appState.user.token }, { cancelToken: ourRequest.token })
          dispatch({ type: 'saveRequestFinished' })
          appDispatch({ type: 'flashMessage', value: 'Post was updated' })
          console.log(response.data)
        } catch (e) {
          console.log(e.response.data)
        }
      }
      fetchPost()
      return () => {
        ourRequest.cancel()
      }
    }
  }, [state.sendCount])

  if (state.notFound) {
    return (
      <NotFound />
    )
  }

  if (state.isFetching) return <Page title='...'><LoadingDotsIcon /></Page>

  return (
    <Page title='Edit Post'>
      <Link className='small' to={`/post/${state.id}`}>&laquo; View the post</Link>
      <form className='mt-3' onSubmit={submitHandler}>
        <div className='form-group'>
          <label htmlFor='post-title' className='text-muted mb-1'>
            <small>Title</small>
          </label>
          <input onBlur={e => dispatch({ type: 'titleRules', value: e.target.value })} onChange={e => dispatch({ type: 'titleChange', value: e.target.value })} value={state.title.value} autoFocus name='title' id='post-title' className='form-control form-control-lg form-control-title' type='text' placeholder='' autoComplete='off' />
          {state.title.hasErrors &&
            <div className='alert alert-danger small liveValidateMessage'>{state.title.message}</div>}
        </div>

        <div className='form-group'>
          <label htmlFor='post-body' className='text-muted mb-1 d-block'>
            <small>Body Content</small>
          </label>
          <textarea onBlur={e => dispatch({ type: 'bodyRules', value: e.target.value })} onChange={e => dispatch({ type: 'bodyChange', value: e.target.value })} value={state.body.value} name='body' id='post-body' className='body-content tall-textarea form-control' type='text' />
          {state.body.hasErrors &&
            <div className='alert alert-danger small liveValidateMessage'>{state.body.message}</div>}
        </div>

        <button disabled={state.isSaving} className='btn btn-primary'>Save Updates</button>
      </form>
    </Page>
  )
}

export default withRouter(EditPost)
