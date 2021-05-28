function on_change_item(val) {
    const parsedId = this.data.id.split(":");
    let name = parsedId[0];
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
    }

    if (item.type === "Call" && name.substring(0, 9) === "arg_value") {
        const idx = +name.substring(9);
        item.args[idx] = val;
    } else {
        if (name === "call_value") {
            name = "query";
        }
        item[name] = val;
    }

    $$("list1").refresh(id);

    $$("save:" + id).define("css", "webix_primary");
}

const ITEM_EVENTS = {
    onChange: on_change_item,
};

function prepare_args(item) {
    if (item.type === "Call") {
        item.args.forEach(function (v, idx) {
            if (!v || v.length === 0) {
                item.args[idx] = null;
            } else {
                const arg_type_id = "arg_type" + idx + ":" + item.id;
                const arg_type = $$(arg_type_id).getValue();

                if (arg_type === "Number") {
                    item.args[idx] = +v;
                } else if (arg_type === "Boolean") {
                    item.args[idx] = v.toLowerCase() === 'true';
                }
            }
        });
    } else {
        item.args = [];
    }
}

function send(buttonId) {
    const id = buttonId.split(":")[1];
    const orig_item = $$('list1').getItem(id);
    const item = _.cloneDeep(orig_item);

    prepare_args(item);

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

function build_args(item) {
    const args = [];

    item.args.forEach(function (v, idx) {
        const arg_type = _.isNumber(v) ? "Number" : (_.isBoolean(v) ? "Boolean" : "String");
        const arg_value = _.toString(v);

        args.push({
            id: "arg" + idx + ":" + item.id,
            cols: [
                { view: "text", placeholder: "Arg", id: "arg_value" + idx + ":" + item.id, css: 'json_viewer', on: ITEM_EVENTS, value: arg_value },
                { view: "combo", options: ["String", "Number", "Boolean"], value: arg_type, width: 100, id: "arg_type" + idx + ":" + item.id, on: ITEM_EVENTS },
                { view: "icon", id: "delArg" + idx + ":" + item.id, icon: "wxi-minus", tooltip: "Delete Argument", click: del_arg },
            ]
        });

        item.args[idx] = arg_value;
    });

    return args;
}

function del_arg(buttonId) {
    const idx = +(buttonId.split(":")[0].substring(6));
    const id = buttonId.split(":")[1];
    const item = $$('list1').getItem(id);
    item.args.splice(idx, 1);

    webix.ui(
        {
            id: "args:" + item.id,
            rows: build_args(item),
        },
        $$("call:" + item.id),
        $$("args:" + item.id),
    );
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
            { view: "icon", id: "delArg" + idx + ":" + item.id, icon: "wxi-minus", tooltip: "Delete Argument", click: del_arg },
        ]
    });
    item.args.push("");
}

function save(buttonId) {
    const id = buttonId.split(":")[1];
    const orig_item = $$('list1').getItem(id);
    const item = _.cloneDeep(orig_item);

    prepare_args(item);

    item.parent_id = item.parent_id === "root" ? null : item.parent_id;

    webix.ajax().headers({ "Content-type": "application/json" })
        .put('/api/query/' + id, item)
        .catch(function (ret) {
            const data = ret.json();
            webix.message(data.error, "error");
        });
}

function export_query(buttonId) {
    const id = buttonId.split(":")[1];
    const orig_item = $$('list1').getItem(id);
    const item = _.cloneDeep(orig_item);

    prepare_args(item);

    delete item.id;
    delete item.parent_id;
    delete item.update_ts;

    webix.ui({
        view: "window",
        modal: true,
        move: true,
        width: 600, height: 400,
        position: "center",
        head: "Export to JSON",
        body: {
            rows: [
                { view: "textarea", readonly: true, css: 'json_viewer', value: JSON.stringify(item, null, 4) },
                {
                    cols: [
                        {},
                        {
                            view: "button", value: "Close", width: 100, click: function () {
                                this.getTopParentView().hide();
                            }
                        }
                    ]
                }
            ]
        }
    }).show();
}

function import_query() {
    webix.ui({
        view: "window",
        modal: true,
        move: true,
        width: 600, height: 400,
        position: "center",
        head: "Import from JSON",
        body: {
            rows: [
                { id: "import_json", view: "textarea", css: 'json_viewer' },
                {
                    cols: [
                        {},
                        {
                            view: "button", value: "Import", width: 100, click: function () {
                                try {
                                    const item = JSON.parse($$("import_json").getValue());
                                    add_new_query(item, true);
                                    this.getTopParentView().hide();
                                } catch (e) {
                                    webix.message(e.message, "error");
                                }
                            }
                        },
                        {
                            view: "button", value: "Close", width: 100, click: function () {
                                this.getTopParentView().hide();
                            }
                        }
                    ]
                }
            ]
        }
    }).show();
}

function add_new_query(src, do_import) {
    const id = '' + webix.uid();
    let new_item = {};

    if (do_import) {
        const args = src.args || [];
        const flags = src.flags || 0;
        _.assign(new_item, { id }, src, { args, flags });
    } else {
        _.assign(new_item, {
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
        });
    }

    $$("list1").add(new_item, 0);
    $$("list1").select(id);
}

function open_new_tab(id) {
    const item = $$('list1').getItem(id);

    if (item.type === "Collection") {
        return;
    }

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
                        { view: "button", value: "Export", id: "export:" + item.id, css: "webix_transparent", width: 100, click: export_query },
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
                                        { view: "icon", id: "add_arg:" + item.id, icon: "wxi-plus", tooltip: "Add Argument", click: add_arg },
                                    ],
                                },
                                {
                                    id: "args:" + item.id,
                                    rows: build_args(item),
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

function new_collection() {
    const selectedItem = $$("list1").getSelectedItem();
    const id = '' + webix.uid();
    const parent_id = (selectedItem && selectedItem.parent_id) || null;

    const item = {
        id,
        parent_id,
        type: "Collection",
        title: "New Collection",
        data: [],
        flags: 0,
    };

    webix.ajax().headers({ "Content-type": "application/json" })
        .put('/api/query/' + id, item)
        .then(function (ret) {
            $$("list1").add(item, 0, parent_id || "root");
        })
        .catch(function (ret) {
            const data = ret.json();
            webix.message(data.error, "error");
        });
}

webix.protoUI({
    name: "edittree",
}, webix.EditAbility, webix.ui.tree);

webix.ui({
    rows: [
        {
            view: "toolbar",
            padding: { right: 10, left: 10 },
            elements: [
                { view: "label", label: "TNT Postman", width: 100 },
                { view: "button", label: "Import Query", width: 100, click: import_query },
                {},
                { view: "button", label: "New Query", width: 100, click: add_new_query },
            ],
        },
        {
            cols: [
                {
                    rows: [
                        {
                            cols: [
                                {},
                                { view: "icon", icon: "wxi-plus", tooltip: "New Collection", click: new_collection },
                                { view: "icon", icon: "wxi-minus", tooltip: "Delete Selection", click: function () { } },
                                { view: "icon", icon: "mdi mdi-content-copy", tooltip: "Duplicate", click: function () { } },
                            ]
                        },
                        {
                            view: "edittree", id: "list1",
                            type: "lineTree",
                            template: function (obj, com) {
                                if (obj.type === "Collection") {
                                    return com.icon(obj, com) + obj.title;
                                }
                                return com.icon(obj, com) + "&nbsp;<strong>" + obj.type + "</strong>&nbsp;" + obj.title;
                            },
                            width: 250,
                            drag: true,
                            select: true,
                            editable: true,
                            editor: "text",
                            editValue: "title",
                            editaction: "dblclick",
                            on: {
                                onAfterSelect: open_new_tab,
                                onBeforeEditStart: function (id) {
                                    return id !== "root" && this.getItem(id).type === "Collection";
                                },
                                onEditorChange: function (id, value) {
                                    const item = this.getItem(id);
                                    item.title = value;
                                    save("save:" + id);
                                },
                                onBeforeDrop: function (context, ev) {
                                    if (this.getItem(context.target).type === "Collection") {
                                        context.parent = context.target;
                                        context.index = 0;
                                        this.getItem(context.target).open = true;
                                    } else {
                                        return false;
                                    }
                                },
                                onAfterDrop: function (context, ev) {
                                    const item = this.getItem(context.source);
                                    item.parent_id = context.target === "root" ? null : context.target;
                                    save("save:" + context.source);
                                },
                            },
                            onContext: {},
                            url: {
                                $proxy: true,
                                load: function (view, params) {
                                    return webix.ajax("/api/query")
                                        .then(function (res) {
                                            const data = res.json();
                                            const groped_data = _.groupBy(data, "parent_id");

                                            _.forEach(groped_data, function (v, id) {
                                                const item = _.find(data, { id });
                                                if (item) {
                                                    item.data = v;
                                                    _.remove(data, { parent_id: id });
                                                }
                                            });

                                            return [{
                                                id: "root",
                                                title: "Collections",
                                                type: "Collection",
                                                open: true,
                                                data,
                                            }];
                                        });
                                },
                            }
                        },
                    ],
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
                const is_collection = item.type === "Collection";
                let text = "Are you sure to delete<br />" + item.type + " <strong>" + item.title + "</strong>";
                let body = null;

                if (is_collection) {
                    text += "<br />with all nested elements";
                    body = _.flatMapDeep(item.data, function(v) { return v.data });
                }

                webix.confirm({
                    text: text + "?",
                    type: "confirm-warning",
                }).then(function (result) {
                    webix.ajax().headers({ "Content-type": "application/json" })
                        .del('/api/query/' + context.id, body)
                        .then(function () {
                            $$("tabs").removeOption(context.id);
                            $$("list1").remove(context.id);
                        });
                });
            }
        }
    }
});
