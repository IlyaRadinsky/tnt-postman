local query = {}
local utils = require('utils')

-----
-- query (id, title, host, port, type, user, password)
-----
function query.model()
    local model = {}

    model.SPACE_NAME = 'query'
    model.PRIMARY_INDEX = 'primary'

    model.ID = 1
    model.TITLE = 2
    model.HOST = 3
    model.PORT = 4
    model.TYPE = 5
    model.USER = 6
    model.PASSWORD = 7
    model.QUERY = 8
    model.UPDATE_TS = 9

    function model.get_space()
        return box.space[model.SPACE_NAME]
    end

    function model.serialize(query_tuple)
        return {
            id = query_tuple[model.ID],
            title = query_tuple[model.TITLE],
            host = query_tuple[model.HOST],
            port = query_tuple[model.PORT],
            type = query_tuple[model.TYPE],
            user = query_tuple[model.USER],
            password = query_tuple[model.PASSWORD],
            query = query_tuple[model.QUERY],
            update_ts = query_tuple[model.UPDATE_TS],
        }
    end

    function model.get()
        return model.get_space():select({})
    end

    function model.upsert(query_tuple)
        query_tuple[model.UPDATE_TS] = utils.time()
        local fields = utils.format_update(query_tuple)
        return model.get_space():upsert(query_tuple, fields)
    end

    function model.delete(query_id)
        if utils.not_empty_string(query_id) then
            return model.get_space():delete({query_id})
        end
    end

    return model
end

return query
