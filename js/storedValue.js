(function(window) {
    function StoredValue(name, value) {
        var that = this;

        window.Observable.call(that, value);
        that.name = name;
        that.set = StoredValue.prototype.set.bind(that);
        that.refreshFromStorage = StoredValue.prototype.refreshFromStorage.bind(that);

        chrome.storage.onChanged.addListener(function(changes, areaName) {
            if (areaName !== 'local') return;
            if (!changes[that.name]) return;

            window.Observable.prototype.set.call(that, changes[that.name].newValue);
        });
        that.refreshFromStorage();
    };


    StoredValue.prototype.refreshFromStorage = function() {
        var that = this;
        chrome.storage.local.get(this.name, function(items) {
            window.Observable.prototype.set.call(that, items[that.name]);
        });
    };
    StoredValue.prototype.set = function(value) {
        var data = {};
        data[this.name] = value;
        chrome.storage.local.set(data);
    };

    window.StoredValue = StoredValue;
})(window);
