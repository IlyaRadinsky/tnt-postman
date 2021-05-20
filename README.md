# Architecture
tnt-postman is written as a web application in LUA, using webix for the client side processing and UI. On the server side, Tarantool is being utilised.
![Screenshot 2021-05-20 at 09 14 52](https://user-images.githubusercontent.com/9526468/118928585-1a032980-b94c-11eb-8276-dad56c84ff9c.png)
# Environment Variables
- #### TNT_POSTMAN_DATA_DIR
default current folder
- #### TNT_POSTMAN_HOST
default '0.0.0.0'
- #### TNT_POSTMAN_HOST_PORT
default 3299
- #### TNT_POSTMAN_HTTP_PORT
default 9090
# How to use Docker image
In order to run a container with our image, execute:

```
docker run \
    -d \
    -p 9090:9090 \
    -v ~/data/tnt-postman:/opt/tarantool/.data \
    ilyaradinsky/tnt-postman
```
# Bleeding Edge
For development or just to try out the latest features, you may want to install tnt-postman directly from source.

At first, you should download and install the Tarantool package that’s appropriate for your OS, start a shell (terminal) and enter the command-line instructions provided for your OS at [download page](http://tarantool.org/download.html).
## Installation
```bash
git clone https://github.com/IlyaRadinsky/tnt-postman.git
cd ./tnt-postman
tarantoolctl rocks build
```
## Usage
1. Start the app
```
tarantool run.lua
```
2. Browse the URL
```
localhost:9090
```
