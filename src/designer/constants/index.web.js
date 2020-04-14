import './polyfill.css'
const { protocol, host } = window.location;
const [ hostDomain ] = host.split(':')
export const apiUrl = port => {
    const formattedPort = port && port != 80 ? `:${port}` : ''
    return `${protocol}//${hostDomain}${formattedPort}`
}