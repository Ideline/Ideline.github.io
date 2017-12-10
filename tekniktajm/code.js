function goTo(url) {

    window.location.href = url;
}

(function ($) {

    "use strict";


    $(function () {

        var order = loadOrder();
        sendOrder();
        //test();
        setPaymentSummary();
        createCheckoutElements();

        // ========================================================================================================================================================
        //                                      Funktion för att skapa orderobjektet och lägga till det i localstorage
        // ========================================================================================================================================================
        function loadOrder() {

            var previousOrder = localStorage.getItem('tekniktajm'); // Skapar en variabel med data hämtad från local storage
            // Om det inte finns nån data i local storage så tilldelas "previousOrder" värdet "null"
            var order; // deklarerar en variabel som vi ska returnera ut ur denna funktionen.

            if (previousOrder === null) {
                // Om previousOrder är null dvs om vi inte har lagt till nåt ännu i vår kundvagn, så skapas en tom order med följande struktur
                order = {
                    items: [
                        // {
                        //     productImage: null,
                        //     productName: null,
                        //     ref: null,
                        //     number: null,
                        //     price: null,
                        //     totalPrice: null
                        // }
                    ],
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
                        totalPrice: null,
                        numberProducts: null,
                        shippingFee: '49,00 SEK',
                        totalCost: null,
                    },
                    orderId: null,
                    orderDate: null,
                    deliveryMethod: 'Standard Hem Leverans: På 3-5 arbetsdagar',
                    paymentMethod: null,
                    cardNumber: null,
                    subscribeEmail: null,
                    finished: false

                }
                // Den nya ordern görs sen om till en sträng och skickas in i localstorage
                localStorage.setItem('tekniktajm', JSON.stringify(order));
            }
            else {
                // Om previousOrder innehåller data, dvs om vi redan har lagt till nåt i kundvagnen, så stoppar vi in den datan(som vi hämtat från localstorage)
                // i vår order variabel och returnerar den så att den nu är tillgänglig för alla funktioner i denna filen.
                order = JSON.parse(previousOrder);
            }
            return order;
        }

        // ========================================================================================================================================================
        //                                      Funktion som sparar ändringar vi gör i objektet till localstorage
        // ========================================================================================================================================================
        function saveOrder() {
            localStorage.setItem("tekniktajm", JSON.stringify(order));
        }

        // ================================================================= PAYMENT SIDAN ========================================================================
        // ========================================================================================================================================================
        //                                          Funktion för att stoppa in data i summeringen på paymentsidan
        // ========================================================================================================================================================

        function setPaymentSummary() {
            if (order) {
                $('.numberProducts').find('p').last().text(order.totalPrice.numberProducts);
                $('.shippingFee').find('p').first().text(order.deliveryMethod);
                $('.shippingFee').find('p').last().text(order.totalPrice.shippingFee);
                $('.totalPrice2').find('div').find('p').text(order.totalPrice.totalCost + ' SEK');
            }
        }

        // ========================================================================================================================================================
        //                                      Eventhandler för när man matar in kreditkortsnumret på payment-sidan
        //                              funktionen formaterar om formatet i inputen så att det visas enligt mönstret: "1111 2222 3333 4444"
        // ========================================================================================================================================================

        var $form = $("#form2");
        var $input = $('#cardNumber');

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

            $this.val(newString);

        });

        // ========================================================================================================================================================
        //                              Funktion som lägger in i vårt objekt i localstorage vilken betalningsmetod vi har valt
        //                                  Eventhandlersen togglar också det element som vi ska använda som betalning
        // ========================================================================================================================================================
        function setPaymentMethod(paymentMethod) {
            order.paymentMethod = paymentMethod;
            saveOrder();
        }

        $('#visaBig').on('click', function () {
            setPaymentMethod("Visa");
            $('#creditCardForm').toggle();
        });

        $('#masterCardBig').on('click', function () {
            setPaymentMethod("MasterCard");
            $('#creditCardForm').toggle();
        });

        $('#amexBig').on('click', function () {
            setPaymentMethod("American Express");
            $('#creditCardForm').toggle();
        });

        $('#cirrusBig').on('click', function () {
            setPaymentMethod("Cirrus");
            $('#creditCardForm').toggle();
        });

        $('#payPal').on('click', function () {
            setPaymentMethod("Paypal");
            $('.placementPayPoste').toggle();
        });

        $('#postePay').on('click', function () {
            setPaymentMethod("PostePay")
            $('.placementPayPoste').toggle();
        });

        // ========================================================================================================================================================
        //                                                          Eventhandler för "slutför köp-knapparna"
        // ========================================================================================================================================================

        $('#confirm-purchase').on('click', function (event) {

            date();
            var cardNumber = $input.val().substr(0, 5) + " **** **** " + $input.val().substr(15);
            var orderId = generateOrderId();
            order.orderId = orderId;
            order.cardNumber = cardNumber;
            order.finished = true;

            saveOrder();
            sendMail();
            //clearLocalStorage();
        });

        $('#payPalSubmit').on('click', function () {

            date();
            order.cardNumber = ''
            var orderId = generateOrderId();
            order.orderId = orderId;
            order.finished = true;
            saveOrder();
            sendMail();
            window.location.href = 'order_confirmation.html';
        });

        // ========================================================================================================================================================
        //                                                      Funktion för att rensa ordern i localstorage
        // ========================================================================================================================================================
        function clearLocalStorage() {
            order = null;
            saveOrder();
        }

        // ========================================================================================================================================================
        //                                                            Funktion för att generera orderdatum
        // ========================================================================================================================================================
        function date() {

            var date = new Date();
            var year = date.getFullYear();
            var month = 1 + date.getMonth();
            console.log(month);
            var day = date.getDate();
            order.orderDate = `${year}-${month}-0${day}`
            saveOrder();
        }

        // ========================================================================================================================================================
        //                                                  Funktion för att generera ett random 8-siffrigt orderID
        // ========================================================================================================================================================
        function generateOrderId() {
            var orderId = Math.floor((Math.random() * 99999999) + 10000000);
            return orderId;
        }

        // ========================================================================================================================================================
        //                                          Funktion att stoppa in all data i elementen i vår orderbekräftelse-sida
        // ========================================================================================================================================================
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
            $('#orderConf_shippingFee').text(order.totalPrice.shippingFee);
            $('#orderConf_totalCost').text(order.totalPrice.totalCost + ' SEK');

            createElements();
            if (order.finished) {
                localStorage.removeItem('tekniktajm');
                order = loadOrder();
            }
        }

        // ========================================================================================================================================================
        //                              Funktion för att skapa alla elementen med de köpta produkterna på vår orderbekräftelse-sida 
        // ========================================================================================================================================================
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
                    + `<div><p class="price font18">${item.totalPrice} SEK</p><p>(${item.price} SEK)</p></div>`
                    + `</div>`
                $('#orderConf_checkoutProduct').append(productInfo2);
            }
        }

        // ========================================================================================================================================================
        //                  Funktion för att skapa alla elementen med de köpta produkterna i den orderbekräftelse som skickas på till kundens mail
        // ========================================================================================================================================================
        function createElements2() {

            var products = '';
            for (var i = 0; i < order.items.length; i++) {
                var item = order.items[i];
                var image = item.productImage.replace('file:///C:/Users/AK/HTMLprojekt/tekniktajm/', '');

                var productInfo = '<tr class="tableRow">'
                    + `<td><img class="checkoutPrImg" src="https://ideline.github.io/tekniktajm/${image}" /></td>`
                    + `<td>${item.productName}<p class="ref">${item.ref}</p></td>`
                    + `<td><p>${item.number}</p></td>`
                    + `<td class="alignRight">${item.price} SEK</td>`
                    + '</tr>'

                products += productInfo;

                // var productInfo2 = `<div class="checkoutProduct">`
                //     + `<div class="justifyStart"><div><img class="checkoutPrImg" src="https://ideline.github.io/tekniktajm/${item.productImage}" /></div><div><p id="orderConf_PrName" class="name">${item.productName}</p><p class="ref">${item.ref}</p><p>Antal: ${item.number}</p></div></div>`
                //     + `<div><p class="price">${item.price} SEK</p></div>`
                //     + `</div>`

                // products += productInfo2;
            }

            return products;
        }

        // ========================================================================================================================================================
        //                              Funktion för att hämta ut templaten som används när vi mailar kunden eller prenumeranten
        // ========================================================================================================================================================
        function getTemplate(name) {
            return $.ajax({
                type: "GET",
                url: "http://localhost:12345/api/template/" + name
            });
        }

        // ========================================================================================================================================================
        //                                      Funktion för att skicka ut orderbekräftelsen via mail till kunden
        // ========================================================================================================================================================
        function sendMail() {

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
                            .replace('[NUMBERPRODUCTS]', `${order.totalPrice.numberProducts} st`).replace('[SHIPPINGFEE]', `${order.totalPrice.shippingFee}`)
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
        // ========================================================================================================================================================
        //                                              Funktion för att skicka ut välkomstbrev till prenumeranter
        // ========================================================================================================================================================
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

        // ========================================================================================================================================================
        //     Funktion som jag använde för att läsa in data från alla vässentliga element när jag ville skapa ett en lista med objekt innhållande alla produkter
        // ========================================================================================================================================================

        // function addToProductList() {

        //     var item = {
        //         url: window.location.href,
        //         productName: $('.productName').text(),
        //         ref: $('.part').text(),
        //         review: $('.review').text(),
        //         energyIcon: $('.energyIcon').text(),// alla produkter har inte denna
        //         price: $('.priceTag').text(),
        //         description: $('.descriptions').find('p').text().replace('\n', ''),
        //         description1: $('.descriptions li').first().text(),
        //         description2: $('.descriptions li').last().prev().text(),
        //         description3: $('.descriptions li').last().text(),
        //         specifications: $('#specifications').prop('href'),
        //         productImage: $('.mainIMG').prop('src'),
        //         stars: $('.starsYellow2').prop('class').replace('starsYellow2', ''),
        //     }

        //     order.items.push(item);
        //     saveOrder();
        // }
        // // Använde köpknappen för att lägga till varje produkt i listan
        // $('.buyButton').on('click', function () {
        //     console.log('bajs')
        //     addToProductList();
        // });

        // ========================================================================================================================================================
        //         Använde denna kod för att hämta ut datan från localstorage som sen stoppades in i arrayn med alla produktobjekten i js-filen productsCode.js
        // ========================================================================================================================================================
        //      skriv i consollen:

        //      var getObject = JSON.parse(localStorage.getItem('tekniktajm'));
        //      JSON.stringify(getObject.items);




        // ========================================================================================================================================================
        //                          Funktion med testdata som jag använde när jag skulle skapa alla funktioner för orderbekräftelsen
        // ========================================================================================================================================================
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

            order.subscribeEmail = $('#email').val();
            saveOrder();
            sendSubscribeMail();
        });








        //==================================================================== SÖKFUNKTIONEN ======================================================================
        // ========================================================================================================================================================
        // ========================================================================================================================================================
        //                                                              Eventhandler för sökrutan
        // ========================================================================================================================================================

        $('#searchBox1').on('keyup', function (e) {
            e.preventDefault();

            var searchWord = $('#searchBox1').val().toLowerCase();
            var searchResults = search(searchWord);
            if (searchWord.length === 0) {
                $('#searchSuggestions').hide();
                return;
            }

            if (e.keyCode == 13) { // Enter tryck
                debugger;
                var hitRows = $('.hitRow');
                var hasActive2 = hasActive(hitRows);
                if (!hasActive2) {
                    if (searchResults && searchResults.length > 0) {
                        window.location.href = 'searchResults.html';
                    }
                    else {
                        window.location.href = 'noMatch.html';
                    }
                }
                else {
                    for (var i = 0; i < hitRows.length; i++) {
                        if ($(hitRows[i]).hasClass('active2')) {
                            var url = $(hitRows[i]).data('url');
                            window.location.href = url;
                        }
                    }
                }
            }

            if (e.keyCode === 40) { // Pil ner
                var hitRows = $('.hitRow');
                var hasActive2 = hasActive(hitRows);
                if (hasActive2) {
                    for (var i = 0; i < hitRows.length; i++) {
                        if ($(hitRows[i]).hasClass('active2') && i < hitRows.length - 1) {
                            $(hitRows[i]).removeClass('active2');
                            $(hitRows[i + 1]).addClass('active2');
                            break;
                        }
                    }
                }
                else {
                    $(hitRows[0]).addClass('active2');
                }
            }
            else if (e.keyCode === 38) { // Pil  upp
                var hitRows = $('.hitRow');
                var hasActive2 = hasActive(hitRows);
                if (hasActive2) {
                    for (var i = 0; i < hitRows.length; i++) {
                        if ($(hitRows[i]).hasClass('active2') && i > 0) {
                            $(hitRows[i]).removeClass('active2');
                            $(hitRows[i - 1]).addClass('active2');
                            break;
                        }
                        else if ($(hitRows[i]).hasClass('active2') && i === 0) {
                            $(hitRows[i]).removeClass('active2');
                        }
                    }
                }
            }

            else if (searchResults.length > 0) {
                $('#searchSuggestions').show();
                var searchSuggestions = '';
                for (var i = 0; i < searchResults.length; i++) {
                    searchSuggestions += `<div class="hitRow" data-url="${searchResults[i].url}">${searchResults[i].productName}</div>`
                    if (i === 9) {
                        break;
                    }
                }
                $('#searchSuggestions').html(searchSuggestions);
            }
            else {
                $('#searchSuggestions').hide();
            }

            // ========================================================================================================================================================
            //                                                    Eventhandler för om man klickar på ett sökförslag
            // ========================================================================================================================================================

            $('#searchSuggestions').find('.hitRow').on('click', function () {
                var url = $(this).data('url');
                window.location.href = url;
            });
        });

        // ========================================================================================================================================================
        //                                                  Funktion för att se om något sökförslag är markerat
        // ========================================================================================================================================================

        function hasActive(hitRows) {
            var hasActive2 = false;
            for (var i = 0; i < hitRows.length; i++) {
                if ($(hitRows[i]).hasClass('active2')) {
                    hasActive2 = true;
                }
            }
            return hasActive2;
        }


        // ========================================================================================================================================================
        //                                                                      Sökfunktion
        // ========================================================================================================================================================

        function search(searchWord) {
            var searchResults = [];
            saveSearch(searchResults);

            var noMatch = true;
            var newMatch = true;

            //$('#searchBox1').val('');
            //console.log(searchWord);
            for (var i = 0; i < 5; i++) {

                for (var j = 0; j < items.length; j++) {

                    switch (i) {
                        case 0:
                            var matchWord = items[j].productName.toLowerCase();
                            break;
                        case 1:
                            var matchWord = items[j].ref.toLowerCase();
                            break;
                        case 2:
                            var matchWord = items[j].description1.toLowerCase();
                            break;
                        case 3:
                            var matchWord = items[j].description2.toLowerCase();
                            break;
                        case 4:
                            var matchWord = items[j].description3.toLowerCase();
                            break;
                    }
                    if (searchResults.length !== 0) {
                        for (var k = 0; k < searchResults.length; k++) {
                            if (items[j].ref.toLowerCase() === searchResults[k].ref.toLowerCase()) {
                                newMatch = false;
                            }
                        }
                        if (newMatch) {
                            if (matchWord.includes(searchWord)) {
                                searchResults.push(items[j]);
                                noMatch = false;
                            }
                        }
                    }
                    else {
                        if (matchWord.includes(searchWord)) {
                            searchResults.push(items[j]);
                            console.log(`Matchning index${j}`);
                            noMatch = false;
                        }
                    }
                }
            }
            saveSearch(searchResults);
            return searchResults;
        }

        // ========================================================================================================================================================
        //                                                           Sparar sökresultaten till localstorage
        // ========================================================================================================================================================

        function saveSearch(searchResults) {
            localStorage.setItem("searchResults", JSON.stringify(searchResults));
        }

        // ========================================================================================================================================================
        //                                                           Hämtar sökresultaten från localstorage
        // ========================================================================================================================================================

        function getSearch() {
            var searchResults = JSON.parse(localStorage.getItem("searchResults"));
            return searchResults;
        }

        // ========================================================================================================================================================
        //                                                          Genererar tabellen med sökresultaten
        // ========================================================================================================================================================
        createSearchResults();
        function createSearchResults() {

            var bajstolle = JSON.parse(localStorage.getItem('searchResults'));
            if (bajstolle) {
                for (var i = 0; i < bajstolle.length; i++) {
                    var searchResult = bajstolle[i];

                    var productInfo3 = `<tr class="searchResultTableRow" data-url='${searchResult.url}'>`
                        + `<td><img class="checkoutPrImg" src="${searchResult.productImage}" /></td>`
                        + `<td class="sansSerif18">${searchResult.productName}</td>`
                        + `<td class="sansSerif15">${searchResult.ref.replace('Artikelnummer: ', '')}</td>`
                        + `<td class="alignRight sansSerif18">${searchResult.price} SEK</td>`
                        + '</tr>'

                    $('#searchResults_table').append(productInfo3);

                    var productInfo5 = `<div class="checkoutProduct">`
                        + `<div class="justifyStart"><div><img class="checkoutPrImg" src="${searchResult.productImage}" /></div><div><p id="orderConf_PrName" class="name sansSerif">${searchResult.productName}</p><p class="ref sansSerif">${searchResult.ref.replace('Artikelnummer: ', '')}</p></div></div>`
                        + `<div><p class="price sansSerif">${searchResult.price} SEK</p></div>`
                        + `</div>`
                    $('#resultsHere').append(productInfo5);
                }
            }
        }


        // ========================================================================================================================================================
        //                                      Gör så att det blir en pointer när man håller över de olika sökresultaten
        // ========================================================================================================================================================
        $('.searchResultTableRow').css('cursor', 'pointer');

        // ========================================================================================================================================================
        //              När man klickar på ett av sökresultaten så hämtar man urlen från det dolda elementet och redirectar till den sidan
        //                                          ska byta ut detta mot data propen OBS OBS OBS!!!!!!!!!!!!!!!!
        // ========================================================================================================================================================
        $('.searchResultTableRow').on('click', function () {
            var searchUrl = $(this).data('url'); // skulle kunnat targetat ett id här istället
            window.location.href = searchUrl;
        });

        // ========================================================================================================================================================
        //                                                              Kod för produktsidorna
        // ========================================================================================================================================================
        // ========================================================================================================================================================
        //                                   Eventhandler för att lägga till en produkt i kundvagnen aka vårt order-objekt
        // ========================================================================================================================================================
        $('.buyButton').on('click', function () {
            // längst upp i vår kod så har vi "var order = loadOrder();" Den körs så fort vi kommer in på en ny html-sida
            // se loadOrder() funktionen för vidare kommentar.
            var match = false;
            var newPart = $('.part').text().replace('Artikelnummer: ', '')
            var part;
            var index;
            // Kollar om det redan finns en vara i korgen med samma artikelnummer
            for (var i = 0; i < order.items.length; i++) {
                part = order.items[i].ref;
                if (newPart === part) {
                    match = true;
                    index = i;
                    i = order.items.length;
                }
            }
            if (match) { // Om samma vara finns så ökas bara number med 1
                order.items[index].number = parseInt(order.items[index].number) + 1;
            }
            else { // Annars pushas hela varan in som ett objekt i listan
                order.items.push({ // Här pushar vi in ett objekt (den produkt där vi har tryckt på "buyButton") i vår items-array som ligger i vårt order-objekt 
                    productImage: $('.mainIMG').prop('src')/*targeta img elementet och hämta src*/,
                    productName: $('.productName').text()/*targeta produktnamnet och hämta innehållet*/,
                    ref: $('.part').text().replace('Artikelnummer: ', '')/*targeta artikelnumret och hämta innehållet*/,
                    number: '1'/*Här ska bara vara 1 då det blir 1 för varje gång vi trycker på köpknappen*/,
                    price: $('.priceTag').text(),
                    totalPrice: null,
                    url: window.location.href,
                })
            }

            saveOrder(); // sparar ordern till localstorage
        });



        //=================================================================================================================================================
        //                                                              Kod för checkoutsidan
        //=================================================================================================================================================
        //=================================================================================================================================================
        //                                              Funktion som skapar element i vår tabell i checkouten
        //=================================================================================================================================================
        function createCheckoutElements() {


            if (order.items.length > 0) {
                $('#checkoutEmptyMessage').hide();
                //$('#appendTableHere').html('');
                for (var i = 0; i < order.items.length; i++) {
                    var item = order.items[i];
                    // Räknar ut det totala priset för en produkt (det kan finnas flera av samma)
                    var totalProductPrice = (parseInt(item.price.replace(' ', '')) * parseInt(item.number)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                    order.items[i].totalPrice = totalProductPrice;

                    var productInfo4 = `<tr class="tableRow" data-url='${item.url}'>`
                        + `<td><img class="checkoutPrImg" src="${item.productImage}" /></td>`
                        + `<td class="linkToProduct">${item.productName}<p class="ref">${item.ref}</p></td>`
                        + `<td><input class="chooseNr" value="${item.number}" type="number" min="1" max="10" /></td>`
                        + `<td class="alignRight"><p class="font18">${totalProductPrice} SEK</p><p>(${item.price} SEK)</p></td>`
                        + `<td class="right"><img class="trash" src="style/img/delete2.png" /></td>`
                        + '</tr>'
                    $('#appendTableHere').append(productInfo4);

                    var productInfo2 = `<div class="checkoutProduct" data-url='${item.url}'>`
                        + `<div class="justifyStart">`
                        + `<div><img class="checkoutPrImg" src="${item.productImage}" /></div>`
                        + `<div><p class="name">${item.productName}</p><p class="ref">${item.ref}</p><input class="chooseNr2" value="${item.number}" type="number" min="1" max="10" /></div>`
                        + `</div>`
                        + `<div class="alignRight"><img class="trashImg" src="style/img/delete2.png" /><p class="price font18">${item.totalPrice} SEK</p><p>(${item.price} SEK)</p></div>`
                        + `</div>`

                    $('.checkoutTable').after(productInfo2);
                }

                // ========================================================================================================================================================
                //                                      Gör så att det blir en pointer när man håller över de olika varorna i checkouten
                // ========================================================================================================================================================
                $('.linkToProduct').css('cursor', 'pointer');
                $('.trashImg').css('cursor', 'pointer');

                // ========================================================================================================================================================
                //              När man klickar på produktnamnet så hämtar man urlen från det dolda elementet och redirectar till den sidan
                //                                          ska byta ut detta mot data propen OBS OBS OBS!!!!!!!!!!!!!!!!
                // ========================================================================================================================================================
                $('.linkToProduct').on('click', function () {
                    var checkoutUrl = $(this).parent().data('url'); // skulle kunnat targetat ett id här istället
                    window.location.href = checkoutUrl;
                });
                $('.name').on('click', function () {
                    //debugger;
                    var checkoutUrl = $(this).parent().parent().parent().data('url'); // skulle kunnat targetat ett id här istället
                    window.location.href = checkoutUrl;
                });

                //=================================================================================================================================================
                //                                              Eventhandler för att ta bort en vara från checkouten
                //=================================================================================================================================================
                $('.trash').on('click', function () {
                    // När man trycker på soptunnan så letar funktionen upp artikelnumret på den produkten man klickar på
                    var refToDelete = $(this).parent().parent().find('.ref').text();
                    console.log(refToDelete);

                    for (var i = 0; i < order.items.length; i++) { // Sen loopar man igenom sin order tills man hittar ett matchande artikelnummer
                        var matchRef = order.items[i].ref;

                        if (matchRef === refToDelete) { // När man hittat matchningen så deletar man det objektet från listan
                            order.items.splice(i, 1);
                            i = order.items.length;
                        }
                    }
                    saveOrder();
                    // if(order.items.lenght === 0){
                    //     $('#checkoutEmptyMessage').show();
                    // }
                    location.reload(); // reloadar sidan så att den uppdateras
                    //createCheckoutElements();
                });

                $('.trashImg').on('click', function () {
                    // När man trycker på soptunnan så letar funktionen upp artikelnumret på den produkten man klickar på
                    var refToDelete = $(this).parent().parent().find('.ref').text(); // Denna fick jag ge mig själv en high five på då jag tog den på första försöket haha!!!
                    console.log(refToDelete);

                    for (var i = 0; i < order.items.length; i++) { // Sen loopar man igenom sin order tills man hittar ett matchande artikelnummer
                        var matchRef = order.items[i].ref;

                        if (matchRef === refToDelete) { // När man hittat matchningen så deletar man det objektet från listan
                            order.items.splice(i, 1);
                            i = order.items.length;
                        }
                    }
                    saveOrder();
                    location.reload(); // reloadar sidan så att den uppdateras
                    //createCheckoutElements();
                });
                setCheckoutSummary();
            }
            else {
                $('#checkoutEmptyMessage').show();
                $('.checkoutTable').hide();
                setCheckoutSummary();
            }
        }


        //=================================================================================================================================================
        //                      Funktion för att räkna ut totalbeloppet för en och samma vara som vi har flera av i checkouten
        //=================================================================================================================================================
        function totalPricePerProduct() {
            for (var i = 0; i < order.items.length; i++) {
                var item = order.items[i];
                // Räknar ut det totala priset för en produkt (det kan finnas flera av samma)
                var totalProductPrice = (parseInt(item.price.replace(' ', '')) * parseInt(item.number)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                order.items[i].totalPrice = totalProductPrice;
            }
        }


        //=================================================================================================================================================
        //                                      Funktion för att räkna ut hur många produkter det är i kundvagnen
        //=================================================================================================================================================
        function totalNumberProducts() {

            var totalNumber = 0;
            for (var i = 0; i < order.items.length; i++) {
                totalNumber = parseInt(totalNumber) + parseInt(order.items[i].number);
            }
            order.totalPrice.numberProducts = totalNumber;
            saveOrder();
        }

        //=================================================================================================================================================
        //                                              Funktion för att räkna ut Totalbeloppet i kundvagnen
        //=================================================================================================================================================
        function totalPriceCalculation() {
            var totalP = 0;
            for (var i = 0; i < order.items.length; i++) { // loopar igenom listan och hämtar varje produkts totalpris
                totalP = totalP + parseInt((order.items[i].totalPrice).replace(' ', '')); // vi måste formatera och parsa till int för att kuna göra en korrekt uträkning
            }
            if (totalP === 0) {
                totalP = totalP + ',00';
            }
            order.totalPrice.totalPrice = totalP.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "); // formaterar tillbaka och stoppar in i ordern
        }

        //=================================================================================================================================================
        //                                                 Funktion för att mata in summering i checkouten
        //=================================================================================================================================================
        function setCheckoutSummary() {

            totalNumberProducts(); // ändrar totala antalet produkter
            totalPriceCalculation(); // ändrar totalpriset för alla varor
            $('#totalNumberProducts').text(order.totalPrice.numberProducts);
            $('.totalPrice').find('p').text(`${order.totalPrice.totalPrice} SEK`);// Formaterar om totalpriset med space vid tusental

            if ((parseInt((order.totalPrice.totalPrice).replace(' ', '')) >= 1000) || order.items.length === 0) { // om totalpriset är 1000 sek eller högre så är det gratis frakt 
                $('.suggestedShippingFee').find('p').last().text('0,00 SEK');
            }
            else { // annars sätter vi ett defaultfraktpris som är vår standardleverans
                $('.suggestedShippingFee').find('p').last().text('49,00 SEK');
            }

        }
        //=================================================================================================================================================
        //                                          Eventhandlers för att öka antalet av samma vara i checkouten
        //=================================================================================================================================================

        $('.chooseNr').on('click', function () {
            // när man klickar på "antal-väljaren" så hämtar funktionen värdet som står i den
            var newNumber = $(this).val();
            var thisRef = $(this).parent().parent().find('.ref').text(); // Sen letas artikelnumret upp för den produkten
            var index;

            for (var i = 0; i < order.items.length; i++) { // Man loopar igenom orderlistan och matchar artikelnumren mot varandra
                var matchRef = order.items[i].ref;
                if (thisRef === matchRef) { // Om man hittar en matchning så sätter m an index till artikelnumrets index
                    index = i;
                    i = order.items.length;
                }
            }
            // Nu när vi vet vilket index produkten har i listan så kan vi ändra number på den produkten till det vi har valt
            order.items[index].number = newNumber;
            totalPricePerProduct(); // Vi räknar ut nytt totalpris för just den produkten
            saveOrder();
            $(this).parent().next().find('.font18').text(`${order.items[index].totalPrice} SEK`); // och ändrar priset i tabellen
            setCheckoutSummary(); // och ändrar i summeringen
        });

        $('.chooseNr2').on('click', function () {
            // när man klickar på "antal-väljaren" så hämtar funktionen värdet som står i den
            var newNumber = $(this).val();
            var thisRef = $(this).parent().find('.ref').text(); // Sen letas artikelnumret upp för den produkten
            console.log(thisRef);
            var index;

            for (var i = 0; i < order.items.length; i++) { // Man loopar igenom orderlistan och matchar artikelnumren mot varandra
                var matchRef = order.items[i].ref;
                if (thisRef === matchRef) { // Om man hittar en matchning så sätter m an index till artikelnumrets index
                    index = i;
                    i = order.items.length;
                }
            }
            // Nu när vi vet vilket index produkten har i listan så kan vi ändra number på den produkten till det vi har valt
            order.items[index].number = newNumber;
            totalPricePerProduct(); // Vi räknar ut nytt totalpris för just den produkten
            saveOrder();
            $(this).parent().parent().siblings().find('.font18').text(`${order.items[index].totalPrice} SEK`); // och ändrar priset i tabellen
            setCheckoutSummary(); // och ändrar i summeringen
        });



        //=================================================================================================================================================
        //                                  Eventhandler för om man istället använder tangentbordet för att välja antal
        //=================================================================================================================================================

        $('.chooseNr').on("keyup", function (event) {

            var newNumber = $(this).val();
            var thisRef = $(this).parent().parent().find('.ref').text(); // Sen letas artikelnumret upp för den produkten
            var index;

            if (newNumber === '') {
                $(this).parent().next().find('.font18').text(` SEK`);
            }
            else {
                for (var i = 0; i < order.items.length; i++) { // Man loopar igenom orderlistan och matchar artikelnumren mot varandra
                    var matchRef = order.items[i].ref;
                    if (thisRef === matchRef) { // Om man hittar en matchning så sätter m an index till artikelnumrets index
                        index = i;
                        i = order.items.length;
                    }
                }
                //Nu när vi vet vilket index produkten har i listan så kan vi ändra number på den produkten till det vi har valt
                order.items[index].number = newNumber;
                totalPricePerProduct(); // Vi räknar ut nytt totalpris för just den produkten
                saveOrder();
                $(this).parent().next().find('.font18').text(`${order.items[index].totalPrice} SEK`); // och ändrar priset i tabellen
                setCheckoutSummary(); // och ändrar i summeringen
            }
        });

        $('.chooseNr2').on("keyup", function (event) {

            var newNumber = $(this).val();
            var thisRef = $(this).parent().find('.ref').text(); // Sen letas artikelnumret upp för den produkten
            var index;

            if (newNumber === '') {
                $(this).parent().next().find('.font18').text(` SEK`);
            }
            else {
                for (var i = 0; i < order.items.length; i++) { // Man loopar igenom orderlistan och matchar artikelnumren mot varandra
                    var matchRef = order.items[i].ref;
                    if (thisRef === matchRef) { // Om man hittar en matchning så sätter m an index till artikelnumrets index
                        index = i;
                        i = order.items.length;
                    }
                }
                //Nu när vi vet vilket index produkten har i listan så kan vi ändra number på den produkten till det vi har valt
                order.items[index].number = newNumber;
                totalPricePerProduct(); // Vi räknar ut nytt totalpris för just den produkten
                saveOrder();
                $(this).parent().parent().siblings().find('.font18').text(`${order.items[index].totalPrice} SEK`); // och ändrar priset i tabellen
                setCheckoutSummary(); // och ändrar i summeringen
            }
        });

        //=================================================================================================================================================
        //                                           Eventhandler för att lägga till vald leveransmetod i ordern
        //=================================================================================================================================================

        $('.radioButton').click(function () {
            if ($('.option-input').is(':checked')) {

                order.deliveryMethod = (`${$(this).find('div').find('h3').text()} ${$(this).find('div').find('p').text()}`);
                var shipFee = $(this).siblings().find('p').text();

                if (shipFee === 'Kostnadsfri') {
                    order.totalPrice.shippingFee = '0,00 SEK'
                }
                else {
                    order.totalPrice.shippingFee = shipFee;
                }
                saveOrder();
            }
        });

        //=================================================================================================================================================
        //                                                      Eventhandler för "Gå vidare-knappen"
        //=================================================================================================================================================

        $('#continueToPayment').on('click', function () {

            order.buyer.phoneNumber = $('#checkoutPhoneNumber').val();
            order.buyer.email = $('#checkoutEmail').val();
            order.buyer.firstName = $('#checkoutFirstName').val();
            order.buyer.lastName = $('#checkoutLastName').val();
            order.buyer.streetName = $('#checkoutAddress').val();
            order.buyer.streetNumber = $('#checkoutStreetNumber').val();
            order.buyer.zipCode = $('#checkoutZip').val();
            order.buyer.city = $('#checkoutCity').val();
            order.buyer.otherInfo = $('#checkoutInfoText').val();

            totalCost();
            saveOrder();
            //window.location.href = 'payment.html';

        });

        function totalCost() {
            var totalPriceInt = parseInt((order.totalPrice.totalPrice).replace(' ', ''));
            var shipFee = parseInt((order.totalPrice.shippingFee).replace(',00 SEK', ''));

            if (parseInt(totalPriceInt) >= 1000 && shipFee !== 99) {
                order.totalPrice.shippingFee = '0,00 SEK';
                shipFee = 0;
            }

            order.totalPrice.totalCost = (totalPriceInt + shipFee).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        }

        //=================================================================================================================================================
        //                                                      Kod för slidsen på indexsidan
        //=================================================================================================================================================


        var slideIndex = 0;
        showSlides();

        function showSlides() {
            var i;
            var slides = $('.slideshow');
            if (slides.length > 0) {
                var dots = $('.dot');
                for (i = 0; i < slides.length; i++) {
                    $(slides[i]).hide();
                }
                slideIndex++;
                if (slideIndex > slides.length) { slideIndex = 1 }
                for (i = 0; i < dots.length; i++) {
                    $(dots[i]).removeClass('active');
                }
                $(slides[slideIndex - 1]).show();
                $(dots[slideIndex - 1]).addClass('active');
                setTimeout(showSlides, 3500); // Byter bild var 3,5 sekund
            }
        }

        //=================================================================================================================================================
        //                                                      Eventhandler för "RECENSIONER OCH KOMMENTARER"
        //=================================================================================================================================================



        $(".wrapStars2").click(function () {

            $(".commentSection").toggle();
            window.location.href = ("#jumpTo");
        });

        $(".wrapStars2").css('cursor', 'pointer');



    });
})(jQuery);