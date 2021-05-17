local export = {}

function export.new()
    local api = {}
    local log = require('log')
    local checks = require('checks')
    local netbox = require('net.box')

    local conn = nil

    local query = require('model.query').model()

    -----------------
    -- API methods --
    -----------------

    function api.create_database()
        local query_space = box.schema.space.create(query.SPACE_NAME, {
            if_not_exists = true
        })
        query_space:create_index(query.PRIMARY_INDEX, {
            type = 'TREE',
            unique = true,
            parts = {query.ID, 'string'},
            if_not_exists = true
        })
    end

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

    function api.query(opts)
        checks({
            host = 'string',
            port = 'number',
            user = '?string',
            password = '?string',
            type = 'string',
            query = 'string',
        })

        local host = opts.host
        local port = opts.port
        local user = opts.user
        local password = opts.password
        local type = opts.type
        local query = opts.query

        log.info(string.format('Trying to connect to: %s:%s', host, port))

        local connection = netbox.connect(host, port, {user=user, password=password})

        if connection.error then
            return false, connection.error
        end

        log.info('Connection OK')

        local ret = {}

        if type == 'Call' then
            ret = connection:call(query, {})
        else
            ret = connection:eval(query)
        end

        connection:close()

        return true, ret
    end

    return api
end

return export
