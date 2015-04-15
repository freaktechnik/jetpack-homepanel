/*
 * Created by Martin Giger
 * Licensed under MPL 2.0
 */

const { identify } = require("sdk/ui/id");

const { Section, Types, HomePanel } = require("../lib/homepanel");

exports["test exports"] = (assert) => {
    assert.ok(Section);
    assert.ok(Types);
    assert.ok("GRID" in Types);
    assert.ok("LIST" in Types);
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
        onInstall: () => {
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
        sections: [ Section({ type: Types.GRID }) ],
        onInstall: () => {
            panel.hide();
        },
        onUninstall: () => {
            assert.pass("Panel hidden according to the event");
            panel.destroy();
            done();
        }
    });
};

exports["test show"] = (assert, done) => {
    var panel = HomePanel({
        title: "TestPanel",
        sections: [ Section({ type: Types.GRID }) ]
    });

    panel.once("install", () => {
        panel.once("uninstall", () => {
            panel.once("install", () => {
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
        sections: [ Section({ type: Types.GRID }) ],
        onInstall: () => {
            assert.ok(panel.isShowing);
        },
        onUninstall: () => {
            assert.ok(!panel.isShowing);
        }
    });

    panel.once("uninstall", () => {
        panel.once("install", () => {
            panel.destroy();
            done();
        });
        panel.show();
    });
    panel.hide();
};

exports["test dispose"] = (assert, done) => {
    var panel = HomePanel({
        title: "TestPanel",
        sections: [ Section({ type: Types.GRID }) ],
        onUninstall: () => {
            assert.pass();
            done();
        }
    });
    panel.destroy();
};

require("sdk/test").run(exports);

