/*
 * Created by Martin Giger
 * Licensed under MPL 2.0
 */

const { identify } = require("sdk/ui/id");

const { Section, Types } = require("../lib/homepanel/section");

function assertSimilar(assert, a, b, msg) {
    assert.equal(JSON.stringify(a), JSON.stringify(b), msg);
}

exports["test exported symbols"] = function(assert) {
    assert.ok(LIST in Types);
    assert.ok(GRID in Types);
    assert.ok(Section);
};

exports["test section construction"] = function(assert) {
    var section = new Section({
        type: Types.LIST
    });
    assert.ok(section instanceof Section);

    section = new Section({
        manuallyRefreshable = false,
        type: Types.GRID
    });
};

exports["test section id"] = function(assert) {
    var section = new Section({
        type: Types.LIST
    });
    assert.equal(section.id, identify(section), "Section's id matches its identification");
};

exports["test getting data"] = function(assert) {
    var data = [
            {
                url: "http://example.com",
                title: "exmple item"
            }
        ],
        section = new Section({
            type: Types.LIST,
            data: data
        });
    assertSimilar(assert, section.data, data, "The data property has the same data as passed in the constructor");
};

exports["test setting data"] = function(assert) {
    var section = new Section({
        type: Types.LIST,
        data: [
            {
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
    assert.equal(section.data[0].url, "http://foo.bar");

    section.data = data;
    assertSimilar(assert, data, section.data, "Setting the data property replaces its current contents");
};

exports["test adding data"] = function(assert, done) {
    var section = new Section({
        type: Types.GRID,
        data: [
            { url: "http://example.com" }
        ]
    });
    assert.equal(section.data.length, 1);

    section.addData([
        { url: "http://foo.bar" }
    ]).then(() => {
        assert.equal(section.data.length, 2, "Data appended to the existing successfully");
        done();
    }, (e) => { assert.fail("Adding data failed: "+e); done(); });
};

exports["test clearing data"] = function(assert, done) {
    var section = new Section({
        type: Types.GRID,
        data: [ { url: "http://example.com" } ]
    });
    assert.equal(section.data.length, 1);
    
    section.clear().then(() => {
        assert.equal(section.data.length, 0, "Data cleared of any contents");
        done();
    }, (e) => {
        assert.fail("failed to remove the data: "+e);
        done();
    });
};

exports["test view description construction"] = function(assert) {
    var section = new Section({
            type: Types.LIST,
            backImageUrl: "http://example.com/blank.png"
        }),
        view = section.getViewDescription();

    assert.equal(view.type, Types.LIST);
    assert.equal(view.dataset, identify(section));
    assert.equal(view.backImageUrl, "http://example.com/blank.png");
    assert.ok(view.onrefresh);
    assert.ok(!data in view);
    assert.ok(!id in view);
    assert.ok(!manuallyRefreshable in view);
};

/*exports["test refresh event"] = function(assert, done) {
};*/


require("sdk/test").run(exports);

