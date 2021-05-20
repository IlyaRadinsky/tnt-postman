# Architecture
tnt-postman is written as a web application in LUA, using webix for the client side processing and UI. On the server side, Tarantool is being utilised.
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
localhost:9099
```
