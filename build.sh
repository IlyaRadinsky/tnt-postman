#!/bin/bash

export RELEASE_VERSION=0.2

docker build \
    --build-arg RELEASE_VERSION=${RELEASE_VERSION} \
    --build-arg RELEASE_TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ") \
    --tag ilyaradinsky/tnt-postman:${RELEASE_VERSION} .
