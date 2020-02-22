import React from 'react'
import { Provider, Route } from 'triframe/designer'
import { MainPage } from './views/MainPage'


export const App = () => (
    <Provider>
        <Route path="/" component={MainPage} />
    </Provider>
)