/*
 * Created by Martin Giger
 * Licensed under MPL 2.0
 */

const { panels }   = require("resource://gre/modules/Home.jsm");

const { Class }              = require("sdk/core/heritage"),
      { EventTarget }        = require("sdk/event/target"),
      { emit, setListeners } = require("sdk/event/core"),
      { Disposable }         = require("sdk/core/disposable"),
      { identify }           = require("sdk/ui/id");

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

        var eventTarget = this,
            id          = identify(this);

        models.set(this, {
            isShowing: true,
            sections: options.sections
        });
        panels.register(id, () => {
            return {
                title: options.title,
                oninstall: () => {
                    emit(eventTarget, "show");
                },
                onuninstall: () => {
                    emit(eventTarget, "hide");
                },
                views: options.sections.map((section) => section.getViewDescription())
            }
        });
        setListeners(eventTarget, options);

        panels.install(id);
        });
    },
    dispose: () => {
        modelFor(this).sections.forEach((section) => {
            section.dispose();
        });
        panels.uninstall(identify(this));
        panels.unregister(identify(this));

        models.delete(this);
    },
    show: () => {
        panels.install(identify(this));
        modelFor(this).isShowing = true;
    },
    hide: () => {
        panels.uninstall(identify(this));
        modelFor(this).isShowing = false;
    },
    get isShowing: () => modelFor(this).isShowing
});

exports.HomePanel = HomePanel;

const { Section, Types } = require("./homepanel/section");

exports.Section = Section;
exports.Types   = Types;

