(function(window) {
    function Client() {};

    Client.getList = function() {
        return new Promise(function(resolve, reject) {
            nanoajax.ajax(
                {
                    'method': 'GET',
                    'url': 'https://api.infakt.pl/v3/clients.json',
                    'headers': {
                        'Content-Type': 'application/json',
                        'X-inFakt-ApiKey': window.InFakt.apiKey.get(),
                    },
                },
                function(status, response) {
                    resolve(JSON.parse(response));
                }
            );
        });
    };

    window.Client = Client;
})(window);
