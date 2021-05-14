local export = {}

function export.new()
    local api = {}
    local log = require('log')
    local checks = require('checks')
    local netbox = require('net.box')

    local conn = nil

    -----------------
    -- API methods --
    -----------------
    function api.connect(host, port, user, password)
        checks('string', 'number', '?string', '?string')

        log.info(string.format('Trying to connect to: %s:%s', host, port))

        if conn then
            log.warn('Connection is already exists')

            if conn:is_connected() then
                api.disconnect()
            end

            conn = nil
        end

        conn = netbox.connect(host, port, {user=user, password=password})

        if conn.error then
            return false, conn.error
        end

        log.info('Connection OK')

        return true
    end

    function api.disconnect()
        log.info('Closing connection ...')

        if conn then
            conn:close()
            conn = nil
        end

        return true
    end

    return api
end

return export
