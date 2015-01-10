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
      { identify }           = require("sdk/ui/id"),
      { defer }              = require("sdk/core/promise");

const HomePanel = Class({
    implements: [
        EventTarget,
        Disposable
    ],
    initialize: function(options) {
        var eventTarget = this,
            id          = identify(this);
        HomeStorage.requestSync(identify(this), () => {
            var dataStorage = HomeStorage.getStorage(id);

            dataStorage.save(options.data);

            panels.register(id, () => {
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
                            dataset: id,
                            onrefresh: () => {
                                emit(eventTarget, "refresh");
                            }
                            // TODO optional view attributes
                        }
                        //TODO allow multiple views?
                    ]
                }
            });
            setListeners(eventTarget, options);

            panels.install(id);
        });
    },
    dispose: () => {
        this.clear();
        panels.uninstall(identify(this));
        panels.unregister(identify(this));
    },
    setData: (data, overwrite = true) => {
        var deferred = defer(),
            id       = identify(this);

        HomeStorage.requestSync(id, () => {
            var dataStorage = HomeStorage.getStorage(id);
            dataStorage.save(data, {
                replace: overwrite
            }).then((data) => {
                panels.update(this);
                deferred.resolve(data);
            },
            (error) => {
                deferred.reject(error);
            });
        });

        return deferred.promise;
    },
    clear: () => {
        var deferred = defer(),
        id           = identify(this);
        HomeStorage.requestSync(id, () => {
            var dataStorage = HomeStorage.getStorage(id);
            dataStorage.deleteAll().then((data) => {
                panels.update(id);
                deferred.resolve(data);
            },
            (error) => {
                deferred.reject(error);
            });
        });
        
        return deferred.promise;
    } 
});

exports.View = panels.View;
exports.HomePanel = HomePanel;

