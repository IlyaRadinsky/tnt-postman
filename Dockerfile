FROM tarantool/tarantool:2.6.2

# TNT Postman Version, default to MAIN
ARG RELEASE_VERSION
ENV RELEASE_VERSION=${RELEASE_VERSION:-main}

ARG RELEASE_TIMESTAMP
ENV RELEASE_TIMESTAMP=$RELEASE_TIMESTAMP

# Image Labels
LABEL maintainer="radinsky.ilya@gmail.com"
LABEL org.label-schema.schema-version = "1.0"
LABEL org.label-schema.name="tnt_postman"
LABEL org.label-schema.url="https://github.com/IlyaRadinsky/tnt-postman"
LABEL org.label-schema.version=${RELEASE_VERSION}
LABEL org.label-schema.build-date=${RELEASE_TIMESTAMP}

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
