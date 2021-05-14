function connect() {

}

webix.ui({
    rows: [
        {
            view: "toolbar",
            padding: { right: 10, left: 10 },
            elements: [
                { view: "label", label: "TNT Viewer", width: 100 },
                { view: "text", placeholder: "host:port", id: "host", width: 200 },
                { view: "text", placeholder: "user", id: "user", width: 100 },
                { view: "text", placeholder: "password", id: "password", width: 100 },
                { view: "button", value: "Connect", css: "webix_primary", width: 100, click: connect },
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