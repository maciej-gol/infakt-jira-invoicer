(function(Jira) {
    var Jira = {};

    Jira.host = new window.StoredValue('jiraHost', '');
    Jira.fetchTimesheet = function(period) {
        return new Promise(function(resolve, reject) {
            chrome.permissions.request(
                {
                    origins: [Jira.host.get()]
                },
                function(granted) {
                    if (!granted) {
                        reject();
                        return;
                    };

                    nanoajax.ajax({
                        'url': Jira.host.get() + 'secure/TempoUserBoard!report.jspa?v=1&periodType=BILLING&periodView=PERIOD&period=' + period,
                        'cors': true
                    },
                    function(code, response) {
                        if (code != 200) {
                            alert('Error fetching jira timesheet.');
                            reject();
                            return;
                        };

                        var re = new RegExp('class="[^"]*level-0[^"]*"[\\s\\S]*?class="nav summary expanded">([^<]+)</td>[\\s\\S]*?class="nav sum"[^>]*?>([^<]+)', 'g');
                        var result;
                        products = [];

                        while (result = re.exec(response)) {
                            products.push([
                                removeDoubleWhitespaces(result[1].trim()),
                                new Number(result[2].trim())
                            ]);
                        };

                        console.log(products);
                        resolve(products);
                    });
                }
            );
        });
    };

    function removeDoubleWhitespaces(string) {
        return string.replace(/\s[\s]+/g, ' ');
    };

    window.Jira = Jira;
})(window);
