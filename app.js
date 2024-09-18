import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
// Firebase configuration

let confirmationResult;

const firebaseConfig = {
    apiKey: "AIzaSyAQ7k2jTL7CIV0i8fjKfxcddJShslQtYPo",
    authDomain: "cpalance-c48a7.firebaseapp.com",
    projectId: "cpalance-c48a7",
    storageBucket: "cpalance-c48a7.appspot.com",
    messagingSenderId: "587490960161",
    appId: "1:587490960161:web:c58158bc24dbc2fd0b1460",
    measurementId: "G-38VYMSTK0N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


// Step function start
if (!localStorage.getItem("currentStep")) {
    localStorage.setItem("currentStep", "0");
}
const steps = document.querySelectorAll('section');
let currentStep =parseInt(localStorage.getItem("currentStep"))
let formItems = JSON.parse(localStorage.getItem('formData')) || {
    postalCode: "",
    homeType: "",
    relationType: "",
    monthlyCost: "",
    heatingMethod: "",
    jobType: "",
    birthYear: "",
    city: "",
    clickId: null,
    email: "",
    firstName: "",
    gender: "",
    isChecked: "",
    lastName: "",
    phone: "",
    source: null,
    streetAddress: ""
};

function showStep(stepIndex) {
    steps.forEach((step, index) => {
        step.style.display = index === stepIndex ? 'block' : 'none';
    });
}
showStep(currentStep);

function saveToLocalStorage() {
    localStorage.setItem('formData', JSON.stringify(formItems));
}




document.getElementById('step1').querySelector('button').addEventListener('click', (e) => {
    e.preventDefault();
    const inputVal = document.getElementById('step1').querySelector('input').value.trim();
    if (!inputVal) {
        document.getElementById("validate").classList.add("hidden");
        document.getElementById("empty-input").classList.remove("hidden");
        return;
    }
    document.getElementById("empty-input").classList.add("hidden");

    fetch("https://raw.githubusercontent.com/Stanislas-Poisson/French-zip-code/master/Exports/json/cities.json")
        .then(res => res.json())
        .then(data => {
            const filterItems = data.filter(code => code.zip_code == parseInt(inputVal));
            if (filterItems.length > 0) {
                formItems.postalCode = inputVal;
                saveToLocalStorage();
                moveToNextStep();
            } else {
                document.getElementById("validate").classList.remove("hidden");
            }
        });
});

function handleButtonStepGroup(stepId, key) {
    document.getElementById(stepId).querySelectorAll('button').forEach(button => {
        button.addEventListener('click', (e) => {
            formItems[key] = e.target.innerText;
            saveToLocalStorage();
            moveToNextStep();
        });
    });
}

handleButtonStepGroup('step2', 'homeType');
handleButtonStepGroup('step3', 'relationType');
handleButtonStepGroup('step4', 'monthlyCost');
handleButtonStepGroup('step5', 'heatingMethod');
handleButtonStepGroup('step6', 'jobType');

function moveToNextStep() {
    currentStep++;
    if (currentStep < steps.length) {
        if (currentStep === 6) {
            showStep(currentStep);
            setTimeout(() => {
                moveToNextStep();
            }, 5000);
        } else {
            showStep(currentStep);
        }
    }
    // Save currentStep in localStorage
    localStorage.setItem("currentStep", currentStep.toString());
}


// Function to send OTP
window.phoneAuth = function phoneAuth() {
    const phoneNumber = document.getElementById("number").value;
    const convertCountryCodePhoneNumber = "+88"+phoneNumber;

    // Setup invisible reCAPTCHA
    const appVerifier = new RecaptchaVerifier('recaptcha-container', {
        size: 'invisible',
        callback: (response) => {
            alert("reCAPTCHA solved, proceeding with authentication...");
        },
        'expired-callback': () => {
            alert("reCAPTCHA expired, please refresh the page and try again.");
        }
    }, auth);

  
    signInWithPhoneNumber(auth, convertCountryCodePhoneNumber, appVerifier)
        .then((result) => {
            confirmationResult = result;
            alert("OTP sent successfully!");
            document.getElementById("otp-section").style.display = "block"; // Show the verification input
        })
        .catch((error) => {
            console.error("Error sending OTP:", error);
            alert("Error sending OTP: " + error.message);
        });
}

// Function to verify OTP
window.codeverify = function codeverify() {
    const code = document.getElementById("verificationCode").value;

    // Validate OTP code
    if (!code) {
        alert("Please enter the OTP code");
        return;
    }

    confirmationResult.confirm(code).then((result) => {
        alert("Phone number verified successfully!");
        document.getElementById("submitBtn").disabled = false; // Enable the submit button
    }).catch((error) => {
        console.error("Error verifying OTP:", error);
        alert("Error verifying OTP: " + error.message);
    });
}


// Function to handle final form submission
document.getElementById("contactForm").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent form submission to handle data in JS

    // Get all input values
    const gender = document.getElementById("gender").value;
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const city = document.getElementById("city").value;
    const streetAddress = document.getElementById("streetAddress").value;
    const birthYear = document.getElementById("birthYear").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("number").value;

    // Validate required fields
    if (!firstName || !lastName || !city || !streetAddress || !birthYear || !email || !phone) {
        alert("Please fill out all the required fields.");
        return;
    }

    // Create an object to store form data
    const formData = {
        gender,
        firstName,
        lastName,
        city,
        streetAddress,
        birthYear,
        email,
        phone
    };

    // Save final form data to local storage
    formItems = { ...formItems, ...formData };
    saveToLocalStorage();

    const postData = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formItems)
    };

    // default show thank you page 

      if(formItems){
        setTimeout(() => {
            moveToNextStep()
        }, 1000);
      }

    // Optionally, you can submit the form to a backend here
    // Send data to backend
     // Optionally, you can submit the form to a backend here
    // Send data to backend
    fetch('https://app.leadborn.com/api/add-home-lead', postData)
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        alert("Form submitted successfully!");
        // when submitted data  then show thank you page 
        // if(formItems){
        //     setTimeout(() => {
        //         moveToNextStep()
        //     }, 1000);
        //   }
        // Reset form or redirect to a success page
        // Example: document.getElementById("contactForm").reset();
    })
    .catch((error) => {
        console.error('Error:', error);
        alert("Error submitting form: " + error.message);
    });
   

});


// thank you button 
document.getElementById("back-btn").addEventListener("click",function (event) {
    event.preventDefault(); 
    localStorage.setItem("currentStep", "0");
    window.location.reload(); 
})