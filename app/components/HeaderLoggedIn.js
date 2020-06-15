import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import DispatchContext from '../DispatchContext'
import StateContext from '../StateContext'
import ReactTooltip from 'react-tooltip'

function HeaderLoggedIn (props) {
  const appDispatch = useContext(DispatchContext)
  const appState = useContext(StateContext)

  // Function to handle logging out.
  function handleLogout () {
    // Unset the State variable for logged in.
    appDispatch({ type: 'logout' })
  }

  function handleSearchIcon (e) {
    e.preventDefault()
    appDispatch({ type: 'openSearch' })
  }

  return (
    <div className='flex-row my-3 my-md-0'>
      <a onClick={handleSearchIcon} data-for='search' data-tip='Search' href='#' className='text-white mr-2 header-search-icon'>
        <i className='fas fa-search' />
        <ReactTooltip place='bottom' id='search' className='custom-tooltip' />
      </a>{' '}
      <span data-for='chat' data-tip='Chat' className='mr-2 header-chat-icon text-white'>
        <i className='fas fa-comment' />
        <span className='chat-count-badge text-white'> </span>
        <ReactTooltip place='bottom' id='chat' className='custom-tooltip' />
      </span>{' '}
      <Link to={`/profile/${appState.user.username}`} className='mr-2' data-for='profile' data-tip='My profile'>
        <img className='small-header-avatar' src={appState.user.avatar} />
      </Link>
      <ReactTooltip place='bottom' id='profile' className='custom-tooltip' />{' '}
      <Link className='btn btn-sm btn-success mr-2' to='/create-post'>
        Create Post
      </Link>{' '}
      <button onClick={handleLogout} className='btn btn-sm btn-secondary'>
        Sign Out
      </button>
    </div>
  )
}

export default HeaderLoggedIn
