let cart = [];
let total = 0;

function addToCart(name, price) {
    cart.push({ name, price });
    total += price;
    updateCart();
}

function updateCart() {
    const cartList = document.getElementById('cart-items');
    const totalElement = document.getElementById('total');

    cartList.innerHTML = '';
    cart.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.name} - $${item.price.toFixed(2)}`;
        cartList.appendChild(li);
    });

    totalElement.textContent = total.toFixed(2);
}

// PayPal Integration
paypal.Buttons({
    createOrder: (data, actions) => {
        return actions.order.create({
            purchase_units: [{
                amount: { value: total.toFixed(2) }
            }]
        });
    },
    onApprove: (data, actions) => {
        return actions.order.capture().then(details => {
            alert('Transaction completed by ' + details.payer.name.given_name);
            cart = [];
            total = 0;
            updateCart();
        });
    }
}).render('#paypal-button-container');

// Apple Pay Integration
const applePayButton = document.getElementById('apple-pay-button');

if (window.ApplePaySession && ApplePaySession.canMakePayments()) {
    applePayButton.style.display = 'block';
} else {
    applePayButton.style.display = 'none';
}

applePayButton.addEventListener('click', () => {
    const paymentRequest = {
        countryCode: "US",
        currencyCode: "USD",
        supportedNetworks: ["visa", "masterCard", "amex"],
        merchantCapabilities: ["supports3DS"],
        total: {
            label: "Web Store",
            amount: total.toFixed(2)
        }
    };

    const session = new ApplePaySession(3, paymentRequest);

    session.onvalidatemerchant = (event) => {
        session.completeMerchantValidation({});
    };

    session.onpaymentauthorized = (event) => {
        session.completePayment(ApplePaySession.STATUS_SUCCESS);
        alert("Apple Pay transaction successful!");
        cart = [];
        total = 0;
        updateCart();
    };

    session.begin();
});
