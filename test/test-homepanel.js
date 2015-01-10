/*
 * Created by Martin Giger
 * Licensed under MPL 2.0
 */

const { identify } = require("sdk/ui/id");

const { Section, Types, HomePanel } = require("../lib/homepanel");

exports["test exports"] = (assert) => {
    assert.ok(Section);
    assert.ok(Types);
    assert.ok(GRID in Types);
    assert.ok(LIST in Types);
    assert.ok(HomePanel);
};

exports["test HomePanel constructor"] = (assert, done) => {
    var panel = HomePanel({
        title: "TestPanel",
        sections: [
            Section({
                type: Types.GRID
            })
        ],
        onShow: () => {
            assert.pass();
            panel.destroy();
            done();
        }
    });
    assert.ok(panel);
};

exports["test hide"] = (assert, done) => {
    var panel = HomePanel({
        title: "TestPanel",
        views: [ Section({ type: Types.GRID }) ],
        onShow: () => {
            panel.hide();
        },
        onHide: () => {
            assert.pass("Panel hidden according to the event");
            panel.destroy();
            done();
        }
    });
};

exports["test show"] = (assert, done) => {
    var panel = HomePanel({
        title: "TestPanel",
        views: [ Section({ type: Types.GRID }) ]
    });

    panel.once("show", () => {
        panel.once("hide", () => {
            panel.once("show", () => {
                assert.pass("Panel shown according to the event");
                panel.destroy();
                done();
            });
            panel.show();
        });
        panel.hide();
    });
};

exports["test isShowing"] = (assert, done) => {
    var panel = HomePanel({
        title: "TestPanel",
        views: [ Section({ type: Types.GRID }) ],
        onShow: () => {
            assert.ok(panel.isShowing);
        },
        onHide: () => {
            assert.ok(!panel.isShowing);
        }
    });

    panel.once("show", () => {
        panel.once("hide", () => {
            panel.once("show", () => {
                done();
            });
            panel.show();
        });
        panel.hide();
    });
};

exports["test dispose"] = (assert, done) => {
    var panel = HomePanel({
        title: "TestPanel",
        views: [ Section({ type: Types.GRID }) ],
        onHide: () => {
            assert.pass();
            done();
        }
    }
    panel.destroy();
};

require("sdk/test").run(exports);

