import React from 'react'
import { Title, Provider, Platform } from 'triframe/elements'

const App = () => (
    <Provider>
      {Platform.OS === 'web' ? (
        <style type="text/css">{`
            @font-face {
              font-family: 'MaterialIcons';
              src: url(${require('react-native-vector-icons/Fonts/MaterialIcons.ttf')}) format('truetype');
            }
            @font-face {
              font-family: 'FontAwesome';
              src: url(${require('react-native-vector-icons/Fonts/FontAwesome.ttf')}) format('truetype');
            }
          `}</style>
        ) : null}
        <Title>Hello World</Title>
    </Provider>
)

export default App