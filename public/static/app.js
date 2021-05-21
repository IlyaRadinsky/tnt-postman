function on_change_item(val) {
    const parsedId = this.data.id.split(":");
    const name = parsedId[0];
    const id = parsedId[1];

    console.log('on_change_item', name, id, val);

    const item = $$('list1').getItem(id);

    if (name === "type") {
        if (val === "Call") {
            $$("query:" + id).hide();
            $$("call:" + id).show();
        } else {
            $$("query:" + id).show();
            $$("call:" + id).hide();
        }

        item[name] = val;
    } else {
        item[name] = val;
    }

    $$("list1").refresh(id);

    $$("save:" + id).define("css", "webix_primary");
}

const ITEM_EVENTS = {
    onChange: on_change_item,
};

function send(buttonId) {
    const id = buttonId.split(":")[1];
    const item = $$('list1').getItem(id);

    webix.ajax().headers({ "Content-type": "application/json" })
        .post('/api/query', item)
        .then(function (ret) {
            const response = JSON.stringify(ret.json(), null, 4);
            $$('response:' + id).setValue(response);
        })
        .catch(function (ret) {
            let response = '';
            response += 'Status: (' + ret.status + ') ' + ret.statusText + '\n\n';
            response += ret.responseText;
            $$('response:' + id).setValue(response);
        });
}

function del_arg(buttonId) {
    const idx = +(buttonId.split(":")[0].substring(6));
    const id = buttonId.split(":")[1];
    const item = $$('list1').getItem(id);
    $$("args:" + id).removeView("arg" + idx + ":" + id);
    item.args.splice(idx, 1);
}

function add_arg(buttonId) {
    const id = buttonId.split(":")[1];
    const item = $$('list1').getItem(id);
    const idx = item.args.length;
    $$("args:" + id).addView({
        id: "arg" + idx + ":" + id,
        cols: [
            { view: "text", placeholder: "Arg", id: "arg_value" + idx + ":" + item.id, css: 'json_viewer', on: ITEM_EVENTS },
            { view: "combo", options: ["String", "Number", "Boolean"], value: "String", width: 100, id: "arg_type" + idx + ":" + item.id, on: ITEM_EVENTS },
            { view: "button", value: "Del", id: "delArg" + idx + ":" + item.id, width: 50, click: del_arg },
        ]
    });
    item.args.push("");
}

function save(buttonId) {
    const id = buttonId.split(":")[1];
    const item = $$('list1').getItem(id);

    webix.ajax().headers({ "Content-type": "application/json" })
        .put('/api/query/' + id, item)
        .catch(function (ret) {
            const data = ret.json();
            webix.message(data.error, "error");
        });
}

function add_new_query(src) {
    const id = '' + webix.uid();

    $$("list1").add({
        id,
        title: src.title ? src.title + ' Copy' : "localhost:3301",
        host: src.host || "localhost",
        port: src.port || 3301,
        type: src.type || "Eval",
        user: src.user || "",
        password: src.password || "",
        query: src.query || "return box.info",
        parent_id: src.parent_id,
        flags: src.flags || 0,
        args: src.args || [],
    }, 0);

    $$("list1").select(id);
}

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
                        { view: "button", value: "Execute", id: "send:" + item.id, width: 100, click: send },
                    ],
                },
                {
                    rows: [
                        { view: "textarea", placeholder: "Query", hidden: item.type !== "Eval", value: item.query, id: "query:" + item.id, css: 'json_viewer', on: ITEM_EVENTS },
                        {
                            id: "call:" + item.id,
                            hidden: item.type !== "Call",
                            rows: [
                                {
                                    cols: [
                                        { view: "text", placeholder: "Call", value: item.query, id: "call_value:" + item.id, css: 'json_viewer', on: ITEM_EVENTS },
                                        { view: "button", value: "Add Arg", id: "add_arg:" + item.id, width: 100, click: add_arg },
                                    ],
                                },
                                {
                                    id: "args:" + item.id,
                                    rows: [],
                                },
                            ],
                        },
                    ],
                },
                { view: "resizer" },
                { view: "textarea", placeholder: "Response", id: "response:" + item.id, readonly: true, css: 'json_viewer' },
            ],
        });

        $$("tabs").addOption({ id: item.id, value: item.title, close: true }, true);

        // TODO: have no idea why the first added tab is not shown
        if ($$("tabs").config.options.length === 1) {
            $$("tabs").setValue(0);
            $$("tabs").setValue(item.id);
        }
    }
    else {
        $$("tabs").setValue(item.id);
    }
}

function on_clicked_tab(id) {
    $$("list1").select(id);
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
                { view: "label", label: "TNT Postman", width: 100 },
                {},
                { view: "button", label: "New Query", width: 100, click: add_new_query },
            ],
        },
        {
            cols: [
                {
                    view: "list", id: "list1",
                    template: "<strong>#type#</strong> #title#",
                    width: 250,
                    url: '/api/query',
                    select: true,
                    on: {
                        onAfterSelect: open_new_tab
                    },
                    onContext: {},
                },
                { view: "resizer" },
                {
                    rows: [
                        {
                            id: "tabs",
                            view: "tabbar",
                            multiview: true,
                            options: [],
                            on: {
                                onAfterTabClick: on_clicked_tab,
                                onOptionRemove: on_delete_tab
                            },
                        },
                        {
                            id: "views",
                            animate: false,
                            cells: [
                                { view: "template", id: "tpl", template: "No query selected" }
                            ]
                        }
                    ],
                },
            ],
        },
    ],
});

webix.ui({
    view: "contextmenu",
    id: "cm",
    data: ["Duplicate", "Delete"],
    master: $$("list1"),
    on: {
        onMenuItemClick: function (id) {
            const context = this.getContext();
            const item = $$('list1').getItem(context.id);

            if (id === "Duplicate") {
                add_new_query(item);
            } else if (id === "Delete") {
                webix.confirm({
                    text: "Are you sure to delete<br />" + item.type + " <strong>" + item.title + "</strong>?",
                    type: "confirm-warning",
                }).then(function (result) {
                    webix.ajax().headers({ "Content-type": "application/json" })
                        .del('/api/query/' + context.id)
                        .then(function () {
                            $$("tabs").removeOption(context.id);
                            $$("list1").remove(context.id);
                        });
                });
            }
        }
    }
});
