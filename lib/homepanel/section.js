/*
 * Created by Martin Giger
 * Licensed under MPL 2.0
 */

const { panels: View }   = require("resource://gre/modules/Home.jsm"),
      HomeStorage = require("resource://gre/modules/HomeProvider.jsm");

const { Class, merge }       = require("sdk/core/heritage"),
      { EventTarget }        = require("sdk/event/target"),
      { emit, setListeners } = require("sdk/event/core"),
      { stripListeners }     = require("./event/utils");
      { Disposable }         = require("sdk/core/disposable"),
      { identify }           = require("sdk/ui/id"),
      { defer }              = require("sdk/core/promise");
//TODO import event options stripper


let models = new WeakMap();

let modelFor = (view) => models.get(view);

const Section = Class({
    implements: [
        EventTarget,
        Disposable
    ],
    setup: (options) => {
        if(!options.manuallyRefreshable)
            options.manuallyRefreshable = true;

        models.set(this, stripListeners(options));

        if(options.data) {
            var dataStorage = HomeStorage.getStorage(identify(this));
            HomeStorage.requestSync(identify(this), () => {
                dataStorage.save(options.data);
            }
        }

        setListeners(this, options);
    },
    dispose: () => {
        this.clear();

        models.delete(this);
    },
    get id: () => identify(this),
    get type: () => modelFor(this).type,
    get data: () => modelFor(this).data,
    set data: (newData) => {
        modelFor(this).data = newData;

        var id       = identify(this);

        HomeStorage.requestSync(id, () => {
            var dataStorage = HomeStorage.getStorage(id);
            dataStorage.save(data, {
                replace: true
            });
        });
    },
    addData: (newData) => {
        var deferred = defer(),
            id       = identify(this);

        HomeStorage.requestSync(id, () => {
            modelFor(this).data = modelFor(this).data.concat(newData);

            var dataStorage = HomeStorage.getStorage(id);
            dataStorage.save(data, {
                replace: false
            }).then((data) => {
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
            id       = identify(this);
        HomeStorage.requestSync(id, () => {
            modelFor(this).data.length = 0;

            var dataStorage = HomeStorage.getStorage(id);
            dataStorage.deleteAll().then((data) => {
                deferred.resolve(data);
            },
            (error) => {
                deferred.reject(error);
            });
        });
        
        return deferred.promise;
    },
    getViewDescription: () => {
        var target      = this,
            description = modelFor(this);

        description.dataset = identify(this);
        if(modelFor(this).manuallyRefreshable) {
            extra.onrefresh = () => {
                emit(target, "refresh");
            };
        }
        delete description.manuallyRefreshable;
        delete description.data;

        return description;
    }
});

exports.Types = View;
exports.Section = Section;

