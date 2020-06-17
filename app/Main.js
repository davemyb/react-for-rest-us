import React, { useEffect, Suspense } from 'react'
import ReactDOM from 'react-dom'
import { useImmerReducer } from 'use-immer'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { CSSTransition } from 'react-transition-group'
import Axios from 'axios'
import StateContext from './StateContext'
import DispatchContext from './DispatchContext'

// Custom components.
import Header from './components/Header'
import HomeGuest from './components/HomeGuest'
import Home from './components/Home'
import Footer from './components/Footer'
import About from './components/About'
import Terms from './components/Terms'
import FlashMessages from './components/FlashMessages'
import Profile from './components/Profile'
import EditPost from './components/EditPost'
import NotFound from './components/NotFound'
import Search from './components/Search'
import Chat from './components/Chat'
import LoadingDotsIcon from './components/LoadingDotsIcon'
// Lazy-load bigger components, or ones not used often at all. Uses 'Suspense'
const ViewSinglePost = React.lazy(() => import('./components/ViewSinglePost'))
const CreatePost = React.lazy(() => import('./components/CreatePost'))

Axios.defaults.baseURL = 'http://localhost:8081'

function Main () {
  const initialState = {
    loggedIn: Boolean(window.localStorage.getItem('complexappToken')),
    flashMessages: [],
    user: {
      token: window.localStorage.getItem('complexappToken'),
      username: window.localStorage.getItem('complexappUsername'),
      avatar: window.localStorage.getItem('complexappAvatar')
    },
    isSearchOpen: false,
    isChatOpen: false,
    unreadChatCount: 0
  }

  function ourReducer (draft, action) {
    switch (action.type) {
      case 'login':
        draft.loggedIn = true
        draft.user = action.data
        break
      case 'logout':
        draft.loggedIn = false
        break
      case 'flashMessage':
        draft.flashMessages.push(action.value)
        break
      case 'openSearch':
        draft.isSearchOpen = true
        break
      case 'closeSearch':
        draft.isSearchOpen = false
        break
      case 'toggleChat':
        draft.isChatOpen = !draft.isChatOpen
        break
      case 'closeChat':
        draft.isChatOpen = false
        break
      case 'incrementUnreadChatCount':
        draft.unreadChatCount++
        break
      case 'clearUnreadChatCount':
        draft.unreadChatCount = 0
        break
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState)

  useEffect(() => {
    // If just logged in.
    if (state.loggedIn) {
      window.localStorage.setItem('complexappToken', state.user.token)
      window.localStorage.setItem('complexappUsername', state.user.username)
      window.localStorage.setItem('complexappAvatar', state.user.avatar)
    } else {
      // Else they logged out.
      window.localStorage.removeItem('complexappToken')
      window.localStorage.removeItem('complexappUsername')
      window.localStorage.removeItem('complexappAvatar')
    }
  }, [state.loggedIn])

  // Check if server token is still valid on first render of app.
  useEffect(() => {
    if (state.loggedIn) {
      // Send Axios request.
      const ourRequest = Axios.CancelToken.source()
      /* eslint-disable no-inner-declarations */
      async function fetchResults () {
        try {
          const response = await Axios.post('/checkToken', { token: state.user.token }, { cancelToken: ourRequest.token })
          if (!response.data) {
            dispatch({ type: 'logout' })
            dispatch({ type: 'flashMessage', value: 'Your session has expired, please log in again.' })
          }
        } catch (e) {
          console.log(e.response.data)
        }
      }

      fetchResults()
      return () => ourRequest.cancel()
    }
  }, [])

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessages messages={state.flashMessages} />
          <Header />
          <Suspense fallback={<LoadingDotsIcon />}>
            <Switch>
              <Route path='/' exact>
                {state.loggedIn ? <Home /> : <HomeGuest />}
              </Route>
              <Route path='/about-us' exact>
                <About />
              </Route>
              <Route path='/terms' exact>
                <Terms />
              </Route>
              <Route path='/post/:id' exact>
                <ViewSinglePost />
              </Route>
              <Route path='/post/:id/edit' exact>
                <EditPost />
              </Route>
              <Route path='/create-post' exact>
                <CreatePost />
              </Route>
              <Route path='/profile/:username'>
                <Profile />
              </Route>
              <Route>
                <NotFound />
              </Route>
            </Switch>
          </Suspense>
          <CSSTransition timeout={330} in={state.isSearchOpen} classNames='search-overlay' unmountOnExit>
            <Search />
          </CSSTransition>
          <Chat />
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}

ReactDOM.render(<Main />, document.querySelector('#app'))

if (module.hot) {
  module.hot.accept()
}
