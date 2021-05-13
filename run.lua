#!/usr/bin/env tarantool

require('strict').on()

local log = require('log')
local fio = require('fio')

local WORKDIR = fio.abspath(fio.dirname(arg[0]))
local DATADIR = WORKDIR .. '/' .. '.data'

local ok, err = fio.mktree(DATADIR)
if not ok then
    error(err, 0)
end

log.info('\n')
log.info('WORKDIR: ' .. WORKDIR)
log.info('DATADIR: ' .. DATADIR)
log.info('\n')

box.cfg {
    listen = 3302,
    work_dir = DATADIR,
}

local http_server = require('http.server')
local http_router = require('http.router')

local HOST = '127.0.0.1'
local PORT = 8089

local function on_index(req)
    return req:render({})
end

local server = http_server.new(HOST, PORT)
local router = http_router.new({ app_dir = WORKDIR })
server:set_router(router)
router:route({ path = '/', method = 'GET', file = 'index.html' }, on_index)
server:start()
