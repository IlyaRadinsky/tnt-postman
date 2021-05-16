function on_change_item(val) {
    const parsedId = this.data.id.split(":");
    const name = parsedId[0];
    const id = parsedId[1];

    console.log('on_change_item', name, id, val);

    const item = $$('list1').getItem(id);
    item[name] = val;

    $$("list1").refresh(id);
}

const ITEM_EVENTS = {
    onChange: on_change_item,
};

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

function send(buttonId) {
    const id = buttonId.split(":")[1];
    const item = $$('list1').getItem(id);

    webix.ajax().headers({ "Content-type": "application/json" })
        .post('/api/query', item)
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
    const item = $$('list1').getItem(id);

    if (!$$(item.id)) {
        $$("views").addView({
            id: item.id,
            rows: [
                {
                    cols: [
                        { view: "text", placeholder: "Request Name", id: "title:" + item.id, value: item.title, on: ITEM_EVENTS },
                        { view: "button", value: "Save", id: "save:" + item.id, width: 50, click: save },
                    ],
                },
                {
                    cols: [
                        { view: "combo", options: ["Eval", "Call"], value: item.type, width: 100, id: "type:" + item.id, on: ITEM_EVENTS },
                        { view: "text", placeholder: "Host", value: item.host, id: "host:" + item.id, on: ITEM_EVENTS },
                        { view: "text", placeholder: "Port", value: item.port, id: "port:" + item.id, type: "number", width: 100, on: ITEM_EVENTS },
                        { view: "text", placeholder: "User", value: item.user, id: "user:" + item.id, width: 100, on: ITEM_EVENTS },
                        { view: "text", placeholder: "Password", value: item.password, id: "password:" + item.id, type: "password", width: 100, on: ITEM_EVENTS },
                        { view: "button", value: "Send", id: "send:" + item.id, css: "webix_primary", width: 100, click: send },
                    ],
                },
                { view: "textarea", placeholder: "Query", value: item.query, id: "query:" + item.id, on: ITEM_EVENTS },
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
                { view: "button", label: "New Query", width: 100, click: add_new_query },
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
                            rows: [
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