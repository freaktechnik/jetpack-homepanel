/*
 * Created by Martin Giger
 * This Source Code Form is subject to the terms of the Mozilla Public License
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://mozilla.org/MPL/2.0/.
 */

const { identify } = require("sdk/ui/id");
const { when } = require("sdk/event/utils");

const { Section, Types, HomePanel } = require("../lib/homepanel");

exports["test exports"] = (assert) => {
    assert.ok(Section);
    assert.ok(Types);
    assert.ok("GRID" in Types);
    assert.ok("LIST" in Types);
    assert.ok(HomePanel);
};

exports["test HomePanel constructor"] = function*(assert) {
    var panel = HomePanel({
        title: "TestPanel",
        sections: [
            Section({
                type: Types.GRID
            })
        ]
    });
    assert.ok(panel);

    yield when(panel, "install");
    assert.pass("Panel was installed");
    panel.destroy();
};

exports["test hide"] = function*(assert) {
    var panel = HomePanel({
        title: "TestPanel",
        sections: [ Section({ type: Types.GRID }) ]
    });

    yield when(panel, "install");
    yield panel.hide();

    assert.pass("Panel hidden according to the event");
    panel.destroy();
};

exports["test show"] = function*(assert) {
    var panel = HomePanel({
        title: "TestPanel",
        sections: [ Section({ type: Types.GRID }) ]
    });

    yield when(panel, "install");
    yield panel.hide();

    yield panel.show();

    assert.pass("Panel shown according to the event");
    panel.destroy();
};

exports["test isShowing"] = function*(assert) {
    let panel = HomePanel({
        title: "TestPanel",
        sections: [ Section({ type: Types.GRID }) ]
    });

    yield panel.hide();

    assert.ok(!panel.isShowing);

    yield panel.show();

    assert.ok(panel.isShowing);

    panel.destroy();
};

exports["test dispose"] = function*(assert) {
    var panel = HomePanel({
        title: "TestPanel",
        sections: [ Section({ type: Types.GRID }) ]
    });
    panel.destroy();

    yield when(panel, "uninstall");
    assert.pass("Panel was uninstalled");
};

require("sdk/test").run(exports);

