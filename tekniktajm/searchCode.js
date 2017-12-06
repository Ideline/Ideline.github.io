createSearchResults();

$('.searchBox1').on('keyup', function (e) {

            var searchResults = [];
            e.preventDefault();

            if (e.keyCode == 13) {
                debugger;

                var searchWord = $('.searchBox1').val().toLowerCase();
                $('.searchBox1').val('');
                console.log(searchWord);
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
                            case 3:
                                var matchWord = items[j].description3.toLowerCase();
                                break;
                        }
                        if (matchWord.includes(searchWord)) {
                            searchResults.push(items[j]);
                            console.log(searchResults);
                            console.log(`Matchning index${j}`);
                        }
                    }
                }
            }
        });

        function createSearchResults() {
            debugger;
            for (var i = 0; i < order.items.length; i++) {
                var item = order.items[i];
                var productInfo3 = `<a href="">`
                    + '<tr class="tableRow">'
                    + `<td><img class="checkoutPrImg" src="${item.productImage}" /></td>`
                    + `<td>${item.productName}</td>`
                    + `<td>${item.ref}</td>`
                    + `<td class="alignRight">${item.price} SEK</td>`
                    + '</tr>'
                    + '</a>'
                $('#searchResults_table').append(productInfo3);
                /*
                var productInfo2 = `<div class="checkoutProduct">`
                    + `<div class="justifyStart"><div><img class="checkoutPrImg" src="${item.productImage}" /></div><div><p id="orderConf_PrName" class="name">${item.productName}</p><p class="ref">${item.ref}</p><p>Antal: ${item.number}</p></div></div>`
                    + `<div><p class="price">${item.price} SEK</p></div>`
                    + `</div>`
                $('#orderConf_checkoutProduct').append(productInfo2);*/
            }
        }