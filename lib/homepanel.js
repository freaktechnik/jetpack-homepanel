/*
 * Created by Martin Giger
 * Licensed under MPL 2.0
 */

const { panels }   = require("resource://gre/modules/Home.jsm"),
       HomeStorage = require("resource://gre/modules/HomeProvider.jsm");

const { Class }              = require("sdk/core/heritage"),
      { EventTarget }        = require("sdk/event/target"),
      { emit, setListeners } = require("sdk/event/core"),
      { Disposable }         = require("sdk/core/disposable"),
      { identify }           = require("sdk/ui/id");

const HomePanel = Class({
    implements: [
        EventTarget,
        Disposable
    ],
    initialize: function(options) {
        var eventTarget = this,
            dataStorage = HomeStorage.getStorage(identify(this));

        dataStorage.save(options.data);

        panels.register(identify(this), () => {
            return {
                title: options.title,
                layout: panels.Layout.FRAME,
                oninstall: () => {
                    emit(eventTarget, "install");
                },
                onuninstall: () => {
                    emit(eventTarget, "uninstall");
                },
                views: [
                    {
                        type: options.type,
                        dataset: identify(this),
                        onrefresh: () => {
                            emit(eventTarget, "refresh");
                        }
                        // TODO optional view attributes
                    }
                    //TODO allow multiple views?
                ]
            }
        });
        setListeners(this, options);

        panels.install(identify(this));
    },
    dispose: () => {
        this.clear();
        panels.uninstall(identify(this));
        panels.unregister(identify(this));
    },
    setData: (data, overwrite) => {
        var dataStorage = HomeStorage.getStorage(idenfity(this));
        return dataStorage.save(data, overwrite);
    },
    clear: () => {
        var dataStorage = HomeStorage.getStorage(idenfity(this));
        return dataStorage.deleteAll();
    } 
});

exports.View = panels.View;
exports.HomePanel = HomePanel;

