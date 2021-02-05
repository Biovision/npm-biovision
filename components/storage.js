const Storage = {
    id: "storage",
    initialized: false,
    session: {
        set: function (key, value) {
            Storage.set("sessionStorage", key, value);
        },
        get: function (key) {
            return Storage.get("sessionStorage", key);
        },
        remove: function (key) {
            Storage.remove("sessionStorage", key);
        }
    },
    local: {
        set: function (key, value) {
            Storage.set("localStorage", key, value);
        },
        get: function (key) {
            return Storage.get("localStorage", key);
        },
        remove: function (key) {
            Storage.remove("localStorage", key);
        }
    },
    init: function () {
        Biovision.storage = this;
        this.initialized = true;
    },
    available: function (type) {
        try {
            const x = "__storage_test__";

            window[type].setItem(x, x);
            window[type].removeItem(x);

            return true;
        } catch (e) {
            return false;
        }
    },
    set: function (type, key, value) {
        if (Storage.available(type)) {
            window[type].setItem(key, value);
        } else {
            console.log("set: Storage " + type + " is not available");
        }
    },
    get: function (type, key) {
        if (Storage.available(type)) {
            return window[type].getItem(key);
        } else {
            console.log("get: Storage " + type + " is not available");
            return null;
        }
    },
    remove: function (type, key) {
        if (Storage.available(type)) {
            window[type].removeItem(key);
        } else {
            console.log("remove: Storage " + type + " is not available");
        }
    }
};

export default Storage;
