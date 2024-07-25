// Function to load and display favorite products
function loadFavorites() {
    var memberEmail = sessionStorage.getItem('memberEmail');
    var favorites = JSON.parse(sessionStorage.getItem('favorites')) || [];
    var htmlTxt = '';

    if (favorites.length > 0) {
        favorites.forEach(function(furniture) {
            // Display only favorites for the current memberEmail
            if (furniture.memberEmail === memberEmail) {
                htmlTxt += generateFavoriteProductHTML(furniture);
            }
        });
    } else {
        htmlTxt = '<div style="text-align: center; padding: 20px; font-size: 16px;">No favorite products found.</div>';
    }

    // Display generated HTML on the page
    document.getElementById("favoritesDisplay").innerHTML = htmlTxt;
}


// Function to generate HTML for a favorite product
function generateFavoriteProductHTML(furniture) {
    var html = '\
        <li class="col-md-3 col-sm-6 col-xs-12 product" style="padding-bottom: 1%; padding-top: 2%;">\
            <span class="product-thumb-info">\
                <span class="product-thumb-info-image">\
                    <span class="product-thumb-info-act">\
                        <span class="product-thumb-info-act-left">\
                            <a href="furnitureProductDetails.html?sku=' + furniture.sku + '" style="color: white"><em>View Details</em></a>\
                        </span>\
                    </span>\
                    <img alt="" class="img-responsive" src="' + furniture.imageURL + '">\
                </span>\
                <span class="product-thumb-info-content">\
                    <div style="display: flex; justify-content: space-between; align-items: center;">\
                        <h4 style="margin: 0;">' + furniture.name + '</h4>\
                        <button class="favorite-button fa-solid fa-heart" onclick="removeFromFavorites(\'' + furniture.sku + '\')"> </button>\
                    </div>\
                    <span class="product-thumb-info-act-left">\
                        <em>Height: ' + furniture.height + '</em>\
                    </span><br/>\
                    <span class="product-thumb-info-act-left">\
                        <em>Length: ' + furniture.length + '</em>\
                    </span><br/>\
                    <span class="product-thumb-info-act-left">\
                        <em>Width: ' + furniture.width + '</em>\
                    </span><br/>\
                    <span class="product-thumb-info-act-left">\
                        <em>Price: $' + furniture.price + '.00</em>\
                    </span><br/>';

    // Display 'Add To Cart' button only if user is logged in and the favorite belongs to them
    if (furniture.memberEmail === sessionStorage.getItem('memberEmail')) {
        html += '\
            <form action="furnitureProductDetails.html">\
                <input type="hidden" name="sku" value="' + furniture.sku + '"/>\
                <input type="submit" class="btn btn-primary btn-block" value="More Details"/>\
            </form>\
            <button class="btn btn-primary btn-block" onclick="addToCart(\'' + furniture.sku +
                '\',\'' + furniture.id + '\',' + furniture.price + ',\'' + furniture.name + '\',\'' + furniture.imageURL +
                '\', \'' + furniture.cat + '\')">Add To Cart</button>';
    }

    html += '</span></span></li>';

    return html;
}


// Function to remove a product from the favorites list
function removeFromFavorites(s) {
    // Retrieve favorites array from sessionStorage
    var favorites = JSON.parse(sessionStorage.getItem('favorites')) || [];

    // Find index of the product in favorites array
    var index = favorites.findIndex(function(item) {
        return item.sku === s;
    });

    if (index !== -1) {
        // Remove the product from favorites array
        favorites.splice(index, 1);

        // Save the updated favorites array back to sessionStorage
        sessionStorage.setItem('favorites', JSON.stringify(favorites));
    }

    // Refresh the page to reflect the updated favorites list
    location.reload();
}

function addToCart(sku, id, price, name, imageURL, cat) {
    fetch(new Request('/api/getItemQuantity?sku=' + sku + '&storeId=-1', {
        method: 'GET'
    })).then(function(response) {
        return response.json();
    }).then(function(data) {
        var quantity = data[0].sum;
        // Check if there is enough quantity for the product to be added to the cart
        if (quantity == null || quantity == '') {
            var url = window.location.origin + window.location.pathname;
            displayMessage("Item not added to cart, not enough quantity available.");
        } else {
            var allOk = true;
            var shoppingCart = JSON.parse(sessionStorage.getItem('shoppingCart')) || [];

            // Check if shopping cart is empty
            if (shoppingCart == null || shoppingCart == '') {
                shoppingCart = [];
                shoppingCart.push({
                    id: id,
                    sku: sku,
                    price: price,
                    name: name,
                    imgURL: imageURL,
                    quantity: 1
                });
            } else {
                var exist = false;
                for (var i = 0; i < shoppingCart.length; i++) {
                    var cartItem = shoppingCart[i];
                    // If item already exists in the cart, add 1 to the quantity
                    if (cartItem.sku == sku) {
                        if (shoppingCart[i].quantity == quantity) {
                            displayMessage("Item not added to cart, not enough quantity available.");
                            exist = true;
                            allOk = false;
                            break;
                        } else {
                            shoppingCart[i].quantity += 1;
                            exist = true;
                            break;
                        }
                    }
                }
                // If item is new in the cart
                if (!exist) {
                    shoppingCart.push({
                        id: id,
                        sku: sku,
                        price: price,
                        name: name,
                        imgURL: imageURL,
                        quantity: 1
                    });
                }
            }
            if (allOk) {
                sessionStorage.setItem('shoppingCart', JSON.stringify(shoppingCart));
                var url = window.location.origin + window.location.pathname;
                displayMessage("Successfully added!", true);
            }
        }
    }).catch(function(error) {
        console.log(error);
    });
}

function displayMessage(message, isSuccess) {
    var messageElement = document.getElementById("message");
    messageElement.innerHTML = message;

    // Add appropriate class based on isSuccess parameter
    messageElement.className = isSuccess ? "message-success" : "message-error";
    messageElement.style.display = "block";

    // Remove the message after 3 seconds
    setTimeout(function() {
        messageElement.style.display = "none";
    }, 3000); // 3000 milliseconds = 3 seconds
}
