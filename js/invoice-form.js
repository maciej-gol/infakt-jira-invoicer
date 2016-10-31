(function(window) {
    var hourlySalary = new window.StoredValue('hourlySalary', 0);
    var position = new window.StoredValue('position', '');
    var periodInput = document.getElementById('period');
    var clientsInput = document.getElementById('client');
    var createInvoiceInput = document.getElementById('new-invoice');
    var invoiceLink = document.getElementById('invoice-url');
    var invoice = undefined;

    bindObservableToInputById(window.InFakt.apiKey, 'api-key');
    bindObservableToInputById(window.Jira.host, 'jira-host');
    bindObservableToInputById(hourlySalary, 'hourly-salary');
    bindObservableToInputById(position, 'position');
    window.InFakt.apiKey.changed(refreshClientsList);

    period.value = getNowPeriod();


    document
    .getElementById('fetch-data')
    .addEventListener('click', function() {

        Jira
        .fetchTimesheet(period.value)
        .then(function(products) {
            invoice = new window.Invoice(
                products,
                hourlySalary.get(),
                position.get(),
                clientsInput.value
            );
            createInvoiceInput.disabled = false;
            displayInvoice(invoice);
        });
    });

    createInvoiceInput
    .addEventListener('click', function() {
        if (!invoice) {
            return;
        };
        invoice
        .send()
        .then(function(invoice) {
            createInvoiceInput.disabled = true;
            invoiceLink.href = invoice.getUrl();
            invoiceLink.style.display = '';
        });
    });

    function refreshClientsList() {
        window.Client
        .getList()
        .then(function(clients) {
            clientsInput.innerHTML = '';
            clients.entities.forEach(function(client) {
                clientsInput.innerHTML += '<option value="' + client.id + '"> ' + client.company_name + '</option>';
            });
        });
    };

    function bindObservableToInputById(observable, inputId) {
        var input = document.getElementById(inputId);
        input.addEventListener('change', function(event) {
            observable.set(event.target.value);
        });
        observable.changed(function(newValue) {
            input.value = newValue;
        });
    };

    function getNowPeriod() {
        var now = new Date();
        return (
            window.Utils.leftPad(now.getMonth() + 1, '0', 2) +
            window.Utils.leftPad(now.getYear() % 100, '0', 2)
        );
    };

    function displayInvoice(invoice) {
        var container = document.getElementById('products');
        container.innerHTML = '';
        invoice.services.forEach(function(service) {
            container.innerHTML += '<tr><td>' + service.name + '</td><td style="text-align: center;">' + service.quantity + '</td></tr>';
        });
    };
})(window);
