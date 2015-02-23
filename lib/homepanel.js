/*
 * Created by Martin Giger
 * Licensed under MPL 2.0
 */

const { Home: { panels } }   = require("resource://gre/modules/Home.jsm");

const { Class, mix }       = require("sdk/core/heritage"),
      { EventTarget }        = require("sdk/event/target"),
      { emit, setListeners } = require("sdk/event/core"),
      { stripListeners }     = require("sdk/event/utils"),
      { Disposable }         = require("sdk/core/disposable"),
      { identify }           = require("sdk/ui/id"),
      self                   = require("sdk/self");

let models = new WeakMap();

let modelFor = (view) => models.get(view);

const HomePanel = Class({
    implements: [
        EventTarget,
        Disposable
    ],
    setup: function(options) {
        if(options.sections.length > 1)
            console.warn("Firefox currently only supports one section");

        models.set(this, mix({ isShowing: true }, stripListeners(options)));

        var eventTarget = this,
            id          = identify(this);

        panels.register(id, () => {
            var model = modelFor(eventTarget);
            return {
                title: model.title,
                oninstall: () => {
                    emit(eventTarget, "install");
                },
                onuninstall: () => {
                    emit(eventTarget, "uninstall");
                },
                views: model.sections.map((section) => section.getViewDescription())
            };
        });

        setListeners(eventTarget, options);

        panels.install(id);
    },
    show: () => {
        panels.install(identify(this));
        modelFor(this).isShowing = true;
    },
    hide: () => {
        panels.uninstall(identify(this));
        modelFor(this).isShowing = false;
    },
    get isShowing() modelFor(this).isShowing,
    get title() modelFor(this).title,
    set title(val) {
        modelFor(this).title = val;
        panels.update(id);
    },
    dispose: () => {
        panels.uninstall(identify(this));
        panels.unregister(identify(this));

        models.delete(this);
    }
});

identify.define(HomePanel, (panel) => panel.title.replace(/\s/g, "") + self.id);

exports.HomePanel = HomePanel;

const { Section, Types } = require("./homepanel/section");

exports.Section = Section;
exports.Types   = Types;

