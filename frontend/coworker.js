document.addEventListener("DOMContentLoaded", function (event) {
  event.preventDefault();

  var loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

  if (loggedInUser) {
    var loggedInUserElement = document.getElementById("loggedInUser");
    loggedInUserElement.textContent = "Logged in as: " + loggedInUser.username;
  }

  // EVENT LISTENER FOR SEARCH BUTTON
  document.getElementById("searchBtn").addEventListener("click", function () {
    const address = document.getElementById("address").value.trim();
    const neighborhood = document.getElementById("neighborhood").value;
    const squareFeet = document.getElementById("squarefeet").value;
    const parking = document.getElementById("parking").value;
    const publicTranspo = document.getElementById("public-transpo").value;
    const seatNumber = document.getElementById("seatnumber").value;
    const allowSmoking = document.getElementById("allow-smoking").value;
    const dateAvailable = document.getElementById("dateavailable").value;
    const leaseTerm = document.getElementById("lease-term").value;
    const price = document.getElementById("price").value;

    const searchMessage = document.getElementById("searchMessage");

    // Check if all search criteria are empty
    if (
      !address &&
      !neighborhood &&
      !squareFeet &&
      !parking &&
      !publicTranspo &&
      !seatNumber &&
      !allowSmoking &&
      !dateAvailable &&
      !leaseTerm &&
      !price
    ) {
      searchMessage.textContent =
        "Please fill in at least one search criterion.";
      searchMessage.style.display = "block";
      return;
    }

    const searchCriteria = {
      address,
      neighborhood,
      squareFeet,
      parking,
      "public-transpo": publicTranspo,
      seatNumber,
      "allow-smoking": allowSmoking,
      dateAvailable,
      "lease-term": leaseTerm,
      price,
    };

    // Clear previous search results and messages
    document.getElementById("propertyTableBody").innerHTML = "";
    document.getElementById("workspaceTableBody").innerHTML = "";
    document.getElementById("searchMessage").style.display = "none";
    document.querySelector(".property-header h3 span").textContent = "";

    fetchSearchResults(searchCriteria);
  });

  function fetchSearchResults(criteria) {
    const queryParams = new URLSearchParams();

    for (const key in criteria) {
      if (criteria[key]) {
        queryParams.append(key, criteria[key]);
      }
    }

    fetch(`/search-properties?${queryParams}`)
      .then((response) => response.json())
      .then((properties) => {
        if (properties && properties.length > 0) {
          populatePropertyTable(properties);
        } else {
          // Show no results message or clear table
          document.getElementById("propertyTableBody").innerHTML =
            '<tr><td colspan="7" style="text-align: center;">No property found.</td></tr>';
        }
      })
      .catch((error) => console.error("Failed to fetch properties:", error));
  }

  function populatePropertyTable(properties) {
    const tableBody = document.getElementById("propertyTableBody");
    tableBody.innerHTML = "";

    properties.forEach((property) => {
      let row = `<tr>
          <td>${property.address}</td>
          <td>${property.neighborhood}</td>
          <td>${property.squareFeet}</td>
          <td>${property.parking}</td>
          <td>${property.publicTransportation}</td>
          <td>
              <button class="view-workspace" data-id="${
                property._id
              }" data-address="${
        property.address || ""
      }">View Workspace</button>
          </td>
        </tr>`;
      tableBody.innerHTML += row;
    });

    // Add event listeners to all 'View Workspace' buttons
    document.querySelectorAll(".view-workspace").forEach((button) => {
      button.addEventListener("click", function () {
        const propertyId = this.getAttribute("data-id");
        const address =
          this.getAttribute("data-address") || "No address provided";

        document.querySelector(
          ".property-header h3 span"
        ).textContent = `${address}`;
        document.querySelector(".property-header h3 span").style.color = "red";

        fetchWorkspaceDetails(propertyId);
      });
    });
  }

  function fetchWorkspaceDetails(propertyId) {
    fetch(`/workspaces/${propertyId}`)
      .then((response) => response.json())
      .then((workspaces) => {
        const workspaceBody = document.getElementById("workspaceTableBody");
        workspaceBody.innerHTML = "";

        if (workspaces.length === 0) {
          // No workspaces found, display message
          workspaceBody.innerHTML = `<tr><td colspan="8" style="text-align:center;">No workspace found.</td></tr>`;
        } else {
          workspaces.forEach((workspace) => {
            let workspaceRow = `<tr>
                    <td>${workspace.type}</td>
                    <td>${workspace.seatNumber}</td>
                    <td>${workspace.allowSmoking}</td>
                    <td>${workspace.dateAvailable}</td>
                    <td>${workspace.leaseTerm}</td>
                    <td>${workspace.price}</td>
                    <td>${workspace.contactInformation}</td>
                </tr>`;
            workspaceBody.innerHTML += workspaceRow;
          });
        }
      })
      .catch((error) => {
        console.error("Failed to fetch workspace details:", error);
        // Optionally display an error message if the fetch fails
        document.getElementById(
          "workspaceTableBody"
        ).innerHTML = `<tr><td colspan="8" style="text-align:center;">Error fetching workspace details.</td></tr>`;
      });
  }

  document
    .getElementById("clearFiltersBtn")
    .addEventListener("click", function () {
      // Clear input fields
      document.getElementById("address").value = "";
      document.getElementById("neighborhood").selectedIndex = 0;
      document.getElementById("squarefeet").value = "";
      document.getElementById("parking").selectedIndex = 0;
      document.getElementById("public-transpo").selectedIndex = 0;
      document.getElementById("seatnumber").value = "";
      document.getElementById("allow-smoking").value = "";
      document.getElementById("dateavailable").value = "";
      document.getElementById("lease-term").value = "";
      document.getElementById("price").value = "";

      document.getElementById("propertyTableBody").innerHTML = "";
      document.getElementById("workspaceTableBody").innerHTML = "";
      document.getElementById("searchMessage").style.display = "none";
      document.querySelector(".property-header h3 span").textContent = "";
    });
});
