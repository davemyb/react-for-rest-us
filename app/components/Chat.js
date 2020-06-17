import React, { useEffect, useContext, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useImmer } from 'use-immer'
import StateContext from '../StateContext'
import DispatchContext from '../DispatchContext'
import io from 'socket.io-client'

function Chat () {
  // Set a ref to the socket. Must use socket.current everywhere.
  const socket = useRef(null)
  const chatField = useRef(null)
  const chatLog = useRef(null)
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const [state, setState] = useImmer({
    fieldValue: '',
    chatMessages: []
  })

  // When chat is opened, give focus to the chat input field.
  useEffect(() => {
    if (appState.isChatOpen) {
      chatField.current.focus()
      appDispatch({ type: 'clearUnreadChatCount' })
    }
  }, [appState.isChatOpen])

  useEffect(() => {
    // Scroll chat log to bottom, so most recent is always visible.
    // Triggers on any new message.
    chatLog.current.scrollTop = chatLog.current.scrollHeight
    // Add to unread counter if messages and chat is closed.
    if (state.chatMessages.length && !appState.isChatOpen) {
      appDispatch({ type: 'incrementUnreadChatCount' })
    }
  }, [state.chatMessages])

  useEffect(() => {
    // Reconnect to socket when logged in.
    socket.current = io('http://localhost:8081')
    // Receive messages from chat server and add to state.
    socket.current.on('chatFromServer', message => {
      setState((draft) => {
        draft.chatMessages.push(message)
      })
    })

    return () => socket.current.disconnect()
  }, [])

  function handleFieldChange (e) {
    // Preset the value to the input field value, as it can't be done inside a
    // second level function (setState in this case)
    const value = e.target.value
    setState((draft) => {
      // Grab chat text input value from above and save it to state.
      draft.fieldValue = value
    })
  }

  function handleChatSubmit (e) {
    e.preventDefault()
    // Send message to chat server
    socket.current.emit('chatFromBrowser', { message: state.fieldValue, token: appState.user.token })

    setState((draft) => {
      // Add message to state collection of messages.
      draft.chatMessages.push({ message: draft.fieldValue, username: appState.user.username, avatar: appState.user.avatar })
      // Empty input field once submitted.
      draft.fieldValue = ''
    })
  }

  return (
    <div id='chat-wrapper' className={'chat-wrapper shadow border-top border-left border-right ' + (appState.isChatOpen ? 'chat-wrapper--is-visible' : '')}>
      <div className='chat-title-bar bg-primary'>
        Chat
        <span onClick={() => appDispatch({ type: 'closeChat' })} className='chat-title-bar-close'>
          <i className='fas fa-times-circle' />
        </span>
      </div>
      <div ref={chatLog} id='chat' className='chat-log'>
        {state.chatMessages.map((message, index) => {
          if (message.username === appState.user.username) {
            return (
              <div key={index} className='chat-self'>
                <div className='chat-message'>
                  <div className='chat-message-inner'>{message.message}</div>
                </div>
                <img className='chat-avatar avatar-tiny' src={message.avatar} />
              </div>
            )
          }

          return (
            <div key={index} className='chat-other'>
              <Link to={`/profile/${message.username}`}>
                <img className='avatar-tiny' src={message.avatar} />
              </Link>
              <div className='chat-message'>
                <div className='chat-message-inner'>
                  <Link to={`/profile/${message.username}`}>
                    <strong>{message.username}: </strong>
                  </Link>
                  {message.message}
                </div>
              </div>
            </div>
          )
        })}

      </div>
      <form onSubmit={handleChatSubmit} id='chatForm' className='chat-form border-top'>
        <input value={state.fieldValue} onChange={handleFieldChange} ref={chatField} type='text' className='chat-field' id='chatField' placeholder='Type a message…' autoComplete='off' />
      </form>
    </div>
  )
}

export default Chat
