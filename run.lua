require('strict').on()

box.cfg {
    listen = 3302,
}

local http_server = require('http.server')
local http_router = require('http.router')

local HOST = '127.0.0.1'
local PORT = 8089

local function script_path() local fio = require "fio"; local b = debug.getinfo(2, "S").source:sub(2); local b_dir = fio.dirname(b); local lb = fio.readlink(b); while lb ~= nil do if not string.startswith(lb, '/') then lb = fio.abspath(fio.pathjoin(b_dir, lb)) end; b = lb; lb = fio.readlink(b) end return b:match("(.*/)") end

local function on_index(req)
    return req:render({})
end

local server = http_server.new(HOST, PORT)
local router = http_router.new({ app_dir = script_path() })
server:set_router(router)
router:route({ path = '/', method = 'GET', file = 'index.html' }, on_index)
server:start()
