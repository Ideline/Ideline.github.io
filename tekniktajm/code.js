(function ($) {

    "use strict";


    $(function () {

        var $form = $("#form2");
        var $input = $('#cardNumber');
        var order = loadOrder();
        //test();
        sendOrder();

        $input.on("keyup", function (event) {

            // Om användaren väljer att markera text i inputen så aktiveras inte keyup-eventet
            var selection = window.getSelection().toString();
            if (selection !== '') {
                return;
            }

            // När användaren trycker på piltangenterna så aktiveras inte keyup-eventet
            if ($.inArray(event.keyCode, [38, 40, 37, 39]) !== -1) {
                return;
            }


            var $this = $(this);

            // Hämtar värdet i inputen
            var input = $this.val();
            input = input.replace(/[\D\s\._\-]+/g, "");
            var numTimes = Math.ceil(input.length / 4);
            var newString = '';
            for (var i = 0; i < numTimes; i++) {
                newString = newString + (i > 0 ? ' ' : '') + input.substr(i * 4, 4);
            }

            //input = input ? parseInt(input, 10) : 0;

            $this.val(newString);

        });

        function setPaymentMethod(paymentMethod) {
            order.paymentMethod = paymentMethod;
            saveOrder();
        }

        $('#visa').on('click', function () { 
            setPaymentMethod("Visa");
            $('#creditCardForm').toggle(); 
        });

        $('#masterCard').on('click', function () { 
            setPaymentMethod("MasterCard"); 
            $('#creditCardForm').toggle(); 
        });

        $('#amex').on('click', function () { 
            setPaymentMethod("American Express"); 
            $('#creditCardForm').toggle(); 
        });

        $('#cirrus').on('click', function () { 
            setPaymentMethod("Cirrus"); 
            $('#creditCardForm').toggle(); 
        });

        $('#payPal').on('click', function () { 
            setPaymentMethod("Paypal"); 
            $('#placementPayPoste').toggle(); 
        });

        $('#postePay').on('click', function () { 
            setPaymentMethod("PostePay") 
            $('#placementPayPoste').toggle(); 
        });


        $('#confirm-purchase').on('click', function (event) {

            var cardNumber = $input.val().substr(0, 5) + " **** **** " + $input.val().substr(15);
            var orderId = generateOrderId();
            order.orderId = orderId;
            order.cardNumber = cardNumber;

            saveOrder();
            localStorage.setItem('orderId', orderId);
            sendMail();
            //clearLocalStorage();
        });

        $('#payPalSubmit').on('click', function () {
            localStorage.setItem('paymentMethod', paymentMethod);
            localStorage.removeItem('cardNumber');
            var orderId = generateOrderId();
            localStorage.setItem('orderId', orderId);

        });

        function clearLocalStorage() {
            order = null;
            saveOrder();
        }


        function sendOrder() {
            $('#orderConf_autoResponse').text(`Kära ${order.buyer.firstName}. Tack för att du shoppar på Tekniktajm. Detta är en bekräftelse på att vi har mottagit din beställning
            med uppgifterna nedan. Vi vill informera dig om att om du behöver kontakta vår Kundtjänst, så kommer ditt ärende
            att registreras under ärendenummer ${order.orderId}.`);

            $('#orderConf_orderId').text(`ORDERNR: ${order.orderId}`);
            $('#orderConf_orderDate').text(`ORDERDATUM: ${order.orderDate}`);
            $('#orderConf_deliveryMethod').text(`FRAKTSÄTT: ${order.deliveryMethod}`);
            $('#orderConf_paymentMethod').text(`BETALSÄTT: ${order.paymentMethod}`);
            $('#orderConf_cardNumber').text(`KORTNUMMER: ${order.cardNumber}`);

            $('#orderConf_firstName').text(order.buyer.firstName);
            $('#orderConf_lastName').text(order.buyer.lastName);
            $('#orderConf_streetName').text(order.buyer.streetName);
            $('#orderConf_streetNumber').text(order.buyer.streetNumber);
            $('#orderConf_zipCode').text(order.buyer.zipCode);
            $('#orderConf_city').text(order.buyer.city);
            $('#orderConf_phoneNumber').text(order.buyer.phoneNumber);
            $('#orderConf_email').text(order.buyer.email);
            $('#orderConf_otherInfo').text(order.buyer.otherInfo);

            $('#orderConf_numberProducts').text(order.totalPrice.numberProducts + ' st');
            $('#orderConf_shippingFee').text(order.totalPrice.shippingFee + ' SEK');
            $('#orderConf_totalCost').text(order.totalPrice.totalCost + ' SEK');

            createElements();
        }

        function createElements() {

            for (var i = 0; i < order.items.length; i++) {
                var item = order.items[i];

                var productInfo = '<tr class="tableRow">'
                    + `<td><img class="checkoutPrImg" src="${item.productImage}" /></td>`
                    + `<td>${item.productName}<p class="ref">${item.ref}</p></td>`
                    + `<td><p>${item.number}</p></td>`
                    + `<td class="alignRight">${item.price} SEK</td>`
                    + '</tr>'
                $('#orderConf_table').append(productInfo);

                var productInfo2 = `<div class="checkoutProduct">`
                    + `<div class="justifyStart"><div><img class="checkoutPrImg" src="${item.productImage}" /></div><div><p id="orderConf_PrName" class="name">${item.productName}</p><p class="ref">${item.ref}</p><p>Antal: ${item.number}</p></div></div>`
                    + `<div><p class="price">${item.price} SEK</p></div>`
                    + `</div>`
                $('#orderConf_checkoutProduct').append(productInfo2);
            }
        }

        function createElements2() {

            var products = '';
            for (var i = 0; i < order.items.length; i++) {
                var item = order.items[i];

                var productInfo = '<tr class="tableRow">'
                    + `<td><img class="checkoutPrImg" src="https://ideline.github.io/tekniktajm/${item.productImage}" /></td>`
                    + `<td>${item.productName}<p class="ref">${item.ref}</p></td>`
                    + `<td><p>${item.number}</p></td>`
                    + `<td class="alignRight">${item.price} SEK</td>`
                    + '</tr>'

                products += productInfo;

                var productInfo2 = `<div class="checkoutProduct">`
                    + `<div class="justifyStart"><div><img class="checkoutPrImg" src="https://ideline.github.io/tekniktajm/${item.productImage}" /></div><div><p id="orderConf_PrName" class="name">${item.productName}</p><p class="ref">${item.ref}</p><p>Antal: ${item.number}</p></div></div>`
                    + `<div><p class="price">${item.price} SEK</p></div>`
                    + `</div>`

                products += productInfo2;
            }

            return products;

        }


        function generateOrderId() {
            var orderId = Math.floor((Math.random() * 99999999) + 10000000);
            return orderId;
        }

        function saveOrder() {
            localStorage.setItem("tekniktajm", JSON.stringify(order));
        }

        function loadOrder() {

            var previousOrder = localStorage.getItem('tekniktajm');
            var order;

            if (previousOrder === null) {
                order = {
                    items: [/*{
                        productImage: null,
                        productName: null,
                        ref: null,
                        number: null,
                        price: null,
                    }*/],
                    buyer: {
                        firstName: null,
                        lastName: null,
                        streetName: null,
                        streetNumber: null,
                        zipCode: null,
                        city: null,
                        phoneNumber: null,
                        email: null,
                        otherInfo: null,
                    },
                    totalPrice: {
                        numberProducts: null,
                        shippingFee: null,
                        totalCost: null,
                    },
                    orderId: null,
                    orderDate: null,
                    deliveryMethod: null,
                    paymentMethod: null,
                    cardNumber: null,
                    subscribeEmail: null,

                }

                localStorage.setItem('tekniktajm', JSON.stringify(order));
            }
            else {
                order = JSON.parse(previousOrder);
            }
            return order;
        }

        function test() {
            order.items.push({
                productImage: 'style/img/computer1.jpg',
                productName: 'HP 14-bp093no 14" bärbar dator (svart)',
                ref: 'HP14BP093NO',
                number: '1',
                price: '4 495',
            },
                {
                    productImage: 'style/img/systemCam1.jpg',
                    productName: 'Nikon D5600 Systemkamera +18-55 mm AF-P DX-objektiv',
                    ref: 'D56001855VR',
                    number: '1',
                    price: '6 995',
                });
            order.buyer = {
                firstName: 'Anna-Karin',
                lastName: 'Friberg',
                streetName: 'Fersens väg',
                streetNumber: '4',
                zipCode: '211 42',
                city: 'Malmö',
                phoneNumber: '+46 721869005',
                email: 'akarinwest@gmail.com',
                otherInfo: 'Portkod: 1357',
            }
            order.totalPrice = {
                numberProducts: '2',
                shippingFee: '99,00',
                totalCost: '11 589',
            }
            order.orderId = '65429847';
            order.orderDate = '2017-12-02';
            order.deliveryMethod = 'Express Hem Leverans. På 1-2 arbetsdagar';
            order.paymentMethod = 'MasterCard';
            order.cardNumber = '5547 **** **** 9053';
            saveOrder();
        }

        $('#subscribe').on('click', function (ebola) {
            ebola.preventDefault();
            console.log("tjohej!");
            
            debugger;
            
            order.subscribeEmail = $('#email').val();
            saveOrder();
            sendSubscribeMail();
        });

        function getTemplate(name) {
            return $.ajax({
                type: "GET",
                url: "http://localhost:12345/api/template/" + name
            });
        }

        function sendMail() {
            debugger;
            $.when(getTemplate('order_confirmation_mail.html')).done(function (template) {
                $.ajax({
                    type: "POST",
                    url: "http://localhost:12345/api/mailjet",
                    data: {
                        fromName: "Tekniktajm",
                        toMail: order.buyer.email,
                        toName: order.buyer.firstName,
                        subject: "ORDERBEKRÄFTELSE",
                        textPart: "test",
                        htmlPart: template.html.replace('[ORDERID]', `ORDERNR: ${order.orderId}`).replace('[CARDNUMBER]', `KORTNUMMER: ${order.cardNumber}`)
                        .replace('[ORDERDATE]', `ORDERDATUM: ${order.orderDate}`).replace('[DELIVERYMETHOD]', `FRAKTSÄTT: ${order.deliveryMethod}`).replace('[PAYMENTMETHOD]', `BETALSÄTT: ${order.paymentMethod}`)
                        .replace('[FIRSTNAME]', order.buyer.firstName).replace('[LASTNAME]', order.buyer.lastName).replace('[STREETNAME]', order.buyer.streetName)
                        .replace('[STREETNUMBER]', order.buyer.streetNumber).replace('[ZIPCODE]', order.buyer.zipCode).replace('[CITY]', order.buyer.city)
                        .replace('[PHONENUMBER]', order.buyer.phoneNumber).replace('[EMAIL]', order.buyer.email).replace('[OTHER]', order.buyer.otherInfo)
                        .replace('[NUMBERPRODUCTS]', `${order.totalPrice.numberProducts} st`).replace('[SHIPPINGFEE]', `${order.totalPrice.shippingFee} SEK`)
                        .replace('[TOTALCOST]', `${order.totalPrice.totalCost} SEK`).replace('[PRODUCTS]', createElements2())

                    },
                    success: function (data) {
                        console.log(data);
                    },
                    error: function (err) {
                        console.log(err);
                    },
                });
            });
        }

        function sendSubscribeMail() {
            $.when(getTemplate('newsLetter.html')).done(function (template) {
                $.ajax({
                    type: "POST",
                    url: "http://localhost:12345/api/mailjet",
                    data: {
                        fromName: "Tekniktajm",
                        toMail: order.subscribeEmail,
                        toName: 'Prenumerant',
                        subject: "NYHETSBREV TEKNIKTAJM",
                        textPart: "test",
                        htmlPart: template.html
                    },
                    success: function (data) {
                        console.log(data);
                    },
                    error: function (err) {
                        console.log(err);
                    },
                });
            });
        }
    });
})(jQuery);