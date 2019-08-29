import socketIo from 'socket.io-client';
import { UnSerializer } from '../arbiter/UnSerializer';
import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router'
import { Pipe, EventEmitter } from '../herald';
import { Platform, Router, Title } from './index'
import { Provider as PaperProvider } from 'react-native-paper'
import { crawl } from '../mason';

const Model = React.createContext({ areReady: false })

export const Provider = (props) => (
    <PaperProvider>
        <Main {...props} />
    </PaperProvider>
)

const Main = ({ children, iconSets = ['MaterialIcons'], url = '' }) => {
    let [models, saveModels] = useState({ areReady: false })
    useEffect(() => {
        let counter = 0;
        let token = localStorage.getItem('token')
        let io = socketIo(url, token ? {
            query: { token }
        } : undefined)
        io.on('token', token => {
            localStorage.setItem('token', token)
        })
        io.on('interface', inter => {
            let { types, agent } = new UnSerializer(inter)
            agent.on('*', (payload, action) => {
                let id = counter++
                io.emit('message', { payload, action, id }, object => {
                    payload.respond(object)
                    io.on(id, result => {
                        payload.respond(result)
                    })
                })
            })
            saveModels(types)
        })
        io.on('disconnect', () => {
            window.location.reload()
        })
    }, [])
    return (
        <Model.Provider value={models}>
            {Platform.OS === 'web' ? (
            <style type="text/css">{`
                ${iconSets.map(iconSet => (
                `@font-face {
                        font-family: ${iconSet};
                        src: url(${require(`react-native-vector-icons/Fonts/${iconSet}.ttf`)}) format('truetype');
                    }`
            ))}
            `}</style>
        ) : null}
            <Router>
                {children}
            </Router>
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
            if (Array.isArray(node)) {
                Object.defineProperty(node, 'new', {
                    configurable: true,
                    value: function (thing) {
                        crawl(thing, monitor)
                        this.push(thing)
                        agent.emit(`update.${index}`)
                    }
                })
            } else {
                Object.defineProperty(node, 'set', {
                    configurable: true,
                    value: function (attributes) {
                        Object.assign(this, attributes)
                        crawl(this, monitor)
                        agent.emit(`update.${index}`)
                    }
                })
            }
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

window.savedContexts = savedContexts

const createUseContext = models => context => {
    let pipe;
    let cached = savedContexts.find(cached => cached.context === context)
    if (cached) {
        pipe = cached.pipe
    } else {
        let [use, restartUse] = createUse()
        let payload = { models, use }
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
            {models => <ConnectedComponent props={props} models={models} Component={Component} history={history} />}
        </Model.Consumer>
    )
}

let ConnectedComponent = withRouter(({ props = [], models, Component, history, match, location }) => {
    let jsx = null

    const [data, dispatch] = useState({ jsx })

    useEffect(() => {
        let pipe;
        (async () => {
            if (models.areReady === false) return

            let whileLoading = (jsx) => dispatch({ jsx })

            let [use, restartUse] = createUse()
            let useContext = createUseContext(models)

            let payload = { models, props, whileLoading, useContext, use, history, match, location }
            pipe = new Pipe(() => Component(payload), payload)
            pipe.observe(jsx => {
                restartUse()
                dispatch({ jsx })
            })
        })()
        return () => pipe && pipe.destroy()
    }, [models.areReady, ...Object.values(props)])
    return data.jsx
})