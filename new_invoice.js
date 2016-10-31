var apiKey = '';
var hourlySalary = 0;
var jiraHost = '';
var position = '';

chrome.storage.local.get(['apiKey', 'hourlySalary', 'jiraHost', 'position'], function(items) {
    setApiKey(items.apiKey || '');
    setHourlySalary(items.hourlySalary || 0);
    setJiraHost(items.jiraHost || '');
    setPosition(items.position || '');
    console.log(items);
});

chrome.storage.onChanged.addListener(function(changes, areaName) {
    if (areaName !== 'local') {
        return;
    };

    setApiKey((changes.apiKey && changes.apiKey.newValue) || apiKey);
    setHourlySalary((changes.hourlySalary && changes.hourlySalary.newValue) || hourlySalary);
    setJiraHost((changes.jiraHost && changes.jiraHost.newValue) || jiraHost);
    setPosition((changes.position && changes.position.newValue) || position);
});

function setApiKey(value) {
    apiKey = value;
    document.getElementById('api-key').value = value;
};

function setHourlySalary(value) {
    hourlySalary = value;
    document.getElementById('hourly-salary').value = value;
};


function setJiraHost(value) {
    jiraHost = value;
    document.getElementById('jira-host').value = value;
};

function setPosition(value) {
    position = value;
    document.getElementById('position').value = value;
};

[['api-key', 'apiKey'], ['hourly-salary', 'hourlySalary'], ['jira-host', 'jiraHost'], ['position', 'position']].forEach(function(obj) {
    console.log(obj);
    document
    .getElementById(obj[0])
    .addEventListener('change', function(event) {
        var data = {};
        data[obj[1]] = event.target.value;
        console.log('Setting', data);
        chrome.storage.local.set(data);
    });
});

var products = [];
var invoice = null;

document
.getElementById('fetch-data')
.addEventListener('click', function() {
    chrome.permissions.request(
        {
            origins: [jiraHost]
        },
        function(granted) {
            if (!granted) {
                return;
            };

            nanoajax.ajax({
                'url': jiraHost + 'secure/TempoUserBoard!report.jspa?v=1&periodType=BILLING&periodView=PERIOD&period=1016',
                'cors': true
            },
            function(code, response) {
                if (code != 200) {
                    alert('Error fetching jira timesheet.');
                    return;
                }

                var re = new RegExp('class="[^"]*level-0[^"]*"[\\s\\S]*?class="nav summary expanded">([^<]+)</td>[\\s\\S]*?class="nav sum"[^>]*?>([^<]+)', 'g');
                var result;
                products = [];

                while (result = re.exec(response)) {
                    products.push([
                        removeDoubleWhitespaces(result[1].trim()),
                        new Number(result[2].trim())
                    ]);
                };

                invoice = prepareInvoiceFromProducts(products);
                displayInvoice(invoice);
            });
        }
    )
});

function displayInvoice(invoice) {
    var container = document.getElementById('products');
    container.innerHTML = '';
    invoice.services.forEach(function(service) {
        container.innerHTML += '<tr><td>' + service.name + '</td><td style="text-align: center;">' + service.quantity + '</td></tr>';
    });
};

function prepareInvoiceFromProducts(products) {
    var invoice_date = new Date();
    var payment_date = new Date(invoice_date.getTime());
    payment_date.setDate(payment_date.getDate() + 14);

    return {
        currency: "PLN",
        notes: "",
        kind: "vat",
        payment_method: "transfer",
        recipient_signature: "",
        invoice_date: invoice_date.getFullYear() + '-' + (invoice_date.getMonth() + 1) + '-' + invoice_date.getDate(),
        sale_date: invoice_date.getFullYear() + '-' + (invoice_date.getMonth() + 1) + '-' + invoice_date.getDate(),
        payment_date: payment_date.getFullYear() + '-' + (payment_date.getMonth() + 1) + '-' + payment_date.getDate(),
        invoice_date_kind: "sale_date",
        services: products.map(productToService)
    };
};

function productToService(product) {
    return {
        name: position + ", " + product[0],
        quantity: product[1],
        symbol: "",
        tax_symbol: "23",
        unit: "",
        unit_net_price: hourlySalary * 100,
        unit_net_price_before_discount: hourlySalary * 100
    };
};

document
.getElementById('new-invoice')
.addEventListener('click', function() {
    if (!invoice) {
        return;
    };
    sendInvoice(invoice);
});

function sendInvoice(invoice) {
    nanoajax.ajax(
        {
            'method': 'POST',
            'url': 'https://api.infakt.pl/v3/invoices.json',
            'body': JSON.stringify({'invoice': invoice}),
            'headers': {
                'Content-Type': 'application/json',
                'X-inFakt-ApiKey': apiKey,
            },
        },
        function(status, response) {
            console.log(response);
        }
    );
    console.log(invoice);
};

function removeDoubleWhitespaces(string) {
    return string.replace(/\s[\s]+/g, ' ');
};
