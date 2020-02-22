import socketIo from 'socket.io-client';
import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router'
import { Pipe, EventEmitter } from '../core';
import { Router } from './Router'
import { Provider as PaperProvider, Snackbar, Portal } from 'react-native-paper'
import { View } from 'react-native'
import { createUnserializer } from '../arbiter'


export const Model = React.createContext({ areReady: false })

export const Provider = (props) => (
    <Router>
        <Main {...props} />
    </Router>
)


let displayError;

const Main = ({ children, iconSets = ['MaterialIcons'], url = 'http://localhost:8080' }) => {
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
                const api = unserialize(schema)
                saveModels({ ...api, url })
                if (typeof window !== 'undefined') Object.assign(window, api)
            })
        })()
    }, [])
    return (
        <Model.Provider value={models}>
            <PaperProvider>
                <Portal.Host />
                <View style={{ height: '100vh' }}>
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


const INITIAL_STATE = Symbol()


let createUse = () => {
    let counter = INITIAL_STATE;
    const pipes = []
    const agent = new EventEmitter;
    const createMonitor = index => {
        let monitor = node => {
            Object.defineProperty(node, 'set', {
                configurable: true,
                value: function (attributes) {
                    Object.assign(this, attributes)
                    crawl(this, monitor)
                    if (this._onChange) this._onChange()
                    else agent.emit(`update.${index}`)
                }
            })
        }
        return monitor
    }

    return [
        data => {
            if (counter === INITIAL_STATE) {
                let index = pipes.length
                let pipe = new Pipe(function* () {
                    yield agent.nowAndOn(`update.${index}`)
                    crawl(data, createMonitor(index))
                    return data
                })
                pipes.push(pipe)
                return pipe
            } else {
                let pipe = pipes[counter]
                if (pipe === undefined) throw Error('Invalid use of `use`. `use` must be called the same number of times per render')
                counter++;
                return pipe
            }
        },
        () => {
            counter = 0;
        }
    ]
}

const savedContexts = []


const createUseContext = models => context => {
    let pipe;
    let cached = savedContexts.find(cached => cached.context === context)
    if (cached) {
        pipe = cached.pipe
    } else {
        let [use, restartUse] = createUse()
        let useContext = createUseContext(models)
        let payload = { models, use, useContext }
        pipe = new Pipe(() => context(payload))
        pipe.observe(() => {
            restartUse()
        })
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

    useEffect(() => {
        let pipe;
        if (models.areReady === false) return

        let whileLoading = (jsx) => dispatch({ jsx })

        let [use, restartUse] = createUse()
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

        let payload = { models, props, redirect, use, useContext, useRouter, whileLoading, onError, catchErrors, afterRender }
        pipe = new Pipe(() => Component(payload), payload)
        pipe.observe(jsx => {
            restartUse()
            dispatch({ jsx, runAfterRender })
        })
        // TODO: A thing here?
        pipe.catch(err => console.log('well', err))
        return () => pipe && pipe.destroy()

    }, [models.areReady, ...propsArray])
    useEffect(() => {
        if (typeof data.runAfterRender == 'function') data.runAfterRender()
    })
    return data.jsx
})

const primativeTypes = ['String', 'Boolean', 'Number', 'Date', 'Function']
const isPlain = value => value && typeof value === 'object' && !primativeTypes.includes(value.constructor.name)


export const crawl = (obj, callback) => {
    if (isPlain(obj)) {
        callback(obj)
        for (let key in obj) {
            let value = obj[key]
            crawl(value, callback)
        }
    }
}