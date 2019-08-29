import React from 'react'
import { tether, Title, Provider } from 'triframe/elements'

function* App({ models, history, props, use, useContext }) {
  return (
    <Title>Hello World</Title>
  )
}


const TetheredApp = tether(App)
export default () => (
  <Provider url="http://localhost">
    <TetheredApp />
  </Provider>
)
