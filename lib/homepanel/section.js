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

const Section = Class({
    extends: EventTarget,
    implements: [
        Disposable
    ],
    setup: function(options) {
        if(!("type" in options))
            throw new Error("Type of the Section undefined");

        if(!("manuallyRefreshable" in options))
            options.manuallyRefreshable = true;

        models.set(this, stripListeners(options));

        setListeners(this, options);

        if("data" in options) {
            var target = this;
            HomeProvider.getStorage(this.id).save(options.data).then(
                () => { emit(target, "update"); }
            );
        }
        else {
            modelFor(this).data = [];
        }
    },
    get id() identify(this),
    get type() modelFor(this).type,
    get data() modelFor(this).data,
    set data(newData) {
        modelFor(this).data = newData;

        var target = this;

        HomeProvider.requestSync(this.id, (id) => {
            var dataStorage = HomeProvider.getStorage(id);
            dataStorage.save(data, {
                replace: true
            }).then(() => { emit(target, "update", data); });
        });
    },
    addData: function(newData) {
        var deferred = defer(),
            target   = this;

        if(!HomeProvider.requestSync(this.id, (id) => {
            modelFor(target).data = modelFor(target).data.concat(newData);

            var dataStorage = HomeProvider.getStorage(id);
            dataStorage.save(data, {
                replace: false
            }).then((data) => {
                deferred.resolve(data);
                emit(target, "update", data);
            },
            (error) => {
                deferred.reject(error);
            });
        }))
            deferred.reject("Failed to sync because device is not on a local network");

        return deferred.promise;
    },
    clear: function() {
        var deferred = defer(),
            target   = this;

        if(!HomeProvider.requestSync(this.id, (id) => {
            modelFor(target).data.length = 0;

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
    dispose: function() {
        this.clear();
        
        models.delete(this);
    },
    getViewDescription: function() {
        var description = modelFor(this),
            target      = this;

        description.dataset = this.id;
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

identify.define(Section, (section) => uuid().number.replace(/[{}]/g, "") + self.id);

exports.Types = View;
exports.Section = Section;

