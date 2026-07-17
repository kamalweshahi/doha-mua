import defaultConfig from './default'
import composeConfig from './compose'

const config = process.env.NODE_ENV === 'compose' ? composeConfig : defaultConfig

export default config
