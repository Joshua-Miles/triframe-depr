import socketIo from 'socket.io-client';
import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router'
import { Pipe, EventEmitter, each } from '../core';
import { Router } from './Router'
import { Provider as PaperProvider, Snackbar, Portal, DefaultTheme } from 'react-native-paper'
import { View, Text} from 'react-native'
import { createUnserializer } from '../arbiter'


export const Model = React.createContext({ areReady: false })

export const Provider = (props) => (
    <Router>
         <Main {...props} />
    </Router>
)


let displayError;

const Main = ({ children, url = 'http://localhost:8080', theme = DefaultTheme }) => {
    let error;
    ([error, displayError] = useState(false))
    let [models, saveModels] = useState({ areReady: false })
    useEffect(() => {
        (async function () {
            await fetch(`${url}/init`, { credentials: 'include' }) // <-- necessary to initialize session. This should be removed in a future release
            let io = socketIo(url)
            if(typeof window !== 'undefined') window.io = io
            const unserialize = createUnserializer(io)
            io.on('interface', schema => {
                console.log(schema)
                const api = unserialize(schema)
                saveModels({ ...api, url })
                if (typeof window !== 'undefined') Object.assign(window, api)
            })
        })()
    }, [])
    return (
        <Model.Provider value={models}>
            <PaperProvider theme={theme}>
                <View><Portal.Host /></View>
                <View style={{ flex: 1 }}>
                    <Snackbar
                        visible={error !== false}
                        onDismiss={() => displayError(false)}
                        action={{
                            label: 'Dismiss',
                            onPress: () => {
                                displayError(false)
                            }
                        }}
                    >
                        {error.message}
                    </Snackbar>
                    {children}
                </View>
            </PaperProvider>
        </Model.Provider>
    )
}

const savedContexts = []

const createUseContext = models => context => {
    let pipe;
    let cached = savedContexts.find(cached => cached.context === context)
    if (cached) {
        pipe = cached.pipe
    } else {
        let useContext = createUseContext(models)
        let payload = { models, useContext }
        pipe = new Pipe(() => context(payload))
        savedContexts.push({ context, pipe })
    }
    return pipe
}

export const tether = Component => props => {
    return (
        <Model.Consumer>
            {models => <ConnectedComponent props={props} models={models} Component={Component} />}
        </Model.Consumer>
    )
}

let ConnectedComponent = withRouter(({ props = [], models, Component, history, match, location }) => {
    let jsx = null

    const [data, dispatch] = useState({ jsx })
    const propsArray = Object.values(props)
    const getHistory = () => ({ history, match, location })

    console.log(models)

    useEffect(() => {
        let pipe;
        if (models.areReady === false) return

        let whileLoading = (jsx) => dispatch({ jsx })

        let useContext = createUseContext(models)
        let useRouter = () => new Pipe(getHistory)
        let redirect = path => history.push(path)

        let defaultErrorHandler = (err) => {
            displayError(err)
        }

        let handleError = defaultErrorHandler

        let onError = callback => handleError = err => callback(err, defaultErrorHandler)

        let catchErrors = callback => (...args) => {
            try {
                let result = callback(...args)
                if (result instanceof Promise) result.catch(handleError)
            } catch (err) {
                handleError(err)
            }
        }

        let runAfterRender
        let afterRender = callback => runAfterRender = callback

        let payload = { models, props, redirect, useContext, useRouter, whileLoading, onError, catchErrors, afterRender }
        pipe = new Pipe(() => Component(payload), payload)
        pipe.observe(jsx => {
            dispatch({ jsx, runAfterRender })
        })
        // TODO: A thing here?
        pipe.catch(err => console.log(Component.name, err))
        return () => pipe && pipe.destroy()

    }, [models.areReady, ...propsArray])
    useEffect(() => {
        if (typeof data.runAfterRender == 'function') data.runAfterRender()
    })
    return data.jsx
})