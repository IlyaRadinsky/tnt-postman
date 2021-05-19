FROM tarantool/tarantool:2.6.2

RUN apk update && apk upgrade && apk add --update bash cmake make g++
# Move application files to the app directory
COPY ./ /opt/tarantool/

# Switch to the app directory
WORKDIR /opt/tarantool

# Install dependencies
RUN tarantoolctl rocks build

VOLUME ["/opt/tarantool/.data"]

EXPOSE 3299 80

# Allow all users to execute both the script to start the server
# and the script that intercepts termination requests
RUN chmod a+x ./start_server.sh
RUN chmod a+x ./intercept.sh

STOPSIGNAL SIGINT

CMD ["./intercept.sh"]
