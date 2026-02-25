const payBtn = document.getElementById("payBtn");
const statusDiv = document.getElementById("status");
const summaryDiv = document.getElementById("summary");

const cardSection = document.getElementById("cardSection");
const upiSection = document.getElementById("upiSection");

const amountInput = document.getElementById("amount");
const nameInput = document.getElementById("name");
const contactInput = document.getElementById("contact");

function sanitize(input) {
    return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function clearErrors() {
    document.querySelectorAll(".error").forEach(e => e.textContent = "");
}

function clearPaymentSections() {
    document.getElementById("cardNumber").value = "";
    document.getElementById("cvv").value = "";
    document.getElementById("upi").value = "";
}

// 🔹 Handle Payment Method Change
document.querySelectorAll("input[name='method']").forEach(radio => {
    radio.addEventListener("change", function () {

        document.querySelectorAll(".methodCard").forEach(m => m.classList.remove("active"));
        this.parentElement.classList.add("active");

        cardSection.classList.add("hidden");
        upiSection.classList.add("hidden");

        clearPaymentSections();   // ✅ Clear previous inputs

        if (this.value.includes("Card")) {
            cardSection.classList.remove("hidden");
        }

        if (this.value === "UPI") {
            upiSection.classList.remove("hidden");
        }
    });
});

// 🔹 Pay Button Click
payBtn.addEventListener("click", function () {

    clearErrors();
    summaryDiv.innerHTML = "";   // ✅ Prevent partial display

    let valid = true;

    const amount = amountInput.value;
    const name = sanitize(nameInput.value.trim());
    const contact = sanitize(contactInput.value.trim());
    const method = document.querySelector("input[name='method']:checked");

    // ✅ Amount Validation
    if (!amount || amount <= 0 || amount > 10000) {
        document.getElementById("amountError").textContent = "Enter valid amount (1-10000)";
        valid = false;
    }

    // ✅ Name Validation
    if (!name) {
        document.getElementById("nameError").textContent = "Name required";
        valid = false;
    }

    // ✅ Email / Mobile Validation (Improved)
    if (!contact) {
        document.getElementById("contactError").textContent = "Email or mobile required";
        valid = false;
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const mobileRegex = /^[6-9]\d{9}$/;

        if (!emailRegex.test(contact) && !mobileRegex.test(contact)) {
            document.getElementById("contactError").textContent =
                "Enter valid email or 10-digit mobile";
            valid = false;
        }
    }

    // ✅ Payment Method Required
    if (!method) {
        document.getElementById("methodError").textContent = "Select payment method";
        valid = false;
    }

    // ✅ Card Validation
    if (method && method.value.includes("Card")) {

        const card = document.getElementById("cardNumber").value;
        const cvv = document.getElementById("cvv").value;

        if (!/^\d{16}$/.test(card)) {
            document.getElementById("cardError").textContent = "Invalid 16-digit card number";
            valid = false;
        }

        if (!/^\d{3}$/.test(cvv)) {
            document.getElementById("cvvError").textContent = "Invalid 3-digit CVV";
            valid = false;
        }
    }

    // ✅ UPI Validation
    if (method && method.value === "UPI") {
        const upi = document.getElementById("upi").value.trim();
        if (!/^[\w.-]+@[\w.-]+$/.test(upi)) {
            document.getElementById("upiError").textContent = "Invalid UPI ID";
            valid = false;
        }
    }

    if (!valid) return;

    // 🔹 Simulated Processing
    payBtn.disabled = true;
    statusDiv.innerHTML = "Processing Payment...";

    setTimeout(() => {

        const success = Math.random() < 0.5;
        const txnId = "TXN" + Date.now();
        const dateTime = new Date().toLocaleString();

        const statusText = success ? "Payment Successful" : "Payment Failed";

        statusDiv.innerHTML = success
            ? "<span style='color:green;'>Payment Successful</span>"
            : "<span style='color:red;'>Payment Failed</span>";

        summaryDiv.innerHTML = `
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Amount:</strong> ₹${amount}</p>
            <p><strong>Method:</strong> ${method.value}</p>
            <p><strong>Transaction ID:</strong> ${txnId}</p>
            <p><strong>Date:</strong> ${dateTime}</p>
        `;

        // ✅ Save in Local Storage
        localStorage.setItem("lastPayment", JSON.stringify({
            name,
            amount,
            method: method.value,
            txnId,
            dateTime,
            statusText
        }));

        payBtn.disabled = false;

    }, 2000);
});

// 🔹 Load Data After Refresh
window.onload = function () {

    const savedData = localStorage.getItem("lastPayment");

    if (savedData) {
        const data = JSON.parse(savedData);

        statusDiv.innerHTML = data.statusText === "Payment Successful"
            ? "<span style='color:green;'>Payment Successful</span>"
            : "<span style='color:red;'>Payment Failed</span>";

        summaryDiv.innerHTML = `
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Amount:</strong> ₹${data.amount}</p>
            <p><strong>Method:</strong> ${data.method}</p>
            <p><strong>Transaction ID:</strong> ${data.txnId}</p>
            <p><strong>Date:</strong> ${data.dateTime}</p>
        `;
    }
};