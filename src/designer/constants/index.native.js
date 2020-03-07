import Constants from 'expo-constants'
const { hostUri } = Constants.manifest
const [ hostDomain ] = hostUri.split(':')
const { env } = Constants.manifest.extra
const { apiProto, apiDomain = hostDomain, apiPort } = Constants.manifest.extra[env]
const formattedPort = apiPort && apiPort != 80 ? `:${apiPort}` : ''
export const apiUrl = `${apiProto}://${apiDomain}${formattedPort}`