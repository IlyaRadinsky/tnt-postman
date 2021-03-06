local export = {}

function export.new()
    local api = {}
    local log = require('log')
    local checks = require('checks')
    local netbox = require('net.box')

    local query = require('model.query').model()

    -----------------
    -- API methods --
    -----------------

    function api.create_database()
        local query_space = box.schema.space.create(query.SPACE_NAME, {
            if_not_exists = true
        })
        query_space:format({
            {'id', 'string'},
            {'title', 'string'},
            {'host', 'string'},
            {'port', 'unsigned'},
            {'type', 'string'},
            {'user', 'string', is_nullable = true},
            {'password', 'string', is_nullable = true},
            {'query', 'string'},
            {'updated_ts', 'unsigned'},
            {'parent_id', 'string', is_nullable = true},
            {'flags', 'unsigned'},
            {'args', 'array'},
        })
        query_space:create_index(query.PRIMARY_INDEX, {
            type = 'TREE',
            unique = true,
            parts = {query.ID, 'string'},
            if_not_exists = true
        })
    end

    function api.query(opts)
        checks({
            host = 'string',
            port = 'number',
            user = '?string',
            password = '?string',
            type = 'string',
            query = 'string',
            args = '?table',
        })

        local connection = netbox.connect(opts.host, opts.port, {user=opts.user, password=opts.password})

        if connection.error then
            return false, connection.error
        end

        log.info('Connection OK')

        local ret = {}

        if opts.type == 'Call' then
            log.info('Making call()')
            ret = connection:call(opts.query, opts.args or {})
        else
            log.info('Making eval()')
            ret = connection:eval(opts.query)
        end

        connection:close()

        if type(ret) ~= 'table' then
            ret = { ret }
        end

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
            parent_id = '?string',
            flags = '?number',
            args = '?table',
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
            [query.PARENT_ID] = opts.parent_id,
            [query.FLAGS] = opts.flags,
            [query.ARGS] = opts.args,
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
