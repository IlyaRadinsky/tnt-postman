#!/usr/bin/env tarantool

require('strict').on()

local fio = require('fio')
local json = require('json')
local checks = require('checks')
local utils = require('utils')
local log = require('log')
local api = require('api').new()

local WORKDIR = fio.abspath(fio.dirname(arg[0]))
local DATADIR = os.getenv('TNT_POSTMAN_DATA_DIR') or WORKDIR .. '/' .. '.data'

local ok, err = fio.mktree(DATADIR)
if not ok then
    error(err, 0)
end

box.cfg {
    listen = os.getenv('TNT_POSTMAN_HOST_PORT') or 3299,
    memtx_dir = DATADIR,
    work_dir = DATADIR,
    wal_dir = DATADIR,
    vinyl_dir = DATADIR,
}

api.create_database()

local http_server = require('http.server')
local http_router = require('http.router')

local HOST = os.getenv('TNT_POSTMAN_HOST') or '0.0.0.0'
local PORT = os.getenv('TNT_POSTMAN_HTTP_PORT') or 9090

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
    local args = req:post_param('args')

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

    if not utils.not_empty_string(query) then
        if type == 'Eval' then
            return json_response(400, { error = 'Invalid query' })
        elseif type == 'Call' then
            return json_response(400, { error = 'Invalid call' })
        end
    end

    ok, err = api.query({
        host = host,
        port = port,
        user = user,
        password = password,
        type = type,
        query = query,
        args = args,
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
    local args = req:post_param('args')

    if query_id ~= id then
        return json_response(400, { error = 'Invalid query ID' })
    end

    if type == "Collection" then
        if not utils.not_empty_string(title) then
            return json_response(400, { error = 'Invalid title' })
        end

        query = ""
        host = ""
        port = 0
        args = {}
    else
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

        if not utils.not_empty_string(query) then
            if type == 'Eval' then
                return json_response(400, { error = 'Invalid query' })
            elseif type == 'Call' then
                return json_response(400, { error = 'Invalid call' })
            end
        end
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
        args = args,
    })

    return json_response(200, {})
end

local function on_delete_query(req)
    local id = req:stash('id')
    local ids = req:post_param('ids')

    api.delete_query(id)

    for _, i in pairs(ids) do
        api.delete_query(i)
    end

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
