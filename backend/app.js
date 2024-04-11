require("dotenv").config();

const express = require("express");
const cors = require("cors"); // Import CORS package
const userRoutes = require("./routes/userRoutes");
const { client, run } = require("./connection");
const { ObjectId } = require("mongodb");

const app = express();
app.use(cors()); // Use CORS with default options
const path = require("path");
app.use(express.static(path.join(__dirname, "../frontend")));

app.use(express.json());
app.use("/api", userRoutes); // Mount the userRoutes on the /api path

// API ENDPOINT TO HANDLE REGISTRATION
app.post("/register", async (req, res) => {
  const formData = req.body;
  try {
    const db = client.db("Workspace"); // Replace with your database name
    const collection = db.collection("Users"); // Replace with your collection name
    const result = await collection.insertOne(formData);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to register user", error });
  }
});

// API ENDPOINT TO ADD A NEW PROPERTY
app.post("/add-property", async (req, res) => {
  // const propertyData = req.body; // Get property data from request body
  const propertyData = { ...req.body, createdAt: new Date() };
  try {
    const db = client.db("Workspace"); // Adjust with your database name if different
    const collection = db.collection("Properties"); // Create or specify the collection for properties
    const result = await collection.insertOne(propertyData);
    res.status(201).json({ message: "Property added successfully", result });
  } catch (error) {
    res.status(500).json({ message: "Failed to add property", error });
  }
});

// API ENDPOINT TO LOAD ALL PROPERTIES IN THE PROPERTY TABLE
app.get("/properties", async (req, res) => {
  try {
    const db = client.db("Workspace");
    const collection = db.collection("Properties");
    const properties = await collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch properties", error });
  }
});

// API ENDPOINT TO GET COUNT OF ALL PROPERTIES
app.get("/properties/count", async (req, res) => {
  try {
    const db = client.db("Workspace");
    const collection = db.collection("Properties");
    const count = await collection.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching properties count:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch properties count", error });
  }
});

// API ENDPOINT TO GET COUNT OF ALL WORKSPACES
app.get("/workspaces/count", async (req, res) => {
  try {
    const db = client.db("Workspace");
    const collection = db.collection("Workspaces");
    const count = await collection.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching workspaces count:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch workspaces count", error });
  }
});

// API ENDPOINT THAT FETCHES A SINGLE PROPERTY BY _ID
app.get("/properties/:id", async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid ID format" });
  }

  try {
    const db = client.db("Workspace");
    const collection = db.collection("Properties");
    const property = await collection.findOne({
      _id: new ObjectId(id),
    });

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json(property);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch property", error });
  }
});

// API ENDPOINT TO UPDATE THE PROPERTY TABLE
app.put("/properties/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const db = client.db("Workspace");
    const collection = db.collection("Properties");
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json({ message: "Property updated successfully", result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update property", error });
  }
});

// API ENDPOINT TO DELETE A PROPERTY AND ITS ASSOCIATED WORKSPACES
app.delete("/properties/:id", async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send("Invalid ID format");
  }

  try {
    const _id = new ObjectId(id);
    const db = client.db("Workspace");
    const propertiesCollection = db.collection("Properties");
    const workspacesCollection = db.collection("Workspaces");

    // First, delete the property
    const propertyResult = await propertiesCollection.deleteOne({ _id });

    if (propertyResult.deletedCount === 0) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Then, delete all workspaces associated with this property ID
    const workspaceResult = await workspacesCollection.deleteMany({
      propertyId: _id.toString(),
    });

    res.status(200).json({
      message: "Property and associated workspaces deleted successfully",
      propertyDeletedCount: propertyResult.deletedCount,
      workspacesDeletedCount: workspaceResult.deletedCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to delete property and associated workspaces",
      error,
    });
  }
});

// API ENDPOINT TO ADD NEW WORKSPACE
app.post("/add-workspace", async (req, res) => {
  const workspaceData = req.body; // Get workspace data from request body
  try {
    const db = client.db("Workspace"); // Use your MongoDB database name
    const collection = db.collection("Workspaces"); // Use the "Workspaces" collection
    const result = await collection.insertOne(workspaceData);
    res.status(201).json({ message: "Workspace added successfully", result });
  } catch (error) {
    res.status(500).json({ message: "Failed to add workspace", error });
  }
});

// API ENDPOINT TO GET WORKSPACES BY PROPERTY ID AND DISPLAY THEM TO WORKSPACE TABLE
app.get("/workspaces/:propertyId", async (req, res) => {
  const { propertyId } = req.params;
  try {
    const db = client.db("Workspace");
    const collection = db.collection("Workspaces");
    const workspaces = await collection
      .find({ propertyId: propertyId })
      .sort({ createdAt: -1 })
      .toArray();
    res.status(200).json(workspaces);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch workspaces", error });
  }
});

// API ENDPOINT THAT FETCHES A SINGLE WORKSPACE BY _ID
app.get("/workspaces/details/:id", async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid ID format" });
  }

  try {
    const db = client.db("Workspace");
    const collection = db.collection("Workspaces");
    const workspace = await collection.findOne({
      _id: new ObjectId(id),
    });

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    res.status(200).json(workspace);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch workspace", error });
  }
});

// API ENDPOINT TO HANDLE WORKSPACE UPDATES
app.put("/workspaces/update/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid ID format" });
  }

  try {
    const db = client.db("Workspace");
    const collection = db.collection("Workspaces");
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    res.status(200).json({ message: "Workspace updated successfully", result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update workspace", error });
  }
});

// API BACKEND TO DELETE WORKSPACE
app.delete("/api/workspaces/:workspaceId", async (req, res) => {
  const { workspaceId } = req.params;

  try {
    const db = client.db("Workspace");
    const result = await db
      .collection("Workspaces")
      .deleteOne({ _id: new ObjectId(workspaceId) });
    if (result.deletedCount === 0) {
      return res.status(404).send({ message: "Workspace not found" });
    }
    res.status(200).send({ message: "Workspace deleted successfully" });
  } catch (error) {
    console.error("Error deleting workspace:", error);
    res.status(500).send({ message: "Failed to delete workspace" });
  }
});

// API ENDPOINT FOR SEARCH
app.get("/search-properties", async (req, res) => {
  try {
    let propertiesQuery = {};

    if (req.query.address)
      propertiesQuery.address = { $regex: req.query.address, $options: "i" };

    if (req.query.neighborhood) {
      propertiesQuery.neighborhood = req.query.neighborhood;
    }

    if (req.query.squareFeet) {
      propertiesQuery.squareFeet = { $gte: req.query.squareFeet };
    }

    if (req.query.parking) {
      propertiesQuery.parking = req.query.parking;
    }

    if (req.query["public-transpo"]) {
      propertiesQuery.publicTransportation = req.query["public-transpo"];
    }

    const db = client.db("Workspace");
    let workspaceQuery = {};

    if (req.query.seatNumber) {
      workspaceQuery.seatNumber = { $gte: req.query.seatNumber };
    }

    if (req.query["allow-smoking"]) {
      workspaceQuery.allowSmoking = req.query["allow-smoking"];
    }

    if (req.query.dateAvailable) {
      workspaceQuery.dateAvailable = req.query.dateAvailable;
    }

    if (req.query["lease-term"]) {
      workspaceQuery.leaseTerm = req.query["lease-term"];
    }

    if (req.query.price) {
      workspaceQuery.price = { $gte: req.query.price };
    }

    let matchingPropertyIds = [];

    // If workspace-specific criteria are specified, find matching workspaces first
    if (Object.keys(workspaceQuery).length > 0) {
      const matchingWorkspaces = await db
        .collection("Workspaces")
        .find(workspaceQuery)
        .toArray();
      matchingPropertyIds = matchingWorkspaces.map((ws) => ws.propertyId);
      // Adjust the properties query to only include properties with matching workspaces
      propertiesQuery._id = {
        $in: matchingPropertyIds.map((id) => new ObjectId(id)),
      };
    }

    // Fetch matching properties based on updated query
    const matchingProperties = await db
      .collection("Properties")
      .find(propertiesQuery)
      .toArray();

    res.json(matchingProperties);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error searching properties" });
  }
});

const PORT = process.env.PORT || 3000;

// Use the run function from connection.js to connect to MongoDB
run()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(console.dir);
