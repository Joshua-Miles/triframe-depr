import Constants from 'expo-constants'
const { hostUri } = Constants.manifest
const [ protocol, hostname ] = hostUri.split('//')
const [ hostDomain ] = hostname.split(':')
export const apiUrl = port => {
    const formattedPort = port && port != 80 ? `:${port}` : ''
    return `${protocol}://${hostDomain}${formattedPort}`
}