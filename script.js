
const reviewButton = document.getElementById("continuepayment");
const bookingForm = document.querySelector(".bookingform");
const paymentSummary = document.getElementById("paymentsummary");

const testType = document.getElementById("testtype");
const testName = document.getElementById("testname");
const collection = document.getElementById("collection");

// Tests and Packages with Prices

const testOptions = {

    packages: {
        "Basic Health Checkup": 999,
        "Advanced Health Checkup": 1499,
        "Comprehensive Health Checkup": 2499,
        "Premium Health Checkup": 3999,
        "Full Body Checkup": 5499,
        "Liver & Kidney Health Checkup": 6999,
        "Cardiac Health Checkup": 7999,
        "Senior Citizen Health Checkup": 9999
    },

    individual: {
        "Complete Blood Count (CBC)": 250,
        "Hemoglobin (Hb)": 100,
        "Blood Sugar - Fasting": 100,
        "Blood Sugar - PP": 100,
        "HbA1c": 400,
        "Liver Function Test (LFT)": 600,
        "Kidney Function Test (KFT)": 550,
        "Lipid Profile": 450,
        "Thyroid Profile (T3, T4, TSH)": 500,
        "TSH": 300,
        "C-Reactive Protein (CRP)": 400,
        "ESR": 200,
        "Serum Creatinine": 200,
        "Uric Acid": 200,
        "Serum Calcium": 250,
        "Serum Iron": 350,
        "Vitamin B12": 700,
        "Vitamin D (25-OH)": 900,
        "Urine Routine Examination": 150,
        "Electrolytes": 500
    },

    categories: {
        "Blood Tests": 899,
        "Diabetes Tests": 599,
        "Liver Tests": 999,
        "Kidney Tests": 899,
        "Thyroid Tests": 799,
        "Vitamin & Mineral Tests": 1599,
        "Heart & Lipid Tests": 699,
        "Urine Tests": 499
    }
};

// Booking Page

if (bookingForm && reviewButton && paymentSummary && testType && testName) {

    // Hide Step 2 whenever Step 1 changes
    function hideOldSummary() {
        paymentSummary.hidden = true;
    }

    // Populate the second dropdown
    function updateTestNames() {

        const selectedType = testType.value;
        const available = testOptions[selectedType] || {};

        testName.replaceChildren(
            new Option("Select Test or Package Name", "")
        );

        Object.keys(available).forEach(function (name) {
            testName.add(new Option(name, name));
        });

        testName.disabled = !selectedType;
        testName.required = true;

        hideOldSummary();
    }

    // Update address field based on collection type
function updateCollection() {
    hideOldSummary();

    const address = document.getElementById("address");
    const addressGroup = address.closest(".formgroup");

    if (collection.value === "home") {
        addressGroup.hidden = false;
        address.required = true;
    } else {
        addressGroup.hidden = true;
        address.required = false;
        address.value = "";
    }
}

    testType.addEventListener("change", updateTestNames);

    if (collection) {
        collection.addEventListener("change", updateCollection);
    }

    bookingForm.addEventListener("input", hideOldSummary);
    bookingForm.addEventListener("change", hideOldSummary);

    updateTestNames();
    updateCollection();

    
    // Prevent selecting past dates and Sundays
    const dateInput = document.getElementById("date");

    if (dateInput) {

        const today = new Date();

        const localToday = new Date(
            today.getTime() - today.getTimezoneOffset() * 60000
        ).toISOString().split("T")[0];

        dateInput.min = localToday;

        // Prevent Sunday bookings
        dateInput.addEventListener("change", function () {

            if (!dateInput.value) {
                return;
            }

            const selectedDate = new Date(dateInput.value + "T00:00:00");

            if (selectedDate.getDay() === 0) {
                alert("VR Pathlabs is closed on Sundays. Please select another date.");
                dateInput.value = "";
            }
        });
    }


    // Prevent accidental form submission
    bookingForm.addEventListener("submit", function (event) {
        event.preventDefault();
    });

    // Step 2: Review Payment Details
    reviewButton.addEventListener("click", function () {

        // Check that valid tests and packages are selected
        if (
            !testType.value ||
            !testName.value ||
            testOptions[testType.value]?.[testName.value] === undefined
        ) {
            paymentSummary.hidden = true;
            bookingForm.reportValidity();
            return;
        }

        // Validate all required fields
        if (!bookingForm.reportValidity()) {
            paymentSummary.hidden = true;
            return;
        }

        const type = testType.value;
        const name = testName.value;
        const price = testOptions[type][name];

        const patients = Number(
            document.getElementById("patients").value
        );

        // Calculate test amount
        const testAmount = price * patients;

        
        // Home visit charge
        const isHomeVisit = collection.value === "home";

        const homeVisitCharge = isHomeVisit ? 50 : 0;

        // Show charge only for home collection
        const homeVisitRow = document.getElementById("homeVisitRow");

        if (homeVisitRow) {
            homeVisitRow.hidden = !isHomeVisit;
        }

        // Display payment method based on collection type
        const paymentMethod = document.getElementById("paymentmethod");

        if (paymentMethod) {
            paymentMethod.textContent = isHomeVisit
                ? "Pay During Home Visit"
                : "Pay at Centre";
        }

        // Calculate total
        const totalAmount = testAmount + homeVisitCharge;

        const formatAmount = amount =>
            amount.toLocaleString("en-IN");

        // Display selected name
        document.getElementById("testName").textContent = name;

        // Display selected test type
        document.getElementById("packageName").textContent =
            testType.options[testType.selectedIndex].text;

        // Display number of patients
        document.getElementById("paymentpatients").textContent =
            patients;

        // Display amounts
        document.getElementById("testamount").textContent =
            formatAmount(testAmount);

        document.getElementById("visitcharge").textContent =
            formatAmount(homeVisitCharge);

        document.getElementById("totalamount").textContent =
            formatAmount(totalAmount);

        // Open Step 2 after successful validation
        paymentSummary.hidden = false;

        paymentSummary.scrollIntoView({
            behavior: "smooth"
        });
    });

    // Step 3: Preview Booking

    const confirmButton = document.getElementById("confirmbooking");

    if (confirmButton) {

        confirmButton.addEventListener("click", function () {
            // Check booking date again before confirmation
        const dateInput = document.getElementById("date");
        const selectedDate = new Date(dateInput.value + "T00:00:00");

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dateInput.value && (selectedDate < today || selectedDate.getDay() === 0)) {
            alert("Please select a valid booking date. Past dates and Sundays are not allowed.");
            paymentSummary.hidden = true;
            return;
        }

            // Validate the booking form
            if (!bookingForm.reportValidity()) {
                paymentSummary.hidden = true;
                return;
            }

            // Make sure Step 2 has been reviewed
            if (paymentSummary.hidden) {
                alert("Please review your payment details first.");
                return;
            }

            // Store demo details in this browser tab only
            const details = {
                fullname: document.getElementById("fullname").value,
                test: testName.value,
                patients: document.getElementById("patients").value,
                collection: collection.options[collection.selectedIndex].text,
                date: document.getElementById("date").value,
                time: document.getElementById("time").value,
                total: document.getElementById("totalamount").textContent
            };

            sessionStorage.setItem(
                "vrBookingPreview",
                JSON.stringify(details)
            );

            window.location.href = "confirmation.html";
        });
    }
}

// Show time availability alert

let timeAlertShown = false;

function showTimeAlert() {

    if (!timeAlertShown) {

        alert(
            "Dear Customer,\n\n" +
            "Test and sample collection services are available " +
            "between 10:00 AM and 5:00 PM.\n\n" +
            "Please select a time within these hours."
        );

        timeAlertShown = true;
    }
}

// Show demo details on confirmation.html

const preview = document.getElementById("bookingpreview");

if (preview) {

    let details = null;

    try {
        details = JSON.parse(
            sessionStorage.getItem("vrBookingPreview")
        );
    } catch (error) {
        details = null;
    }

    if (details && details.fullname && details.test) {

        const fields = {
            previewname: details.fullname,
            previewtest: details.test,
            previewpatients: details.patients,
            previewcollection: details.collection,
            previewdate: details.date,
            previewtime: details.time,
            previewtotal: details.total
        };

        Object.entries(fields).forEach(function ([id, value]) {

            const element = document.getElementById(id);

            if (element) {
                element.textContent = value || "-";
            }
        });

        preview.hidden = false;

        sessionStorage.removeItem("vrBookingPreview");

    } else {

        const missing = document.getElementById("previewmissing");

        if (missing) {
            missing.hidden = false;
        }
    }
}

//signup password validation

const signupForm = document.querySelector(".loginform");
const signupPassword = document.getElementById("signuppassword");
const confirmPassword = document.getElementById("confirmpassword");

if (signupForm && signupPassword && confirmPassword) {
    signupForm.addEventListener("submit", function(event) {
        event.preventDefault();

        if (signupPassword.value !== confirmPassword.value) {
            confirmPassword.setCustomValidity("Passwords do not match");
            confirmPassword.reportValidity();
            return;
        }

        confirmPassword.setCustomValidity("");
        alert("Signup form validated successfully! This is a demo.");
    });

    confirmPassword.addEventListener("input", function() {
        confirmPassword.setCustomValidity("");
    });

    signupPassword.addEventListener("input", function() {
    confirmPassword.setCustomValidity("");
    });
}

const loginForm = document.getElementById("loginform");

if (loginForm) {
    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();

        alert("Login form submitted! This is a demo.");
    });
}

// Contact Form Validation

const contactForm = document.getElementById("contactform");

if (contactForm) {
    contactForm.addEventListener("submit", function(event) {
        event.preventDefault();

        alert("Enquiry form submitted! This is a demo.");
    });
}

// Test Search
const testSearch = document.getElementById("testsearch");
const searchButton = document.getElementById("searchbutton");

if (testSearch && searchButton) {

    // Search when Enter is pressed
    testSearch.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            searchButton.click();
        }
    });

    // Search when button is clicked
    searchButton.addEventListener("click", function() {

        const searchText = testSearch.value.trim().toLowerCase();

        // Search individual tests first, categories second, packages last
        const rows = [
            ...document.querySelectorAll(".individualtests tbody tr"),
            ...document.querySelectorAll(".testcategories tbody tr"),
            ...document.querySelectorAll(".packagedetails")
        ];

        // Remove previous highlights
        rows.forEach(function(row) {
            row.classList.remove("search-highlight");
        });

        // Check empty search
        if (searchText === "") {
            alert("Please enter a test, category, or package name");
            return;
        }

        let found = false;

        // Find matching result
        for (let row of rows) {

            const content = row.classList.contains("packagedetails")
                ? row.querySelector("h2").textContent.toLowerCase()
                : row.textContent.toLowerCase();

            if (content.includes(searchText)) {

                if (row.classList.contains("packagedetails")) {
                    window.location.hash = row.id;
                }

                row.scrollIntoView({
                    behavior: "smooth", 
                    block: "start"
                });
                

                row.classList.add("search-highlight");

                found = true;
                break;
                }
            }

        // No matching result
        if (!found) {
            alert("No matching test, category, or package found");
        }

    });
}

// Health Package Slider

const packageSlider = document.getElementById("packageSlider");
const prevSlide = document.getElementById("prevslide");
const nextSlide = document.getElementById("nextslide");

if (packageSlider && prevSlide && nextSlide) {

    nextSlide.addEventListener("click", function() {
        packageSlider.scrollBy({
            left: 300,
            behavior: "smooth"
        });
    });

    prevSlide.addEventListener("click", function() {
        packageSlider.scrollBy({
            left: -300,
            behavior: "smooth"
        });
    });
}

const popularSearches = document.querySelectorAll(".popularsearches a[data-search]");

popularSearches.forEach(function(link) {
    link.addEventListener("click", function(event) {
        event.preventDefault();

        const searchText = link.dataset.search;
        const searchInput = document.getElementById("testsearch");
        const searchButton = document.getElementById("searchbutton");

        if (searchInput && searchButton) {
            searchInput.value = searchText;
            searchButton.click();
        }
    });
});