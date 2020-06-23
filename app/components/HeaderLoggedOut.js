import React, { useContext, useEffect } from 'react'
import Axios from 'axios'
import DispatchContext from '../DispatchContext'
import { useImmerReducer } from 'use-immer'

function HeaderLoggedOut (props) {
  const appDispatch = useContext(DispatchContext)

  const initialLoginState = {
    username: {
      value: '',
      hasErrors: false
    },
    password: {
      value: '',
      hasErrors: false
    },
    submitCount: 0
  }

  function loginReducer (draft, action) {
    switch (action.type) {
      case 'usernameVerify':
        draft.username.hasErrors = false
        draft.username.value = action.value

        if (!draft.username.value.length) {
          draft.username.hasErrors = true
          appDispatch({ type: 'flashMessage', value: 'You need to enter a username.', style: 'danger' })
        }
        break
      case 'passwordVerify':
        draft.password.hasErrors = false
        draft.password.value = action.value

        if (!draft.password.value.length) {
          draft.password.hasErrors = true
          appDispatch({ type: 'flashMessage', value: 'You need to enter a password.', style: 'danger' })
        }
        break
      case 'submitForm':
        if (!draft.username.hasErrors && !draft.password.hasErrors) {
          draft.submitCount++
        } else if (draft.username.hasErrors && draft.password.hasErrors) {
          appDispatch({ type: 'flashMessage', value: 'You need to enter a username and password.', style: 'danger' })
        }
        break
    }
  }

  const [state, dispatch] = useImmerReducer(loginReducer, initialLoginState)

  useEffect(() => {
    if (state.submitCount) {
      // Send Axios request if submitCount is non-zero.
      const loginRequest = Axios.CancelToken.source()
      /* eslint-disable no-inner-declarations */
      async function fetchResults () {
        try {
          const response = await Axios.post('/login', { username: state.username.value, password: state.password.value }, { cancelToken: loginRequest.token })
          appDispatch({ type: 'login', data: response.data })
          appDispatch({ type: 'flashMessage', value: 'You have successfully logged in.' })
        } catch (e) {
          appDispatch({ type: 'flashMessage', value: 'Incorrect username/passwords.', style: 'danger' })
          console.log(e.response.data)
        }
      }

      fetchResults()
      return () => loginRequest.cancel()
    }
  }, [state.submitCount])

  async function handleSubmit (e) {
    e.preventDefault()
    dispatch({ type: 'usernameVerify', value: state.username.value })
    dispatch({ type: 'passwordVerify', value: state.password.value })
    dispatch({ type: 'submitForm' })
  }

  return (
    <form onSubmit={handleSubmit} className='mb-0 pt-2 pt-md-0'>
      <div className='row align-items-center'>
        <div className='col-md mr-0 pr-md-0 mb-3 mb-md-0'>
          <input onChange={e => dispatch({ type: 'usernameVerify', value: e.target.value })} name='username' className={'form-control form-control-sm input-dark ' + (state.username.hasErrors ? 'is-invalid' : '')} type='text' placeholder='Username' autoComplete='off' />
        </div>
        <div className='col-md mr-0 pr-md-0 mb-3 mb-md-0'>
          <input onChange={e => dispatch({ type: 'passwordVerify', value: e.target.value })} name='password' className={'form-control form-control-sm input-dark ' + (state.password.hasErrors ? 'is-invalid' : '')} type='password' placeholder='Password' />
        </div>
        <div className='col-md-auto'>
          <button className='btn btn-success btn-sm'>Sign In</button>
        </div>
      </div>
    </form>
  )
}

export default HeaderLoggedOut
