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
    extends: EventTarget,
    implements: [
        Disposable
    ],
    setup: function(options) {
        if(options.sections.length > 1)
            console.warn("Firefox currently only supports one section");

        models.set(this, mix({ isShowing: true }, stripListeners(options)));

        var eventTarget  = this,
            id           = identify(this),
            panelOptions = () => {
                return {
                    title: eventTarget.title,
                    oninstall: () => {
                        eventTarget.isShowing = true;
                        emit(eventTarget, "install");
                    },
                    onuninstall: () => {
                        eventTarget.isShowing = false;
                        emit(eventTarget, "uninstall");
                    },
                    views: eventTarget.sections.map((section) => section.getViewDescription())
                };
            };

        try {
            panels.register(id, panelOptions);
        }
        catch(e) {
            // Panel already exists? Well, we want to be the panel.
            panels.unregister(id);
            panels.register(id, panelOptions);
        }

        setListeners(eventTarget, options);

        try {
            panels.install(id);
        }
        catch(e) {
            // panel was installed before, let's just update it
            panels.update(id);
        }
    },
    show: function() {
        panels.install(identify(this));
    },
    hide: function() {
        panels.uninstall(identify(this));
    },
    get isShowing() modelFor(this).isShowing,
    get title() modelFor(this).title,
    set title(val) {
        modelFor(this).title = val;
        panels.update(identify(this));
    },
    get sections() modelFor(this).sections,
    set sections(val) {
        modelFor(this).sections = val;
        panels.update(identify(this));
    },
    dispose: function() {
        if(this.isShowing)
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

