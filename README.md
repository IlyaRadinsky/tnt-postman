# Architecture
`tnt-viewer` is written as a web application in LUA, using `webix` for the client side processing and UI. On the server side, `Tarantool` is being utilised.
# Installation
```
tarantoolctl rocks build
```
# Usage
1. Start the app
```
tarantool run.lua
```
2. Browse the URL
```
localhost:8089
```
