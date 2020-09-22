import crypto from 'crypto'

export default () => crypto.randomBytes(32).toString('hex')
