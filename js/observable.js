(function(window) {
    function Observable(value) {
        this.value = value;
        this.observers = [];

        this.changed = Observable.prototype.changed.bind(this);
        this.get = Observable.prototype.get.bind(this);
        this.notify = Observable.prototype.notify.bind(this);
        this.set = Observable.prototype.set.bind(this);
    };

    Observable.prototype.changed = function(callback) {
        this.observers.push(callback);
    };
    Observable.prototype.notify = function(newValue, oldValue) {
        console.log('Notifying', newValue, oldValue);
        this.observers.forEach(function(cb) { cb(newValue, oldValue); });
    };
    Observable.prototype.get = function() { return this.value; };
    Observable.prototype.set = function(value) {
        var oldValue = this.value;
        this.value = value;

        if (oldValue != this.value) {
            this.notify(this.value, oldValue);
        }
    };

    window.Observable = Observable;
})(window);
