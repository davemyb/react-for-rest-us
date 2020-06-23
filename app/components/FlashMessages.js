import React from 'react'

/*
  FlashMessages can use different classes to have different colour messages.
  Accepted classes are:

    alert-primary (blue)
    alert-secondary (light gray)
    alert-success (green)
    alert-danger (red)
    alert-warning (yellow)
    alert-info (teal)
    alert-light (white)
    alert-dark (medium gray)

  Use the word after `alert-` to choose the style of the FlashMessage when you
  call FlashMessage via appDispatch(). Main.js passes style and message as part
  of msg.

  msg : object containing the following:
    - msg.message (The message text)
    - msg.type (Defines the message colour, defaults to 'success')
*/
function FlashMessages (props) {
  return (
    <div className='floating-alerts'>
      {props.messages.map((msg, index) => {
        return (
          <div key={index} className={'alert text-center floating-alert shadow-sm alert-' + (msg.style ? msg.style : 'success')}>
            {msg.message}
          </div>
        )
      })}
    </div>
  )
}

export default FlashMessages
