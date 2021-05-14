let isConnected = false;

function connect() {
    const host = $$('host').getValue();
    const port = +$$('port').getValue();
    const user = $$('user').getValue();
    const password = $$('password').getValue();

    webix.ajax().headers({ "Content-type": "application/json" })
    .post('/api/connection', {
        host,
        port,
        user,
        password,
    })
    .then(function (ret) {
        const data = JSON.parse(ret.response);
        isConnected = true;
    })
    .catch(function (ret) {
        const data = JSON.parse(ret.response);
        webix.message(data.error, "error");
    });
}

webix.ui({
    rows: [
        {
            view: "toolbar",
            padding: { right: 10, left: 10 },
            elements: [
                { view: "label", label: "TNT Viewer", width: 100 },
                { view: "text", placeholder: "host", id: "host", width: 200 },
                { view: "text", placeholder: "port", id: "port", type: "number", width: 100 },
                { view: "text", placeholder: "user", id: "user", width: 100 },
                { view: "text", placeholder: "password", id: "password", type: "password", width: 100 },
                { view: "button", value: "Connect", id: "connect_button", css: "webix_primary", width: 100, click: connect },
                {},
                { view: "icon", icon: "wxi-close-circle warning" },
            ]
        },
        {
            cols: [
                { view: "template", template: "Menu", width: 250 },
                { view: "template", template: "Content", role: "placeholder" }
            ]
        },
    ],
});