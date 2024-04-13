document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("registration-form");
  const successMessageElement = document.getElementById("success-message");
  const errorMessageElement = document.getElementById("error-message");

  // Function to check password strength
  function isPasswordStrong(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
      password
    );

    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumber &&
      hasSpecialChar
    );
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    // Clear previous message
    successMessageElement.textContent = "";
    successMessageElement.style.display = "none";
    errorMessageElement.style.display = "none";
    errorMessageElement.textContent = "";

    // Collect form data
    const formData = {
      fullname: form.querySelector("#fullname").value,
      phone: form.querySelector("#phone").value,
      email: form.querySelector("#email").value,
      role: form.querySelector("#role").value,
      username: form.querySelector("#username").value,
      password: form.querySelector("#password").value,
    };

    // Check if the password is strong enough
    if (!isPasswordStrong(formData.password)) {
      errorMessageElement.textContent =
        "Password must be at least 8 characters long and include uppercase and lowercase letters, a number, and a special character.";
      errorMessageElement.style.display = "block";
      return;
    }

    fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((data) => {
        console.log("Registration successful:", data);

        // Start countdown from 5 seconds
        let countdown = 5;
        successMessageElement.textContent = `Registration successful! Redirecting in ${countdown} seconds...`;
        successMessageElement.style.display = "block";

        // Update the countdown every second
        const intervalId = setInterval(() => {
          countdown--;
          if (countdown <= 0) {
            clearInterval(intervalId);
            window.location.href = "login.html"; // Redirect
          } else {
            successMessageElement.textContent = `Registration successful! Redirecting in ${countdown} seconds...`;
          }
        }, 1000);
      })
      .catch((error) => {
        console.error("Registration failed:", error);
        successMessageElement.textContent =
          "Registration failed. Please try again.";
        successMessageElement.style.color = "red";
        successMessageElement.style.display = "block";
      });

    form.reset();
  });
});
