// useCallback: custom hooks
// http://localhost:3000/isolated/exercise/02.js

import * as React from 'react'
import {
  fetchPokemon,
  PokemonDataView,
  PokemonErrorBoundary,
  PokemonForm,
  PokemonInfoFallback
} from '../pokemon'

function useSafeDispatch(dispatch) {
  const mountedRef = React.useRef(false)
  
  React.useLayoutEffect(() => {
    mountedRef.current = true
    return () => mountedRef.current = false
  }, [])

  return React.useCallback((...args) => {
    if (mountedRef.current) {
      dispatch(...args)
    }
    }, [dispatch])
}

function asyncReducer(state, action) {
  switch (action.type) {
    case 'pending': {
      return {status: 'pending', data: null, error: null}
    }
    case 'resolved': {
      return {status: 'resolved', data: action.data, error: null}
    }
    case 'rejected': {
      return {status: 'rejected', data: null, error: action.error}
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

function useAsync(status) {
  const [state, unsafeDispatch] = React.useReducer(asyncReducer, {
    ...status,
    // 🐨 this will need to be "data" instead of "pokemon"
    data: null,
    error: null,
  })
  

  // const dispatch = React.useCallback((...args) => {
  //   if(mountedRef.current) unsafeDispatch(...args)
  // }, [])
  const dispatch = useSafeDispatch(unsafeDispatch)

  const callback = promise => {
    if (!promise) {
      return
    }
    dispatch({type: 'pending'})
    promise.then(
      data => dispatch({type: 'resolved', data}),
      error => dispatch({type: 'rejected', error}),
    )
  }
  const runFn = React.useCallback(callback => {
    if (!callback) return
    callback
      .then(data => {
        console.log(data)
        dispatch({type: 'resolved', data})
      })
      .catch(error => {
        console.error(error)
        dispatch({type: 'rejected', error})
      })
  }, [])
  const runFn2 = React.useCallback(callback, [])

  // React.useEffect(() => {
  //   const promise = runFn()
  //   if (!promise) {
  //     return
  //   }
  //   dispatch({type: 'pending'})
  //   promise.then(
  //     data => {
  //       dispatch({type: 'resolved', data})
  //     },
  //     error => {
  //       dispatch({type: 'rejected', error})
  //     },
  //   )
  // }, [runFn])
  return {...state, runFn: runFn2}
}

function PokemonInfo({pokemonName}) {
  // const callback = React.useCallback(() => {
  //   if (!pokemonName) {
  //     return
  //   }
  //   return fetchPokemon(pokemonName)
  // }, [pokemonName])
  const {data, status, error, runFn} = useAsync({
    status: pokemonName ? 'pending' : 'idle',
  })
  React.useEffect(() => {
    if (!pokemonName) {
      return
    }
    runFn(fetchPokemon(pokemonName))
  }, [pokemonName, runFn])

  if (status === 'idle' || !pokemonName) {
    return 'Submit a pokemon'
  } else if (status === 'pending') {
    return <PokemonInfoFallback name={pokemonName} />
  } else if (status === 'rejected') {
    throw error
  } else if (status === 'resolved') {
    return <PokemonDataView pokemon={data} />
  }

  throw new Error('This should be impossible')
}

function App() {
  const [pokemonName, setPokemonName] = React.useState('')

  function handleSubmit(newPokemonName) {
    setPokemonName(newPokemonName)
  }

  function handleReset() {
    setPokemonName('')
  }

  return (
    <div className="pokemon-info-app">
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <div className="pokemon-info">
        <PokemonErrorBoundary onReset={handleReset} resetKeys={[pokemonName]}>
          <PokemonInfo pokemonName={pokemonName} />
        </PokemonErrorBoundary>
      </div>
    </div>
  )
}

function AppWithUnmountCheckbox() {
  const [mountApp, setMountApp] = React.useState(true)
  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={mountApp}
          onChange={e => setMountApp(e.target.checked)}
        />{' '}
        Mount Component
      </label>
      <hr />
      {mountApp ? <App /> : null}
    </div>
  )
}

export default AppWithUnmountCheckbox
