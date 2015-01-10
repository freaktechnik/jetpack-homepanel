/*
 * Created by Martin Giger
 * Licensed under MPL 2.0
 */

const { panels }   = require("resource://gre/modules/Home.jsm"),
       HomeStorage = require("resource://gre/modules/HomeProvider.jsm");

const { Class }       = require("sdk/core/heritage"),
      { EventTarget } = require("sdk/event/target"),
      { Disposable }  = require("sdk/core/disposable"),
      { identify }    = require("sdk/ui/id");

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
    },
    dispose: () => {
        panels.uninstall(identify(this));
        panels.unregister(identify(this));
    }        
});

exports.View = panels.View;
exports.HomePanel = HomePanel;

