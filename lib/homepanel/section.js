/*
 * Created by Martin Giger
 * Licensed under MPL 2.0
 */

const { Home: { panels: { View } } } = require("resource://gre/modules/Home.jsm"),
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

const requestSync = (id) => {
    let { promise, resolve } = defer();
    HomeProvider.requestSync(id, resolve);
    return promise;
}

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
    get data() {
        return modelFor(this).data;
    },
    set data(newData) {
        // ignores promises and stuff...
        this.setData(newData);
    },
    setData: Task.async(function*(newData) {
        if(newData.length > 0) {
            yield requestSync(this.id);

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
        yield requestSync(this.id);

        let dataStorage = HomeProvider.getStorage(this.id);
        yield dataStorage.save(newData, { replace: false });
        modelFor(this).data = this.data.concat(newData);

        emit(this, "update", newData);
        return newData;
    }),
    clear: Task.async(function*() {
        yield requestSync(this.id);

        let dataStorage = HomeProvider.getStorage(this.id);
        yield dataStorage.deleteAll();
        modelFor(this).data.length = 0;

        emit(this, "update", modelFor(this).data);
        return modelFor(this).data;
    }),
    dispose: Task.async(function*() {
        yield this.clear();

        models.delete(this);
    }),
    getViewDescription: function() {
        var description = Object.assign({}, modelFor(this));

        description.dataset = this.id;

        if(description.manuallyRefreshable) {
            var target = this;
            description.onrefresh = () => {
                emit(target, "refresh");
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
exports.Section = Section;

