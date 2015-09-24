/*
 * Created by Martin Giger
 * Licensed under MPL 2.0
 */

const { Home: { panels: { View, Item } } } = require("resource://gre/modules/Home.jsm"),
      { HomeProvider }               = require("resource://gre/modules/HomeProvider.jsm");
const { Task } = require("resource://gre/modules/Task.jsm");

const { Class, merge }       = require("sdk/core/heritage"),
      { EventTarget }        = require("sdk/event/target"),
      { emit, setListeners } = require("sdk/event/core"),
      { stripListeners }     = require("sdk/event/utils"),
      { Disposable }         = require("sdk/core/disposable"),
      { identify }           = require("sdk/ui/id"),
      { defer }              = require("sdk/core/promise"),
      self                   = require("sdk/self"),
      { uuid }               = require("sdk/util/uuid");

const models = new WeakMap();

const modelFor = (view) => models.get(view);

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

        // make the id persistent accross object copies
        options.id = identify(this);

        models.set(this, stripListeners(options));

        setListeners(this, options);

        if("data" in options)
            this.setData(options.data);
        else
            modelFor(this).data = [];

        if("refreshInterval" in options)
            this.refreshInterval = options.refreshInterval;
    },
    get id() {
        if(modelFor(this) && modelFor(this).id)
            return modelFor(this).id;
        else if(modelFor(this)) {
            modelFor(this).id = identify(this);
            return modelFor(this).id;
        }
        else
            return identify(this);
    },
    get type() {
        return modelFor(this).type;
    },
    get refreshInterval() {
        return modelFor(this).refreshInterval;
    },
    set updateInterval(val) {
        if(modelFor(this).refreshInterval)
            HomeProvider.removePeriodicSync(this.id);

        if(val !== null) {
            HomeProvider.addPeriodicSync(this.id, val, () => {
                emit(this, "refresh", true);
            });
        }
        modelFor(this).refreshInterval = val;
    },
    get data() {
        return modelFor(this).data;
    },
    set data(newData) {
        // ignores promises and stuff...
        this.setData(newData);
    },
    setData: Task.async(function*(newData) {
        if(newData.length > 0) {
            let dataStorage = HomeProvider.getStorage(this.id);
            yield dataStorage.save(newData, { replace: true });
            modelFor(this).data = newData;

            emit(this, "update", newData);
            return newData;
        }
        else {
            return this.clear();
        }
    }),
    addData: Task.async(function*(newData) {
        let dataStorage = HomeProvider.getStorage(this.id);
        yield dataStorage.save(newData, { replace: false });
        modelFor(this).data = this.data.concat(newData);

        emit(this, "update", newData);
        return newData;
    }),
    clear: Task.async(function*() {
        let dataStorage = HomeProvider.getStorage(this.id);
        yield dataStorage.deleteAll();
        modelFor(this).data.length = 0;

        emit(this, "update", modelFor(this).data);
        return modelFor(this).data;
    }),
    requestSync: function()  {
        let { promise, resolve } = defer();
        HomeProvider.requestSync(this.id, resolve);
        return promise;
    },
    dispose: Task.async(function*() {
        yield this.clear();

        models.delete(this);
    }),
    getViewDescription: function() {
        var description = Object.assign({}, modelFor(this));

        description.dataset = this.id;

        if(description.manuallyRefreshable) {
            description.onrefresh = () => {
                emit(this, "refresh");
            };
        }
        delete description.manuallyRefreshable;
        delete description.data;
        delete description.id;

        return description;
    }
});

identify.define(Section, (section) => modelFor(section) ? section.id : uuid().number.replace(/[{}]/g, "") + self.id);

exports.Types = View;
exports.ItemTypes: Item;
exports.Section = Section;

