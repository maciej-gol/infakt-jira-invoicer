(function(window) {
    var invoice = null;

    function Invoice(products, hourlySalary, position, clientId) {
        this.hourlySalary = hourlySalary;
        this.position = position;

        this.makeServicesFromProducts = Invoice.prototype.makeServicesFromProducts.bind(this);
        this.send = Invoice.prototype.send.bind(this);
        this.getUrl = Invoice.prototype.getUrl.bind(this);

        var invoice_date = new Date();
        var payment_date = new Date(invoice_date.getTime());
        payment_date.setDate(payment_date.getDate() + 14);

        this.currency = 'PLN';
        this.kind = 'vat';
        this.payment_method = 'transfer';
        this.invoice_date = invoice_date.getFullYear() + '-' + (invoice_date.getMonth() + 1) + '-' + invoice_date.getDate();
        this.sale_date = invoice_date.getFullYear() + '-' + (invoice_date.getMonth() + 1) + '-' + invoice_date.getDate();
        this.payment_date = payment_date.getFullYear() + '-' + (payment_date.getMonth() + 1) + '-' + payment_date.getDate();
        this.invoice_date_kind = 'sale_date';
        this.client_id = clientId;
        this.services = this.makeServicesFromProducts(products);
    };

    Invoice.prototype.getUrl = function() {
        return 'https://www.infakt.pl/app/faktury/' + this.id;
    };

    Invoice.prototype.makeServicesFromProducts = function(products) {
        var that = this;
        return products.map(function(product) {
            return {
                name: that.position + ', ' + product[0],
                quantity: product[1],
                symbol: '',
                tax_symbol: '23',
                unit: '',
                unit_net_price: that.hourlySalary * 100,
                unit_net_price_before_discount: that.hourlySalary * 100
            };
        });
    };

    Invoice.prototype.send = function() {
        var that = this;
        return new Promise(function(resolve, reject) {
            nanoajax.ajax(
                {
                    'method': 'POST',
                    'url': 'https://api.infakt.pl/v3/invoices.json',
                    'body': JSON.stringify({'invoice': that}),
                    'headers': {
                        'Content-Type': 'application/json',
                        'X-inFakt-ApiKey': window.InFakt.apiKey.get(),
                    },
                },
                function(status, response) {
                    if (status != 201) {
                        reject();
                        return;
                    };

                    var data = JSON.parse(response);
                    that.id = data.id
                    resolve(that);
                }
            );
        });
    };

    window.Invoice = Invoice;
})(window);
