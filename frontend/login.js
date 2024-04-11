document
  .getElementById("login-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent form submission

    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Authentication failed");
        }
        return response.json();
      })
      .then((data) => {
        if (data.user) {
          console.log("Login successful!");
          console.log("User Role:", data.user.role);
          // Store authenticated user's information in local storage
          localStorage.setItem("loggedInUser", JSON.stringify(data.user));

          // Redirect based on role
          if (data.user.role === "owner") {
            window.location.href = "owner-property-list.html";
          } else if (data.user.role === "coworker") {
            window.location.href = "coworker.html";
          }
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        // Display error message on login form
        document.getElementById("error-message").innerText =
          "Login failed. Please check your username and password.";
      });
  });
