import Constants from 'expo-constants'
const hostUri = window.location.host
const [ hostDomain ] = hostUri.split(':')
const { env } = Constants.manifest.extra
const { apiProto, apiDomain = hostDomain, apiPort } = Constants.manifest.extra[env]
const formattedPort = apiPort && apiPort != 80 ? `:${apiPort}` : ''
export const apiUrl = `${apiProto}://${apiDomain}${formattedPort}`