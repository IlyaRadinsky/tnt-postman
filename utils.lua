local utils = {}
local fiber = require('fiber')
local math = require('math')

function utils.now()
    return math.floor(fiber.time())
end

function utils.format(string, tab)
    return (string:gsub('($%b{})', function(word) return tab[word:sub(3, -2)] or word end))
end

function utils.format_update(tuple)
    local fields = {}
    for number, value in pairs(tuple) do
        table.insert(fields, {'=', number, value})
    end
    return fields
end

function utils.dump(o, max_depth, depth_counter)
   local depth = depth_counter or 1
   if max_depth ~= nil and max_depth < depth then
      return tostring(o)
   end

   if type(o) == 'table' then
      local s = '{ '
      for k,v in pairs(o) do
         if type(k) ~= 'number' then k = '"'..k..'"' end
         s = s .. '['..k..'] = ' .. utils.dump(v, max_depth, depth+1) .. ','
      end
      return s .. '} '
   else
      return tostring(o)
   end
end

function utils.hex_dump (str)
   local len = string.len( str )
   local dump = "Size: " .. len .. "\n"
   local hex = ""
   local asc = ""
   local R = 32

   for i = 1, len do
       if 1 == i % R then
           dump = dump .. hex .. asc .. "\n"
           hex = string.format( "%04x: ", i - 1 )
           asc = ""
       end

       local ord = string.byte( str, i )
       hex = hex .. string.format( "%02x ", ord )
       if ord >= 32 and ord <= 126 then
           asc = asc .. string.char( ord )
       else
           asc = asc .. "."
       end
   end

   return dump .. hex .. string.rep( "   ", R - len % R ) .. asc
end

function utils.string(str)
    return type(str) == 'string'
end

function utils.not_empty_string(str)
    return utils.string(str) and str ~= ''
end

function utils.positive_number(number)
    return type(number) == 'number' and number >= 0
end

return utils
