/*
 * Created by Martin Giger
 * Licensed under MPL 2.0
 */

const { identify } = require("sdk/ui/id");
const { when } = require("sdk/event/utils");

const { Section, Types } = require("../lib/homepanel/section");

function assertSimilar(assert, a, b, msg) {
    assert.equal(JSON.stringify(a), JSON.stringify(b), msg);
}

exports["test exported symbols"] = function(assert) {
    assert.ok("LIST" in Types);
    assert.ok("GRID" in Types);
    assert.ok(Section);
};

exports["test section construction"] = function(assert) {
    var section = Section({
        type: Types.LIST
    });
    assert.ok(section instanceof Section);

    section = Section({
        manuallyRefreshable: false,
        type: Types.GRID
    });
    section.destroy();
};

exports["test section id"] = function(assert) {
    var section = Section({
        type: Types.LIST
    });
    assert.equal(section.id, identify(section), "Section's id matches its identification");
    section.destroy();
};

exports["test getting data"] = function*(assert) {
    var data = [
            {
                url: "http://example.com",
                title: "exmple item"
            }
        ],
        section = Section({
            type: Types.LIST,
            data: data
        });
    yield when(section, "update");
    assertSimilar(assert, section.data, data, "The data property has the same data as passed in the constructor");
    section.destroy();
};

exports["test setting data"] = function*(assert) {
    var section = Section({
        type: Types.LIST,
        data: [
            {
                title: "example",
                url: "http://foo.bar"
            }
        ]
    }),
        data = [
            {
                url: "http://example.com",
                title: "example item 2"
            }
        ];
    yield when(section, "update");
    assert.equal(section.data[0].url, "http://foo.bar", "Section initialized properly");

    section.data = data;
    yield when(section, "update");

    assertSimilar(assert, data, section.data, "Setting the data property replaces its current contents");

    section.data = [];
    yield when(section, "update");
    assert.equal(section.data.length, 0);

    section.destroy();
};

exports["test setting data with method"] = function*(assert) {
    var section = Section({
        type: Types.LIST,
        data: [
            {
                title: "example",
                url: "http://foo.bar"
            }
        ]
    }),
        data = [
            {
                url: "http://example.com",
                title: "example item 2"
            }
        ];
    yield when(section, "update");
    assert.equal(section.data[0].url, "http://foo.bar");

    let newData = yield section.setData(data);
    assertSimilar(assert, newData, data);
    assertSimilar(assert, section.data, data);

    section.destroy();
};

exports["test adding data"] = function*(assert) {
    var section = Section({
        type: Types.GRID
    }),
    nd = [
        { title: "example 2", url: "http://foo.bar" }
    ];
    yield section.setData([{ title: "example", url: "http://example.com" }]);

    assert.equal(section.data.length, 1);

    let newData = yield section.addData(nd);
    assert.equal(section.data.length, 2, "Data appended to the existing successfully");
    assertSimilar(assert, newData, nd);
    section.destroy();
};

exports["test clearing data"] = function*(assert) {
    var section = Section({
        type: Types.GRID,
        data: [ { title: "example", url: "http://example.com" } ]
    });
    yield when(section, "update");
    assert.equal(section.data.length, 1);

    yield section.clear();
    assert.equal(section.data.length, 0, "Data cleared of any contents");
    section.destroy();
};

exports["test view description construction"] = function(assert) {
    var section = Section({
            type: Types.LIST,
            backImageUrl: "http://example.com/blank.png"
        }),
        view = section.getViewDescription();

    assert.equal(view.type, Types.LIST);
    assert.equal(view.dataset, section.id);
    assert.equal(view.backImageUrl, "http://example.com/blank.png");
    assert.ok(view.onrefresh);
    assert.ok(!("data" in view));
    assert.ok(!("id" in view));
    assert.ok(!("manuallyRefreshable" in view));
    section.destroy();
};

/*exports["test refresh event"] = function(assert, done) {
};*/


require("sdk/test").run(exports);

