import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { useImmerReducer } from 'use-immer'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
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
import CreatePost from './components/CreatePost'
import ViewSinglePost from './components/ViewSinglePost'
import FlashMessages from './components/FlashMessages'
import Profile from './components/Profile'

Axios.defaults.baseURL = 'http://localhost:8081'

function Main () {
  const initialState = {
    loggedIn: Boolean(window.localStorage.getItem('complexappToken')),
    flashMessages: [],
    user: {
      token: window.localStorage.getItem('complexappToken'),
      username: window.localStorage.getItem('complexappUsername'),
      avatar: window.localStorage.getItem('complexappAvatar')
    }
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
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState)

  useEffect(() => {
    // If just logged in.
    if (state.loggedIn) {
      window.localStorage.setItem('complexappToken', state.user.token)
      window.localStorage.setItem('complexappUsername', state.user.username)
      window.localStorage.setItem('complexappAvatar', state.user.avatar)
    }
    // Else they logged out.
    else {
      window.localStorage.removeItem('complexappToken')
      window.localStorage.removeItem('complexappUsername')
      window.localStorage.removeItem('complexappAvatar')
    }
  }, [state.loggedIn])

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessages messages={state.flashMessages} />
          <Header />
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
            <Route path='/create-post' exact>
              <CreatePost />
            </Route>
            <Route path='/profile/:username' exact>
              <Profile />
            </Route>
          </Switch>
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
