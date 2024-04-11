document.addEventListener("DOMContentLoaded", function () {
  // Sample data for property
  var sampleData = [
    {
      propertyId: 1,
      address: "123 Main St. SE, Calgary, Canada",
      neighborhood: "Downtown",
      squareFeet: 2000,
      parking: "Yes",
      publicTransportation: "Yes",
    },
    {
      propertyId: 2,
      address: "456 Elm St, Banff, Alberta, Canada",
      neighborhood: "Suburban",
      squareFeet: 1800,
      parking: "Yes",
      publicTransportation: "No",
    },
    {
      propertyId: 3,
      address: "53 Pongco St. Brgy. Mariblo, Quezon City, Philippines",
      neighborhood: "Residential",
      squareFeet: 500,
      parking: "No",
      publicTransportation: "Yes",
    },
    {
      propertyId: 4,
      address: "155 De Vera St. SFDM, Quezon City, Philippines",
      neighborhood: "Downtown",
      squareFeet: 600,
      parking: "Yes",
      publicTransportation: "Yes",
    },
    {
      propertyId: 5,
      address: "Calle 32a Sur Transversal, Colombia",
      neighborhood: "Residential",
      squareFeet: 800,
      parking: "Yes",
      publicTransportation: "No",
    },
  ];

  // Function to close modal
  function closeModal(modalId) {
    var modal = document.getElementById(modalId);
    modal.style.display = "none";
  }

  // Function to populate the table with data
  function populateTable(data) {
    // Sort sampleData by propertyId in descending order
    data.sort((a, b) => b.propertyId - a.propertyId);

    var tableBody = document.getElementById("propertyTableBody");
    tableBody.innerHTML = ""; // Clear existing table rows

    data.forEach(function (item) {
      var row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.propertyId}</td>
        <td>${item.address}</td>
        <td>${item.neighborhood}</td>
        <td>${item.squareFeet}</td>
        <td>${item.parking}</td>
        <td>${item.publicTransportation}</td>
        <td>
          <button class="edit" data-id="${item.propertyId}">Edit</button>
          <button class="delete" data-id="${item.propertyId}">Delete</button>
          <button class="view" data-id="${item.propertyId}">Add Workspace</button>
          <button class="view-workspace" data-id="${item.propertyId}">View Workspace</button>
        </td>
      `;
      tableBody.appendChild(row);

      // Event listener for view button
      row.querySelector(".view").addEventListener("click", function () {
        redirectToWorkspace(item.propertyId);
      });
    });
  }

  // Populate the table with the sample data
  populateTable(sampleData);

  // Modal functionality
  var modal = document.getElementById("editModal");

  // Event listener for edit button
  document
    .getElementById("propertyTableBody")
    .addEventListener("click", function (event) {
      var target = event.target;
      if (target.classList.contains("edit")) {
        var propertyId = target.getAttribute("data-id");
        openEditModal(propertyId);
      }
    });

  // Submit functionality for edit form
  var editForm = document.getElementById("editForm");
  editForm.addEventListener("submit", function (event) {
    event.preventDefault();
    var propertyId = editForm.getAttribute("data-property-id");
    var property = sampleData.find((item) => item.propertyId == propertyId);
    if (property) {
      // Update existing property data
      property.address = editForm.editAddress.value;
      property.neighborhood = editForm.editNeighborhood.value;
      property.squareFeet = editForm.editSquareFeet.value;
      property.parking = editForm.editParking.value;
      property.publicTransportation = editForm.editPublicTransportation.value;

      // Update the table with the edited data
      populateTable(sampleData);
      console.log("Property edited and updated:", property);
      modal.style.display = "none";
    } else {
      console.error(
        "Property with ID",
        propertyId,
        "not found in sample data."
      );
    }
  });

  // Close modal when the close button is clicked
  var closeBtn = document.getElementsByClassName("close")[0];
  closeBtn.onclick = function () {
    modal.style.display = "none";
  };

  // Close modal when clicking outside the modal
  window.onclick = function (event) {
    var editModal = document.getElementById("editModal");
    var addPropertyModal = document.getElementById("addPropertyModal");

    if (event.target == editModal) {
      editModal.style.display = "none";
    }

    if (event.target == addPropertyModal) {
      addPropertyModal.style.display = "none";
    }
  };

  // Add functionality for adding new property
  var addPropertyForm = document.getElementById("addPropertyForm");
  addPropertyForm.addEventListener("submit", function (event) {
    event.preventDefault();
    // Create new property object
    var newProperty = {
      propertyId: sampleData.length + 1, // Generate new ID
      address: addPropertyForm.addAddress.value,
      neighborhood: addPropertyForm.addNeighborhood.value,
      squareFeet: addPropertyForm.addSquareFeet.value,
      parking: addPropertyForm.addParking.value,
      publicTransportation: addPropertyForm.addPublicTransportation.value,
    };
    // Add new property to sampleData array
    sampleData.push(newProperty);
    // Repopulate the table with updated data
    populateTable(sampleData);
    // Log the newly added property
    console.log("New Property added:", newProperty);
    // Clear the form fields
    addPropertyForm.reset();

    // Close the modal
    closeModal("addPropertyModal");
  });

  // Function to open the edit modal and populate form fields
  function openEditModal(propertyId) {
    // Retrieve property data based on propertyId and populate form fields
    var property = sampleData.find((item) => item.propertyId == propertyId);
    if (property) {
      document.getElementById("editPropertyId").value = property.propertyId;
      document.getElementById("editAddress").value = property.address;
      document.getElementById("editNeighborhood").value = property.neighborhood;
      document.getElementById("editSquareFeet").value = property.squareFeet;
      document.getElementById("editParking").value = property.parking;
      document.getElementById("editPublicTransportation").value =
        property.publicTransportation;

      // Set the property id as a data attribute on the form
      document
        .getElementById("editForm")
        .setAttribute("data-property-id", propertyId);

      // Display modal
      modal.style.display = "block";
    } else {
      console.error(
        "Property with ID",
        propertyId,
        "not found in sample data."
      );
    }
  }

  // Event listener for delete button
  document
    .getElementById("propertyTableBody")
    .addEventListener("click", function (event) {
      var target = event.target;
      if (target.classList.contains("delete")) {
        var propertyId = parseInt(target.getAttribute("data-id")); // Parse the propertyId to integer
        openDeleteConfirmationModal(propertyId);
      }
    });

  // Event listener for delete confirmation modal buttons
  document
    .getElementById("confirmDeleteBtn")
    .addEventListener("click", function () {
      var propertyId = parseInt(this.getAttribute("data-property-id"));
      deleteProperty(propertyId);
      closeModal("deleteConfirmationModal");
    });

  document
    .getElementById("cancelDeleteBtn")
    .addEventListener("click", function () {
      closeModal("deleteConfirmationModal");
    });

  // Function to open the delete confirmation modal
  function openDeleteConfirmationModal(propertyId) {
    var modal = document.getElementById("deleteConfirmationModal");
    modal.style.display = "block";

    // Set propertyId as a data attribute of confirm delete button
    document
      .getElementById("confirmDeleteBtn")
      .setAttribute("data-property-id", propertyId);
  }

  // Function to delete property from sampleData array
  function deleteProperty(propertyId) {
    var index = sampleData.findIndex((item) => item.propertyId === propertyId);
    if (index !== -1) {
      sampleData.splice(index, 1); // Remove the item from the array
      populateTable(sampleData); // Repopulate the table
      console.log("Property deleted with ID:", propertyId);
    } else {
      console.error(
        "Property with ID",
        propertyId,
        "not found in sample data."
      );
    }
  }

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
      document.getElementById("addPropertyModal").style.display = "block";
    });

  // Close modal when the close button is clicked
  var addPropertyCloseBtn = document.querySelector("#addPropertyModal .close");
  addPropertyCloseBtn.onclick = function () {
    closeModal("addPropertyModal");
  };

  // Function to populate the workspace table with data for a specific property ID
  function populateWorkspaceTable(propertyId) {
    var workspaceTableBody = document.getElementById("workspaceTableBody");
    var existingRows = workspaceTableBody.querySelectorAll("tr");

    // Remove existing rows from the workspace table
    existingRows.forEach(function (row) {
      row.remove();
    });

    // Filter workspaceData by propertyId
    var workspaceDataForProperty = workspaceData.filter(function (workspace) {
      return workspace.propertyId === propertyId;
    });

    // Sort workspaceDataForProperty by workspaceId in descending order
    workspaceDataForProperty.sort((a, b) => b.workspaceId - a.workspaceId);

    if (workspaceDataForProperty.length === 0) {
      document.getElementById("noDataMessage").style.display = "block";
    } else {
      document.getElementById("noDataMessage").style.display = "none";
      // Populate the workspace table with data for the selected property ID
      workspaceDataForProperty.forEach(function (workspace) {
        var row = document.createElement("tr");
        row.innerHTML = `
        <td>${workspace.propertyId}</td>
        <td>${workspace.workspaceId}</td>
        <td>${workspace.type}</td>
        <td>${workspace.seatNumber}</td>
        <td>${workspace.allowSmoking}</td>
        <td>${workspace.dateAvailable}</td>
        <td>${workspace.leaseTerm}</td>
        <td>${workspace.price}</td>
        <td>${workspace.contactInformation}</td>
        <td>
          <button class="edit-workspace" data-property-id="${workspace.propertyId}" data-workspace-id="${workspace.workspaceId}">Edit</button>
          <button class="delete-workspace" data-property-id="${workspace.propertyId}" data-workspace-id="${workspace.workspaceId}">Delete</button>
        </td>
      `;
        workspaceTableBody.appendChild(row);
      });
    }
  }

  // Sample data for workspace (remove this in your actual implementation)
  var workspaceData = [];

  // Call the function to populate the workspace table for each property
  sampleData.forEach(function (property) {
    populateWorkspaceTable(property.propertyId);
  });

  // Event listener for edit workspace button
  document
    .getElementById("workspaceTableBody")
    .addEventListener("click", function (event) {
      var target = event.target;
      // Check if the clicked element is an "Edit Workspace" button
      if (target.classList.contains("edit-workspace")) {
        var propertyId = parseInt(target.getAttribute("data-property-id"));
        var workspaceId = parseInt(target.getAttribute("data-workspace-id"));
        // Call the function to open the Edit Workspace modal
        openEditWorkspaceModal(propertyId, workspaceId);
      }
    });

  // Event listener for delete workspace button
  document
    .getElementById("workspaceTableBody")
    .addEventListener("click", function (event) {
      var target = event.target;
      if (target.classList.contains("delete-workspace")) {
        var propertyId = parseInt(target.getAttribute("data-property-id"));
        var workspaceId = parseInt(target.getAttribute("data-workspace-id"));
        deleteWorkspace(propertyId, workspaceId);
      }
    });

  // Event listener for "Add WS" button
  document
    .getElementById("propertyTableBody")
    .addEventListener("click", function (event) {
      var target = event.target;
      if (target.classList.contains("view")) {
        var propertyId = parseInt(target.getAttribute("data-id"));
        openAddWorkspaceModal(propertyId);
      }
    });

  // Function to open the Add Workspace modal
  function openAddWorkspaceModal(propertyId) {
    // Clear previous values if any
    document.getElementById("addWorkspaceForm").reset();
    // Set the property ID as a data attribute in the form
    document
      .getElementById("addWorkspaceForm")
      .setAttribute("data-property-id", propertyId);
    // Display the modal
    document.getElementById("addWorkspaceModal").style.display = "block";
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

  // Event listener for submitting the add workspace form
  var addWorkspaceForm = document.getElementById("addWorkspaceForm");
  addWorkspaceForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Extract workspace data from form fields
    var propertyId = parseInt(
      addWorkspaceForm.getAttribute("data-property-id")
    );
    var workspaceId = workspaceData.length + 1; // Generate new workspace ID
    var type = addWorkspaceForm.addtype.value;
    var seatNumber = parseInt(addWorkspaceForm.addseat.value);
    var allowSmoking = addWorkspaceForm.addsmoking.value;
    var dateAvailable = addWorkspaceForm.adddateavailable.value;
    var leaseTerm = addWorkspaceForm.addleaseterm.value;
    var price = addWorkspaceForm.addprice.value;
    var contactInformation = addWorkspaceForm.addcontact.value;

    // Create new workspace object
    var newWorkspace = {
      propertyId: propertyId,
      workspaceId: workspaceId,
      type: type,
      seatNumber: seatNumber,
      allowSmoking: allowSmoking,
      dateAvailable: dateAvailable,
      leaseTerm: leaseTerm,
      price: price,
      contactInformation: contactInformation,
    };

    // Add new workspace to workspaceData array
    workspaceData.push(newWorkspace);

    // Repopulate the workspace table for the specific property with updated data
    populateWorkspaceTable(propertyId);

    // Log the newly added workspace
    console.log("New Workspace added:", newWorkspace);

    // Clear the form fields
    addWorkspaceForm.reset();

    // Close the modal
    closeModal("addWorkspaceModal");
  });

  // Event listener for "View Workspace" button
  document
    .getElementById("propertyTableBody")
    .addEventListener("click", function (event) {
      var target = event.target;
      if (target.classList.contains("view-workspace")) {
        var propertyId = parseInt(target.getAttribute("data-id"));
        // Repopulate workspace table with data for the selected property ID
        populateWorkspaceTable(propertyId);
      } else if (target.classList.contains("view")) {
        // Handle the "Add Workspace" button if needed
        // redirectToWorkspace(propertyId);
        var propertyId = parseInt(target.getAttribute("data-id"));
        openAddWorkspaceModal(propertyId);
      } else if (target.classList.contains("edit")) {
        var propertyId = parseInt(target.getAttribute("data-id"));
        openEditModal(propertyId);
      } else if (target.classList.contains("delete")) {
        var propertyId = parseInt(target.getAttribute("data-id"));
        openDeleteConfirmationModal(propertyId);
      }
    });

  // Event listener for property table
  document
    .getElementById("propertyTableBody")
    .addEventListener("click", function (event) {
      var target = event.target;
      if (target.classList.contains("view-workspace")) {
        var propertyId = parseInt(target.getAttribute("data-id"));
        populateWorkspaceTable(propertyId);
      } else if (target.classList.contains("view")) {
        // Handle the "Add Workspace" button if needed
        // redirectToWorkspace(propertyId);
        var propertyId = parseInt(target.getAttribute("data-id"));
        openAddWorkspaceModal(propertyId);
      } else if (target.classList.contains("edit")) {
        var propertyId = parseInt(target.getAttribute("data-id"));
        openEditModal(propertyId);
      } else if (target.classList.contains("delete")) {
        var propertyId = parseInt(target.getAttribute("data-id"));
        openDeleteConfirmationModal(propertyId);
      }
    });

  // Event listener for edit button in the workspace table
  document
    .getElementById("workspaceTableBody")
    .addEventListener("click", function (event) {
      var target = event.target;
      if (target.classList.contains("edit-workspace")) {
        var propertyId = parseInt(target.getAttribute("data-property-id"));
        var workspaceId = parseInt(target.getAttribute("data-workspace-id"));
        openEditWorkspaceModal(propertyId, workspaceId);
      }
    });

  // Function to open the edit workspace modal and populate form fields
  function openEditWorkspaceModal(propertyId, workspaceId) {
    // Retrieve workspace data based on propertyId and workspaceId (if you have such data)
    // This part assumes you have a way to fetch workspace data. Adjust accordingly.
    var workspace = workspaceData.find(function (workspace) {
      return (
        workspace.propertyId === propertyId &&
        workspace.workspaceId === workspaceId
      );
    });

    if (workspace) {
      // Assuming you have input fields with IDs that match these IDs in your modal
      document.getElementById("editpropertyId").value = workspace.propertyId;
      document.getElementById("editWorkspaceId").value = workspace.workspaceId;
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

      // Display the Edit Workspace modal
      var editWorkspaceModal = document.getElementById("editWorkspaceModal");
      editWorkspaceModal.style.display = "block";
    } else {
      console.error(
        "Workspace not found with Property ID: " +
          propertyId +
          " and Workspace ID: " +
          workspaceId
      );
    }
  }

  // Submit functionality for edit workspace form
  var editWorkspaceForm = document.getElementById("editWorkspaceForm");
  editWorkspaceForm.addEventListener("submit", function (event) {
    event.preventDefault();
    var workspaceId = parseInt(editWorkspaceForm.editWorkspaceId.value); // Assuming you have an input with id="editWorkspaceId"

    // Find the workspace in the workspaceData array and update its data
    var workspaceIndex = workspaceData.findIndex(function (workspace) {
      return workspace.workspaceId === workspaceId;
    });

    if (workspaceIndex !== -1) {
      // Update workspace data based on form input
      workspaceData[workspaceIndex].type = editWorkspaceForm.editType.value;
      workspaceData[workspaceIndex].seatNumber = parseInt(
        editWorkspaceForm.editSeatNumber.value
      );
      workspaceData[workspaceIndex].allowSmoking =
        editWorkspaceForm.editAllowSmoking.value;
      workspaceData[workspaceIndex].dateAvailable =
        editWorkspaceForm.editDateAvailable.value;
      workspaceData[workspaceIndex].leaseTerm =
        editWorkspaceForm.editLeaseTerm.value;
      workspaceData[workspaceIndex].price = editWorkspaceForm.editPrice.value;
      workspaceData[workspaceIndex].contactInformation =
        editWorkspaceForm.editContactInformation.value;

      // Log the updated workspace
      console.log("Workspace updated:", workspaceData[workspaceIndex]);

      // Close the edit workspace modal
      closeModal("editWorkspaceModal");

      // Repopulate the workspace table with the updated data
      // Assuming a propertyId is needed to filter workspaces for the table, and is available
      var propertyId = parseInt(editWorkspaceForm.editpropertyId.value); // Adjust based on your form structure
      populateWorkspaceTable(propertyId); // Ensure this function uses the updated workspaceData array to populate the table
    } else {
      console.error("Workspace not found with ID:", workspaceId);
    }
  });

  window.onclick = function (event) {
    // List of all modals
    var modals = [
      "editModal",
      "addPropertyModal",
      "editWorkspaceModal",
      "addWorkspaceModal",
    ];

    // Loop through each modal ID
    modals.forEach(function (modalId) {
      var modal = document.getElementById(modalId);
      if (event.target == modal) {
        closeModal(modalId);
      }
    });
  };

  // Assuming your close button for the editWorkspaceModal has a class "close"
  var editWorkspaceModalCloseBtn = document.querySelector(
    "#editWorkspaceModal .close"
  );

  editWorkspaceModalCloseBtn.addEventListener("click", function () {
    closeModal("editWorkspaceModal");
  });

  // Function to open the delete workspace confirmation modal
  function openDeleteWorkspaceConfirmationModal(workspaceId) {
    // Display the delete confirmation modal
    document.getElementById("deleteWorkspaceConfirmationModal").style.display =
      "block";

    // Set the workspace ID on the confirm delete button for later retrieval
    document
      .getElementById("confirmWorkspaceDeleteBtn")
      .setAttribute("data-workspace-id", workspaceId);
  }

  // Add event listener for delete workspace buttons
  document
    .getElementById("workspaceTableBody")
    .addEventListener("click", function (event) {
      if (event.target.classList.contains("delete-workspace")) {
        const workspaceId = parseInt(
          event.target.getAttribute("data-workspace-id"),
          10
        );
        openDeleteWorkspaceConfirmationModal(workspaceId);
      }
    });

  // Add event listener for the confirm delete button in the delete workspace confirmation modal
  document
    .getElementById("confirmWorkspaceDeleteBtn")
    .addEventListener("click", function () {
      const workspaceId = parseInt(this.getAttribute("data-workspace-id"), 10);
      deleteWorkspace(workspaceId);
      document.getElementById(
        "deleteWorkspaceConfirmationModal"
      ).style.display = "none"; // Close the modal
    });

  // Function to delete a workspace and repopulate the table
  function deleteWorkspace(workspaceId) {
    const index = workspaceData.findIndex(
      (workspace) => workspace.workspaceId === workspaceId
    );
    if (index !== -1) {
      const propertyId = workspaceData[index].propertyId; // Capture propertyId before deletion
      workspaceData.splice(index, 1); // Delete the workspace from the array

      // Call populateWorkspaceTable with the propertyId of the deleted workspace
      populateWorkspaceTable(propertyId); // This assumes populateWorkspaceTable now accepts a propertyId argument
    } else {
      console.error("Workspace with ID", workspaceId, "not found.");
    }
  }

  // Attach event listener to the "No" button in the delete workspace confirmation modal
  var cancelDeleteWorkspaceBtn = document.getElementById(
    "cancelWorkspaceDeleteBtn"
  );
  if (cancelDeleteWorkspaceBtn) {
    cancelDeleteWorkspaceBtn.addEventListener("click", function () {
      closeModal("deleteWorkspaceConfirmationModal");
    });
  }
});
