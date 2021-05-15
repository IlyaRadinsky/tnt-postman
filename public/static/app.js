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

function add_new_query() {
    $$("list1").add({
        title: "New title",
        year: 2000,
        rating: 5,
        votes: 1000
    }, 0);
};

function open_new_tab(id) {
    var item = $$('list1').getItem(id);

    if (!$$(item.id)) {
        $$("views").addView({
            view: "template",
            id: item.id,
            template: "Title:" + item.title + "<br>Year: " + item.year + "<br>Votes: " + item.votes
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
                    data: [
                        { id: 1, title: "The Shawshank Redemption", year: 1994, votes: 678790, rating: 9.2, rank: 1 },
                    ],
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
                        { view: "template", template: "Content", role: "placeholder" },
                    ],
                },
            ],
        },
    ],
});