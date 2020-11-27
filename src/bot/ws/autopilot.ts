#!/usr/bin/env node

const AUTO_ACCEPT = true
const AUTO_SEARCH = true
const config = { accept: AUTO_ACCEPT, search: AUTO_SEARCH }

const HOST = process.env.HOST || 'localhost'
const URL = process.env.API_HOST || `http://${HOST}:1337`
const SOCK = process.env.SOCK_HOST || `ws://${HOST}:7333`

import SocketBot from './socket-bot'
import REST from '../cli/interface'
const rest = new REST(URL)

const bot = new SocketBot(rest, SOCK, config)

bot.mainCycle()
