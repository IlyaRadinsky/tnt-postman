FROM tarantool/tarantool:2.6.2

RUN apk update && apk upgrade && apk add --update bash cmake make g++
# Move application files to the app directory
COPY ./ /opt/tarantool/

# Switch to the app directory
WORKDIR /opt/tarantool

# Install dependencies
RUN tarantoolctl rocks build

VOLUME ["/opt/tarantool/.data"]

EXPOSE 9090

CMD ["tarantool", "run.lua"]
