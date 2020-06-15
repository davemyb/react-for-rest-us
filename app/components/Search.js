import React, { useContext, useEffect } from 'react'
import DispatchContext from '../DispatchContext'
import { useImmer } from 'use-immer'
import Axios from 'axios'

import Post from './Post'

function Search () {
  const appDispatch = useContext(DispatchContext)

  const [state, setState] = useImmer({
    searchTerm: '',
    results: [],
    show: 'neither',
    requestCount: 0
  })

  useEffect(() => {
    document.addEventListener('keyup', searchKeyPressHandler)

    // Return a clean up function to stop listening for ESC key.
    return () => document.removeEventListener('keyup', searchKeyPressHandler)
  }, [])

  // Watch for the search terms and then query with them. Wait for x time before
  // sending to server.
  useEffect(() => {
    if (state.searchTerm.trim()) {
      setState(draft => {
        // Set state to show the loading animation.
        draft.show = 'loading'
      })
      const delay = setTimeout(() => {
        setState(draft => {
          draft.requestCount++
        })
      }, 800)

      // Return to cancel the timeout so that it's not constantly sending requests.
      return () => clearTimeout(delay)
    } else {
      setState(draft => {
        // Set state to show nothing.
        draft.show = 'neither'
      })
    }
  }, [state.searchTerm])

  // Send request to Axios.
  useEffect(() => {
    if (state.requestCount) {
      // Send Axios request if requestCount is non-zero.
      const ourRequest = Axios.CancelToken.source()
      /* eslint-disable no-inner-declarations */
      async function fetchResults () {
        try {
          const response = await Axios.post('/search', { searchTerm: state.searchTerm }, { cancelToken: ourRequest.token })
          setState(draft => {
            draft.results = response.data
            // Set our state to show results.
            draft.show = 'results'
          })
        } catch (e) {
          console.log(e.response.data)
        }
      }

      fetchResults()
      return () => ourRequest.cancel()
    }
  }, [state.requestCount])

  // Logic that listens only for the ESC key.
  function searchKeyPressHandler (e) {
    if (e.keyCode === 27) {
      appDispatch({ type: 'closeSearch' })
    }
  }

  function handleInput (e) {
    const value = e.target.value
    setState(draft => {
      draft.searchTerm = value
    })
  }

  return (
    <div className='search-overlay'>
      <div className='search-overlay-top shadow-sm'>
        <div className='container container--narrow'>
          <label htmlFor='live-search-field' className='search-overlay-icon'>
            <i className='fas fa-search' />
          </label>
          <input onChange={handleInput} autoFocus type='text' autoComplete='off' id='live-search-field' className='live-search-field' placeholder='What are you interested in?' />
          <span onClick={() => appDispatch({ type: 'closeSearch' })} className='close-live-search'>
            <i className='fas fa-times-circle' />
          </span>
        </div>
      </div>

      <div className='search-overlay-bottom'>
        <div className='container container--narrow py-3'>
          <div className={'circle-loader ' + (state.show === 'loading' ? 'circle-loader--visible' : '')} />
          <div className={'live-search-results ' + (state.show === 'results' ? ' live-search-results--visible' : '')}>
            {// Show if there are results (length > 0).
            }
            {Boolean(state.results.length) && (
              <div className='list-group shadow-sm'>
                <div className='list-group-item active'><strong>Search Results</strong> ({state.results.length} {state.results.length > 1 || state.results.length === 0 ? 'items' : 'item'} found)</div>
                {state.results.map(post => {
                  return <Post post={post} key={post._id} onClick={() => appDispatch({ type: 'closeSearch' })} />
                })}
              </div>
            )}
            {// Show if no results.
            }
            {!state.results.length && (
              <p className='alert alert-danger text-center shadow-sm'>Sorry we could not find any results for that search.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Search
