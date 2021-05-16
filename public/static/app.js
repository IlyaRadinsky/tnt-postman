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
        })
        .catch(function (ret) {
            const data = JSON.parse(ret.response);
            webix.message(data.error, "error");
        });
}

function send() {
    const host = $$('host').getValue();
    const query = $$('query').getValue();

    webix.ajax().headers({ "Content-type": "application/json" })
        .post('/api/call', {
            host,
            query,
        })
        .then(function (ret) {
            const data = JSON.parse(ret.response);
        })
        .catch(function (ret) {
            const data = JSON.parse(ret.response);
            webix.message(data.error, "error");
        });
}

function save() {

}

function add_new_query() {
    $$("list1").add({
        title: "localhost:3301",
        host: "localhost",
        port: 3301,
        type: "Eval"
    }, 0);
};

function open_new_tab(id) {
    var item = $$('list1').getItem(id);

    if (!$$(item.id)) {
        $$("views").addView({
            id: item.id,
            rows: [
                {
                    cols: [
                        { view: "text", placeholder: "Request Name", id: "title:" + item.id, value: item.title },
                        { view: "button", value: "Save", id: "save:" + item.id, width: 50, click: save },
                    ],
                },
                {
                    cols: [
                        { view: "combo", options: ["Eval", "Call"], value: item.type, width: 100, id: "type:" + item.id },
                        { view: "text", placeholder: "Host", value: item.host, id: "host:" + item.id },
                        { view: "text", placeholder: "Port", value: item.port, id: "port:" + item.id, type: "number", width: 100 },
                        { view: "text", placeholder: "User", value: item.user, id: "user:" + item.id, width: 100 },
                        { view: "text", placeholder: "Password", value: item.password, id: "password", type: "password", width: 100 },
                        { view: "button", value: "Send", id: "send:" + item.id, css: "webix_primary", width: 100, click: send },
                    ],
                },
                { view: "textarea", placeholder: "Query", value: item.query, id: "query:" + item.id },
            ],
        });

        $$("tabs").addOption({ id: item.id, value: item.title, close: true }, true);
    }
    else {
        $$("tabs").setValue(item.id);
    }
}

function on_delete_tab(id) {
    //show default view if no tabs
    if ($$("tabs").config.options.length === 0) {
        $$("tpl").show();
    }

    $$("views").removeView(id);
    $$("list1").unselect(id);
}

webix.ui({
    rows: [
        {
            view: "toolbar",
            padding: { right: 10, left: 10 },
            elements: [
                { view: "label", label: "TNTV", width: 100 },
                {},
                { view: "icon", icon: "wxi-plus", click: add_new_query },
            ],
        },
        {
            cols: [
                {
                    view: "list", id: "list1",
                    template: "#title#",
                    width: 250,
                    data: [],
                    select: true,
                    on: {
                        onItemClick: open_new_tab
                    }
                },
                {
                    rows: [
                        {
                            type: "clean", rows: [
                                {
                                    id: "tabs",
                                    view: "tabbar",
                                    multiview: true,
                                    options: [],
                                    on: {
                                        onOptionRemove: on_delete_tab
                                    },
                                },
                                {
                                    id: "views",
                                    animate: false,
                                    cells: [
                                        { view: "template", id: "tpl" }
                                    ]
                                }
                            ]
                        },
                        { view: "template", template: "Response", role: "placeholder" },
                    ],
                },
            ],
        },
    ],
});