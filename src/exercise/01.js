// useReducer: simple Counter
// http://localhost:3000/isolated/exercise/01.js

import * as React from 'react'

function countReducer(state, action) {
  if (typeof action === 'function') {
    const newState = action(state)
    console.log('Its a function ', newState)
    return {...state, ...newState}
  }
  const newState = action?.count
  if (newState) {
    console.log('Its an object with a property', {newState})
    return {...state, ...action}
  }
  return {...state}
}

function reduxStyleReducer(state, action) {
  if (action.type === 'INCREMENT') {
    return {count: state.count + action.step}
  } else if (action.type === 'DECREMENT') {
    return {count: state.count - action.step}
  }
  throw new Error(`Unsupported action type ${action.type}`)
}

function Counter({initialCount = 0, step = 100}) {
  const [state, setState] = React.useReducer(countReducer, {
    count: initialCount,
  })

  const [reduxStyleState, dispatch] = React.useReducer(reduxStyleReducer, {
    count: initialCount,
  })

  const {count} = state

  const increment = () => setState({count: count + step})
  const increment2 = () =>
    setState(currentState => ({count: currentState.count + step}))
  const reduxStyleIncrement = () => dispatch({type: 'INCREMENT', step})
  const reduxStyleDecrement = () => dispatch({type: 'DECREMENT', step})
  return (
    <>
      <button onClick={increment}>{count}</button>
      <button onClick={increment2}>Increment 2 {count}</button>
      <button onClick={reduxStyleIncrement}>
        Redux Style Increment {reduxStyleState.count}
      </button>
      <button onClick={reduxStyleDecrement}>
        Redux Style Decrement {reduxStyleState.count}
      </button>
    </>
  )
}

function App() {
  return <Counter />
}

export default App
