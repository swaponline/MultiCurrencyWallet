import { mkdir } from 'fs'


export default (dirName = '.storage') => mkdir(dirName, err => {})
