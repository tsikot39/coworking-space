document.addEventListener("DOMContentLoaded", function () {
  // CLOSE MODAL WHEN CLICKING OUTSIDE THE MODAL
  window.onclick = function (event) {
    var editModal = document.getElementById("editModal");
    var addPropertyModal = document.getElementById("addPropertyModal");
    var editWorkspaceModal = document.getElementById("editWorkspaceModal"); // Get the edit workspace modal

    if (event.target == editModal) {
      editModal.style.display = "none";
    }

    if (event.target == addPropertyModal) {
      addPropertyModal.style.display = "none";
    }

    // Add this new condition for the editWorkspaceModal
    if (event.target == editWorkspaceModal) {
      editWorkspaceModal.style.display = "none";
    }
  };

  document.querySelectorAll(".close").forEach(function (closeBtn) {
    closeBtn.addEventListener("click", function () {
      var modal = this.closest(".modal");
      if (modal) {
        modal.style.display = "none";
      }
    });
  });

  fetchCountsAndDisplay();
  fetchProperties();

  // FUNCTION TO FETCH PROPERTIES DATA FROM THE SERVER
  function fetchProperties() {
    fetch("/properties")
      .then((response) => response.json())
      .then((data) => {
        const sortedData = data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        populateTable(sortedData);
      })
      .catch((error) => {
        console.error("Error fetching properties:", error);
      });
  }

  // REPOPULATE PROPERTIES DATA IN PROPERTY TABLE
  fetchProperties();

  // FUNCTION TO POPULATE PROPERTIES IN THE PROPERTY TABLE
  function populateTable(properties) {
    var tableBody = document.getElementById("propertyTableBody");
    tableBody.innerHTML = ""; // Clear existing table rows

    properties.forEach(function (property) {
      var row = document.createElement("tr");
      row.innerHTML = `
        <td>${property.address}</td>
        <td>${property.neighborhood}</td>
        <td>${property.squareFeet}</td>
        <td>${property.parking}</td>
        <td>${property.publicTransportation}</td>
        <td>
          <button class="edit" data-id="${property._id}">Edit</button>
          <button class="delete" data-id="${property._id}">Delete</button>
          <button class="view" data-id="${property._id}">Add Workspace</button>
          <button class="view-workspace" data-id="${property._id}">View Workspace</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }

  // MODAL FUNCTIONALITY
  var modal = document.getElementById("editModal");

  // MODIFY YOUR EVENT LISTENER FOR EDIT BUTTON CLICK TO FETCH THE _ID FROM THE DATA ATTRIBUTE
  document
    .getElementById("propertyTableBody")
    .addEventListener("click", function (event) {
      var target = event.target;
      if (target.classList.contains("edit")) {
        var propertyId = target.getAttribute("data-id");
        openEditModal(propertyId);
      }
    });

  // SUBMIT FUNCTIONALITY FOR EDIT FORM
  var editForm = document.getElementById("editForm");
  editForm.addEventListener("submit", function (event) {
    event.preventDefault();

    var propertyId = document.getElementById("editPropertyId").value; // Changed from getAttribute to value

    // Prepare the updated property data
    var updatedPropertyData = {
      address: editForm.editAddress.value,
      neighborhood: editForm.editNeighborhood.value,
      squareFeet: editForm.editSquareFeet.value,
      parking: editForm.editParking.value,
      publicTransportation: editForm.editPublicTransportation.value,
    };

    // Send PUT request to update property data
    fetch(`/properties/${propertyId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedPropertyData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Property updated:", data);
        fetchProperties(); // Re-fetch the properties to update the table
        modal.style.display = "none";
      })
      .catch((error) => {
        console.error("Error updating property:", error);
      });
  });

  // FUNCTIONALITY FOR ADDING NEW PROPERTY
  var addPropertyForm = document.getElementById("addPropertyForm");

  addPropertyForm.addEventListener("submit", function (event) {
    event.preventDefault();

    var formData = {
      address: addPropertyForm.addAddress.value,
      neighborhood: addPropertyForm.addNeighborhood.value,
      squareFeet: addPropertyForm.addSquareFeet.value,
      parking: addPropertyForm.addParking.value,
      publicTransportation: addPropertyForm.addPublicTransportation.value,
    };

    fetch("/add-property", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Property added:", data);
        fetchProperties(); // Re-fetch the properties to update the table
        closeModal("addPropertyModal"); // Close the modal
        clearWorkspaceTable(); // Clear the workspace table
        clearWorkspaceHeader(); // Clear the workspace header
        fetchCountsAndDisplay(); // Update counts
      })
      .catch((error) => {
        console.error("Error adding property:", error);
      });
  });

  // FUNCTION TO OPEN THE EDIT MODAL AND POPULATE FORM FIELDS
  function openEditModal(propertyId) {
    fetch(`/properties/${propertyId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((property) => {
        document.getElementById("editPropertyId").value = property._id;
        document.getElementById("editAddress").value = property.address;
        document.getElementById("editNeighborhood").value =
          property.neighborhood;
        document.getElementById("editSquareFeet").value = property.squareFeet;
        document.getElementById("editParking").value = property.parking;
        document.getElementById("editPublicTransportation").value =
          property.publicTransportation;

        // DISPLAY THE MODAL
        document.getElementById("editModal").style.display = "block";
      })
      .catch((error) => {
        console.error("Error fetching property details:", error);
      });
  }

  // EVENT LISTENER FOR DELETE BUTTON
  document
    .getElementById("propertyTableBody")
    .addEventListener("click", function (event) {
      var target = event.target;
      if (target.classList.contains("delete")) {
        var propertyId = target.getAttribute("data-id"); // Keep the propertyId as a string
        openDeleteConfirmationModal(propertyId);
      }
    });

  // EVENT LISTENER FOR THE CONFIRM DELETE BUTTON IN THE DELETE CONFIRMATION MODAL OF PROPERTY
  document
    .getElementById("confirmDeleteBtn")
    .addEventListener("click", function () {
      var propertyId = this.getAttribute("data-id"); // Ensure this is set correctly when opening the modal

      // Send DELETE request to the server to delete the property
      fetch(`/properties/${propertyId}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          console.log("Property deleted:", data);
          // After successful deletion, close the modal and fetch properties again
          closeModal("deleteConfirmationModal"); // Close the delete confirmation modal
          fetchProperties(); // Fetch properties to repopulate the property table
          updateCounts();
          clearWorkspaceTable();
          clearWorkspaceHeader();
        })
        .catch((error) => {
          console.error("Error deleting property:", error);
        });
    });

  function clearWorkspaceTable() {
    var tableBody = document.getElementById("workspaceTableBody");
    tableBody.innerHTML = ""; // This clears the workspace table. You might adjust this to repopulate if needed.
  }

  function closeModal(modalId) {
    var modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = "none";
    }
  }

  // FUNCTION TO OPEN THE DELETE CONFIRMATION MODAL
  function openDeleteConfirmationModal(propertyId) {
    var modal = document.getElementById("deleteConfirmationModal");
    var confirmBtn = document.getElementById("confirmDeleteBtn");
    confirmBtn.setAttribute("data-id", propertyId);
    modal.style.display = "block";

    // Set propertyId as a data attribute of confirm delete button
    document
      .getElementById("confirmDeleteBtn")
      .setAttribute("data-id", propertyId.toString());
  }

  document
    .getElementById("cancelDeleteBtn")
    .addEventListener("click", function () {
      closeModal("deleteConfirmationModal"); // Simply close the modal
    });

  // Retrieve logged-in user's information from local storage
  var loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

  // Display the logged-in user's name
  if (loggedInUser) {
    var loggedInUserElement = document.getElementById("loggedInUser");
    loggedInUserElement.textContent = "Logged in as: " + loggedInUser.username;
  }

  // Add event listener for "Add Property" button
  document
    .getElementById("addPropertyBtn")
    .addEventListener("click", function () {
      // Display the add property modal
      var addPropertyForm = document.getElementById("addPropertyForm");
      addPropertyForm.reset();
      document.getElementById("addPropertyModal").style.display = "block";
    });

  // Event listener for "Add WS" button
  document
    .getElementById("propertyTableBody")
    .addEventListener("click", function (event) {
      const target = event.target;
      if (event.target.classList.contains("view")) {
        const propertyId = event.target.getAttribute("data-id");
        openAddWorkspaceModal(propertyId);
      }
    });

  // Function to open the Add Workspace modal
  function openAddWorkspaceModal(propertyId) {
    var modal = document.getElementById("addWorkspaceModal");
    document.getElementById("propertyId").value = propertyId;
    addWorkspaceForm.reset();
    modal.style.display = "block";
    populateWorkspaceTable(propertyId);
  }

  // Close modal when clicking outside the modal
  window.addEventListener("click", function (event) {
    var addWorkspaceModal = document.getElementById("addWorkspaceModal");
    if (event.target === addWorkspaceModal) {
      addWorkspaceModal.style.display = "none";
    }
  });

  // Close modal when the close button is clicked
  var addWorkspaceModal = document.getElementById("addWorkspaceModal");
  var addWorkspaceCloseBtn = addWorkspaceModal.querySelector(".close");
  addWorkspaceCloseBtn.onclick = function () {
    addWorkspaceModal.style.display = "none";
  };

  // Event listener for property table
  document
    .getElementById("propertyTableBody")
    .addEventListener("click", function (event) {
      var target = event.target;
      if (target.classList.contains("view-workspace")) {
        var propertyId = target.getAttribute("data-id");
        // Fetch property details to get the address
        fetch(`/properties/${propertyId}`)
          .then((response) => response.json())
          .then((property) => {
            // Now call updateWorkspaceHeader with the fetched address
            updateWorkspaceHeader(property.address);
            populateWorkspaceTable(propertyId); // Existing functionality
          })
          .catch((error) =>
            console.error("Error fetching property details:", error)
          );
      } else if (target.classList.contains("view")) {
        var propertyId = target.getAttribute("data-id"); // Get the property ID from the button's data-id attribute
        openAddWorkspaceModal(propertyId); // Call the function to open the Add Workspace modal
      } else if (target.classList.contains("edit")) {
        var propertyId = target.getAttribute("data-id");
        openEditModal(propertyId);
      } else if (target.classList.contains("delete")) {
        var propertyId = target.getAttribute("data-id");
        openDeleteConfirmationModal(propertyId);
      }
    });

  // Assuming your add workspace form has an id of "addWorkspaceForm"
  var addWorkspaceForm = document.getElementById("addWorkspaceForm");
  addWorkspaceForm.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form submission

    // Extract workspace data from form fields
    var workspaceData = {
      propertyId: document.getElementById("propertyId").value, // Hidden field for property ID
      type: document.getElementById("addtype").value,
      seatNumber: document.getElementById("addseat").value,
      allowSmoking: document.getElementById("addsmoking").value,
      dateAvailable: document.getElementById("adddateavailable").value,
      leaseTerm: document.getElementById("addleaseterm").value,
      price: document.getElementById("addprice").value,
      contactInformation: document.getElementById("addcontact").value,
      createdAt: new Date(),
    };

    // Send POST request to server with workspaceData
    fetch("/add-workspace", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(workspaceData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Workspace added:", data);
        closeModal("addWorkspaceModal");
        populateWorkspaceTable(workspaceData.propertyId); // Repopulate workspace table for the property
        fetchCountsAndDisplay(); // Update counts
      })
      .catch((error) => {
        console.error("Error adding workspace:", error);
      });
  });

  // EVENT LISTENER FOR "VIEW WORKSPACE" BUTTON
  document
    .getElementById("propertyTableBody")
    .addEventListener("click", function (event) {
      var target = event.target;
      if (target.classList.contains("view-workspace")) {
        var propertyId = target.getAttribute("data-id");
        updateWorkspaceHeader(property.address);
        populateWorkspaceTable(propertyId);
      }
    });

  // FUNCTION TO FETCH  WORKSPACES BY PROPERTY ID AND POPULATE THE WORKSPACE TABLE
  function populateWorkspaceTable(propertyId) {
    return fetch(`/workspaces/${propertyId}`)
      .then((response) => response.json())
      .then((workspaces) => {
        var tableBody = document.getElementById("workspaceTableBody");
        tableBody.innerHTML = "";

        // Check if workspaces array is empty
        if (workspaces.length === 0) {
          // Display "No workspace found."
          var noWorkspaceRow = document.createElement("tr");
          noWorkspaceRow.innerHTML = `<td colspan="8" style="text-align: center;">No workspace found.</td>`; // Adjust the colspan to match your number of columns
          tableBody.appendChild(noWorkspaceRow);
        } else {
          workspaces.forEach(function (workspace) {
            var row = document.createElement("tr");
            row.innerHTML = `
          <td>${workspace.type}</td>
          <td>${workspace.seatNumber}</td>
          <td>${workspace.allowSmoking}</td>
          <td>${workspace.dateAvailable}</td>
          <td>${workspace.leaseTerm}</td>
          <td>${workspace.price}</td>
          <td>${workspace.contactInformation}</td>
          <td>
            <button class="edit-workspace" data-id="${workspace.propertyId}" data-workspace-id="${workspace._id}">Edit</button>
            <button class="delete-workspace" data-id="${workspace.propertyId}" data-workspace-id="${workspace._id}">Delete</button>
          </td>
        `;
            tableBody.appendChild(row);
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching workspaces:", error);
      });
  }

  function clearWorkspaceTable() {
    var tableBody = document.getElementById("workspaceTableBody");
    tableBody.innerHTML = ""; // This effectively clears the table
  }

  function updateWorkspaceHeader(address) {
    var headerSpan = document.querySelector("#workspaceListHeader span");
    headerSpan.textContent = `${address}`;
    headerSpan.style.color = "red"; // Apply red color to the text
  }

  function clearWorkspaceHeader() {
    const headerSpan = document.querySelector("#workspaceListHeader span");
    if (headerSpan) {
      headerSpan.textContent = ""; // Resets the text content
    }
  }

  function fetchCountsAndDisplay() {
    // Fetch count of properties
    fetch("/properties/count")
      .then((response) => response.json())
      .then((data) => {
        // Update HTML element with properties count
        document.getElementById("propertyCount").textContent =
          data.count || "0";
      })
      .catch((error) => {
        console.error("Error fetching property count:", error);
        document.getElementById("propertyCount").textContent = "Error";
      });

    // Fetch count of workspaces
    fetch("/workspaces/count")
      .then((response) => response.json())
      .then((data) => {
        // Update HTML element with workspaces count
        document.getElementById("workspaceCount").textContent =
          data.count || "0";
      })
      .catch((error) => {
        console.error("Error fetching workspace count:", error);
        document.getElementById("workspaceCount").textContent = "Error";
      });
  }

  // EVENT LISTENER FOR WORKSPACE BUTTONS
  document
    .getElementById("workspaceTableBody")
    .addEventListener("click", function (event) {
      var target = event.target;

      // Check if the edit workspace button was clicked
      if (target.classList.contains("edit-workspace")) {
        var workspaceId = target.getAttribute("data-workspace-id");

        openEditWorkspaceModal(workspaceId);

        // Fetch workspace details and open edit modal
        fetch(`/workspaces/details/${workspaceId}`)
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.json();
          })
          .then((workspace) => {
            // Assuming you have fields like type, seatNumber, etc. in your workspace details
            document.getElementById("editWorkspaceId").value = workspace._id;
            document.getElementById("editPropertyId").value =
              workspace.propertyId;
            document.getElementById("editType").value = workspace.type;
            document.getElementById("editSeatNumber").value =
              workspace.seatNumber;
            document.getElementById("editAllowSmoking").value =
              workspace.allowSmoking ? "Yes" : "No";
            document.getElementById("editDateAvailable").value =
              workspace.dateAvailable; // Ensure date format matches
            document.getElementById("editLeaseTerm").value =
              workspace.leaseTerm;
            document.getElementById("editPrice").value = workspace.price;
            document.getElementById("editContactInformation").value =
              workspace.contactInformation;

            // Show the modal
            document.getElementById("editWorkspaceModal").style.display =
              "block";
          })
          .catch((error) =>
            console.error("Error fetching workspace details:", error)
          );
      }
    });

  function openEditWorkspaceModal(workspaceId) {
    fetch(`/workspaces/details/${workspaceId}`) // Ensure you have an API endpoint for this or adjust accordingly
      .then((response) => response.json())
      .then((workspace) => {
        document.getElementById("editWorkspaceId").value = workspace._id;
        document.getElementById("editPropertyId").value = workspace.propertyId;
        document.getElementById("editType").value = workspace.type;
        document.getElementById("editSeatNumber").value = workspace.seatNumber;
        document.getElementById("editAllowSmoking").value =
          workspace.allowSmoking;
        document.getElementById("editDateAvailable").value =
          workspace.dateAvailable;
        document.getElementById("editLeaseTerm").value = workspace.leaseTerm;
        document.getElementById("editPrice").value = workspace.price;
        document.getElementById("editContactInformation").value =
          workspace.contactInformation;

        // Display the modal
        document.getElementById("editWorkspaceModal").style.display = "block";
      })
      .catch((error) =>
        console.error("Error fetching workspace details:", error)
      );
  }

  // Submit Event Listener for the "Edit Workspace" Form
  document
    .getElementById("editWorkspaceForm")
    .addEventListener("submit", function (event) {
      event.preventDefault(); // Prevent the form from submitting in the traditional way

      const workspaceId = document.getElementById("editWorkspaceId").value; // Get the workspace ID
      const propertyId = document.getElementById("editPropertyId").value; // Get the property ID to fetch workspaces related to this property

      // Prepare the updated workspace data
      const updatedWorkspaceData = {
        type: document.getElementById("editType").value,
        seatNumber: document.getElementById("editSeatNumber").value,
        allowSmoking: document.getElementById("editAllowSmoking").value,
        dateAvailable: document.getElementById("editDateAvailable").value,
        leaseTerm: document.getElementById("editLeaseTerm").value,
        price: document.getElementById("editPrice").value,
        contactInformation: document.getElementById("editContactInformation")
          .value,
      };

      // Send PUT request to update workspace data
      fetch(`/workspaces/update/${workspaceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedWorkspaceData),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Workspace updated:", data);
          closeModal("editWorkspaceModal"); // Close the modal upon successful update
          populateWorkspaceTable(propertyId); // Optionally, re-fetch workspaces to update the UI
        })
        .catch((error) => {
          console.error("Error updating workspace:", error);
        });
    });

  // EVENT LISTENER FOR DELETE WORKSPACE BUTTON
  document
    .getElementById("workspaceTableBody")
    .addEventListener("click", function (event) {
      var target = event.target;
      if (target.classList.contains("delete-workspace")) {
        var workspaceId = target.getAttribute("data-workspace-id"); // Get the workspace ID from the button
        var propertyId = target.getAttribute("data-id");
        openDeleteWorkspaceConfirmationModal(workspaceId, propertyId);
      }
    });

  // FUNCTION TO OPEN DELETE WORKSPACE CONFIRMATION MODAL
  function openDeleteWorkspaceConfirmationModal(workspaceId, propertyId) {
    var modal = document.getElementById("deleteWorkspaceConfirmationModal");
    var confirmBtn = document.getElementById("confirmWorkspaceDeleteBtn");
    confirmBtn.setAttribute("data-workspace-id", workspaceId);
    confirmBtn.setAttribute("data-property-id", propertyId); // Store property ID for later
    modal.style.display = "block";
  }

  // EVENT LISTEENER FOR WORKSPACE DELETION CONFIRMATION
  document
    .getElementById("confirmWorkspaceDeleteBtn")
    .addEventListener("click", function () {
      var workspaceId = this.getAttribute("data-workspace-id"); // Retrieve the workspace ID stored earlier
      var propertyId = this.getAttribute("data-property-id");

      // Assuming your endpoint to delete a workspace is something like "/delete-workspace/:id"
      fetch(`/delete-workspace/${workspaceId}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then(() => {
          console.log("Workspace deleted successfully");
          closeModal("deleteWorkspaceConfirmationModal"); // Close the confirmation modal
          populateWorkspaceTable(propertyId); // Refresh the table to remove the deleted workspace
        })
        .catch((error) => {
          console.error("Error deleting workspace:", error);
        });
    });

  function closeModal(modalId) {
    var modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = "none";
    }
  }

  //EVENT LISTENER FOR CANCEL DELETION OF WORKSAPCE
  document
    .getElementById("cancelWorkspaceDeleteBtn")
    .addEventListener("click", function () {
      closeModal("deleteWorkspaceConfirmationModal");
    });

  // SENDING THE DELETE REQUEST OF WORKSPACE TO THE SERVER
  document
    .getElementById("confirmWorkspaceDeleteBtn")
    .addEventListener("click", function () {
      var workspaceId = this.getAttribute("data-workspace-id"); // Retrieve the workspace ID stored earlier
      var propertyId = this.getAttribute("data-property-id"); // Retrieve the property ID, assuming you have set it when opening the modal

      fetch(`/api/workspaces/${workspaceId}`, {
        // Adjust the URL path as per your API structure
        method: "DELETE",
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then(() => {
          closeModal("deleteWorkspaceConfirmationModal"); // Close the confirmation modal
          populateWorkspaceTable(propertyId);
          updateCounts();
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    });

  function updateCounts() {
    // Fetch the updated count for properties
    fetch("/properties/count")
      .then((response) => response.json())
      .then((data) => {
        if (data.count !== undefined) {
          document.getElementById("propertyCount").textContent = data.count;
        } else {
          throw new Error("Count not found in response");
        }
      })
      .catch((error) => {
        console.error("Error updating property count:", error);
        document.getElementById("propertyCount").textContent = "Error";
      });

    // Fetch the updated count for workspaces, in case properties deletion affects workspaces
    fetch("/workspaces/count")
      .then((response) => response.json())
      .then((data) => {
        if (data.count !== undefined) {
          document.getElementById("workspaceCount").textContent = data.count;
        } else {
          throw new Error("Count not found in response");
        }
      })
      .catch((error) => {
        console.error("Error updating workspace count:", error);
        document.getElementById("workspaceCount").textContent = "Error";
      });
  }
});
