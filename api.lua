local export = {}

function export.new()
    local api = {}
    local log = require('log')
    local netbox = require('net.box')

    -----------------
    -- API methods --
    -----------------
    function api.connect()
        log.info('api.connect()')
        return true
    end

    function api.disconnect()
        log.info('api.disconnect()')
        return true
    end

    return api
end

return export
