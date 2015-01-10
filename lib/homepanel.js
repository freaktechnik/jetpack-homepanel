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

let models = new WeakMap();

let modelFor = (view) => models.get(view);

const HomePanel = Class({
    implements: [
        EventTarget,
        Disposable
    ],
    setup: function(options) {
        var eventTarget = this,
            id          = identify(this);

        models.set(this, {
            isShowing: true
        });
        HomeStorage.requestSync(identify(this), () => {
            var dataStorage = HomeStorage.getStorage(id);

            dataStorage.save(options.data);

            panels.register(id, () => {
                return {
                    title: options.title,
                    layout: panels.Layout.FRAME,
                    oninstall: () => {
                        emit(eventTarget, "show");
                    },
                    onuninstall: () => {
                        emit(eventTarget, "hide");
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

        models.delete(this);
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

exports.View = panels.View;
exports.HomePanel = HomePanel;

