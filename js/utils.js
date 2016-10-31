(function(window) {
    window.Utils = {
        leftPad: function(str, padValue, number) {
            if (str.length >= number) return str;

            var pad = '';
            for (var i = 1; i <= number; ++i) {
                pad += padValue;
            };
            return (pad + str).substr(-number);
        },
    };
})(window);
