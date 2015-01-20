/*
 * Created by Martin Giger
 * Licensed under MPL 2.0
 */

const { Home: { panels: { View } } } = require("resource://gre/modules/Home.jsm"),
      { HomeProvider }               = require("resource://gre/modules/HomeProvider.jsm");

const { Class, merge }       = require("sdk/core/heritage"),
      { EventTarget }        = require("sdk/event/target"),
      { emit, setListeners } = require("sdk/event/core"),
      { stripListeners }     = require("sdk/event/utils"),
      { Disposable }         = require("sdk/core/disposable"),
      { identify }           = require("sdk/ui/id"),
      { defer }              = require("sdk/core/promise"),
      self                   = require("sdk/self"),
      { uuid }               = require("sdk/util/uuid");

let models = new WeakMap();

let modelFor = (view) => models.get(view);

identify.define(Section, (section) => uuid().replace(/[{}]/g, "") +"."+ self.id);

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
            var dataStorage = HomeProvider.getStorage(identify(this)),
                target      = this;
            HomeProvider.requestSync(identify(this), () => {
                dataStorage.save(options.data);
                emit(target, "update");
            });
        }
        else {
            modelFor(this).data = [];
        }

        setListeners(this, options);
    },
    dispose: () => {
        this.clear();

        models.delete(this);
    },
    get id() identify(this),
    get type() modelFor(this).type,
    get data() modelFor(this).data,
    set data(newData) {
        modelFor(this).data = newData;

        var id = identify(this),
            target = this;

        HomeProvider.requestSync(id, () => {
            var dataStorage = HomeProvider.getStorage(id);
            dataStorage.save(data, {
                replace: true
            }).then(() => { emit(target, "update"); });
        });
    },
    addData: (newData) => {
        var deferred = defer(),
            id       = identify(this),
            target   = this;

        if(!HomeProvider.requestSync(id, () => {
            modelFor(this).data = modelFor(this).data.concat(newData);

            var dataStorage = HomeProvider.getStorage(id);
            dataStorage.save(data, {
                replace: false
            }).then((data) => {
                deferred.resolve(data);
                emit(target, "update");
            },
            (error) => {
                deferred.reject(error);
            });
        }))
            deferred.reject("Failed to sync because device is not on a local network");

        return deferred.promise;
    },
    clear: () => {
        var deferred = defer(),
            id       = identify(this),
            target   = this;
        if(!HomeProvider.requestSync(id, () => {
            modelFor(this).data.length = 0;

            var dataStorage = HomeProvider.getStorage(id);
            dataStorage.deleteAll().then((data) => {
                deferred.resolve(data);
                emit(target, "update");
            },
            (error) => {
                deferred.reject(error);
            });
        }))
            deferred.reject("Failed to sync because device is not on a local network");
        
        return deferred.promise;
    },
    getViewDescription: () => {
        var target      = this,
            description = modelFor(this);

        description.dataset = identify(this);
        if(modelFor(this).manuallyRefreshable) {
            description.onrefresh = () => {
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

