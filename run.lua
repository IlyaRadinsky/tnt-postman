#!/usr/bin/env tarantool

require('strict').on()

local log = require('log')
local fio = require('fio')
local json = require('json')
local checks = require('checks')
local utils = require('utils')
local api = require('api').new()

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
    listen = 3299,
    work_dir = DATADIR,
}

api.create_database()

local http_server = require('http.server')
local http_router = require('http.router')

local HOST = '0.0.0.0'
local PORT = 9099

local function json_response(status, obj)
    checks('number', 'table')
    return {
        status = status,
        headers = {['content-type'] = "application/json; charset=utf-8"},
        body = json.encode(obj),
    }
end

local function on_get_index(req)
    return req:render({})
end

local function on_post_query(req)
    local host = req:post_param('host')
    local port = tonumber(req:post_param('port'))
    local user = req:post_param('user')
    local password = req:post_param('password')
    local type = req:post_param('type')
    local query = req:post_param('query')

    if not utils.not_empty_string(host) then
        return json_response(400, { error = 'Invalid host' })
    end

    if not utils.positive_number(port) then
        return json_response(400, { error = 'Invalid port' })
    end

    if not utils.not_empty_string(user) or not utils.not_empty_string(password) then
        user = nil
        password = nil
    end

    if not utils.not_empty_string(host) then
        return json_response(400, { error = 'Invalid host' })
    end

    ok, err = api.query({
        host = host,
        port = port,
        user = user,
        password = password,
        type = type,
        query = query,
    })

    if not ok then
        return json_response(400, { error = err })
    end

    return json_response(200, err or {})
end

local function on_get_query(req)
    local records = api.get_queries()
    return json_response(200, records)
end

local function on_put_query(req)
    local query_id = req:stash('id')
    local id = req:post_param('id')
    local title = req:post_param('title')
    local host = req:post_param('host')
    local port = tonumber(req:post_param('port'))
    local user = req:post_param('user')
    local password = req:post_param('password')
    local type = req:post_param('type')
    local query = req:post_param('query')
    local parent_id = req:post_param('parent_id')
    local flags = tonumber(req:post_param('flags'))

    if query_id ~= id then
        return json_response(400, { error = 'Invalid query ID' })
    end

    if not utils.not_empty_string(host) then
        return json_response(400, { error = 'Invalid host' })
    end

    if not utils.positive_number(port) then
        return json_response(400, { error = 'Invalid port' })
    end

    if not utils.not_empty_string(user) or not utils.not_empty_string(password) then
        user = nil
        password = nil
    end

    if not utils.not_empty_string(host) then
        return json_response(400, { error = 'Invalid host' })
    end

    api.save_query({
        id = id,
        title = title,
        host = host,
        port = port,
        user = user,
        password = password,
        type = type,
        query = query,
        parent_id = parent_id,
        flags = flags,
    })

    return json_response(200, {})
end

local function on_delete_query(req)
    local id = req:stash('id')
    api.delete_query(id)
    return json_response(200, {})
end

local server = http_server.new(HOST, PORT)
local router = http_router.new({ app_dir = WORKDIR })
server:set_router(router)
router:route({ path = '/', method = 'GET', file = 'index.html' }, on_get_index)
router:route({ path = '/api/query', method = 'POST' }, on_post_query)
router:route({ path = '/api/query', method = 'GET' }, on_get_query)
router:route({ path = '/api/query/:id', method = 'PUT' }, on_put_query)
router:route({ path = '/api/query/:id', method = 'DELETE' }, on_delete_query)
server:start()
