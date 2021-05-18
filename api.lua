local export = {}

function export.new()
    local api = {}
    local log = require('log')
    local checks = require('checks')
    local netbox = require('net.box')
    local utils = require('utils')

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

        log.info(utils.dump(opts))

        local connection = netbox.connect(opts.host, opts.port, {user=opts.user, password=opts.password})

        if connection.error then
            return false, connection.error
        end

        log.info('Connection OK')

        local ret = {}

        if opts.type == 'Call' then
            log.info('Making call()')
            ret = connection:call(opts.query, {})
        else
            log.info('Making eval()')
            ret = connection:eval(opts.query)
        end

        connection:close()

        return true, ret
    end

    function api.save_query(opts)
        checks({
            id = 'string',
            title = '?string',
            host = 'string',
            port = 'number',
            user = '?string',
            password = '?string',
            type = 'string',
            query = 'string',
        })

        query.upsert({
            [query.ID] = opts.id,
            [query.TITLE] = opts.title,
            [query.HOST] = opts.host,
            [query.PORT] = opts.port,
            [query.USER] = opts.user,
            [query.PASSWORD] = opts.password,
            [query.TYPE] = opts.type,
            [query.QUERY] = opts.query,
        })
    end

    function api.get_queries()
        local data = query.get()

        local result = {}
        for k,v in pairs(data) do
            result[k] = query.serialize(v)
        end

        return result
    end

    function api.delete_query(id)
        query.delete(id)
    end

    return api
end

return export
