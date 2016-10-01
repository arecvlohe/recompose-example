import React, { PropTypes } from 'react'
import { render } from 'react-dom'
import { Observable } from 'rx'
import { mapPropsStream, renderComponent, branch, pure, compose, setObservableConfig } from 'recompose'
import rxjs4config from 'recompose/rxjs4ObservableConfig'
import Spinner from 'react-spinkit'
import R from 'ramda'

setObservableConfig(rxjs4config)

const getData = mapPropsStream(props$ => {
  const promise$ = Observable.fromPromise(
    fetch('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json')
      .then(response => response.json())
  )
  const resize$ = Observable.fromEvent(window, 'resize')
    .map(e => ({width: e.target.innerWidth, height: e.target.innerHeight }))
    .startWith({width: window.innerWidth, height: window.innerHeight})
  return props$.combineLatest(promise$, resize$, (props, promise, resize) => ({
    ...props,
    promise,
    window: {...resize}
  }))
})

const SpinnerThreeBounce = () =>
  <Spinner spinnerName='three-bounce' noFadeIn />

const spinnerWhileLoading = hasLoaded =>
  branch(
    hasLoaded,
    t => t,
    renderComponent(SpinnerThreeBounce)
  )

const enhance = compose(
  getData,
  spinnerWhileLoading(({ promise }) => !R.isEmpty(promise))
)

const App = enhance(({ promise, window: {height, width} }) =>
  <div>
    <h1>{promise.source_name}</h1>
    <small>{height}, {width}</small>
    <ul>
      {promise.data.map((item, index) =>
        <li key={index}>{item[0]}{item[1]}</li>
      )}
    </ul>
  </div>
)

App.propTypes = {
  promise: PropTypes.object.isRequired
}

App.defaultProps = {
  promise: {}
}

render(<App />, document.querySelector('#app'))
