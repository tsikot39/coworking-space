const bcrypt = require("bcrypt");
const { client } = require("../connection");

exports.createUser = async (req, res) => {
  try {
    // Extract user data from request body
    const { fullname, phone, email, role, username, password } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      fullname,
      phone,
      email,
      role,
      username,
      password: hashedPassword, // Store the hashed password
    };

    const db = client.db("Workspace");
    const collection = db.collection("Users");
    const result = await collection.insertOne(newUser);

    res
      .status(201)
      .json({ message: "User created successfully", data: result.ops[0] });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to register user", error: error.message });
  }
};

// Login
exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  const db = client.db("Workspace");
  const collection = db.collection("Users");

  try {
    const user = await collection.findOne({ username });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Passwords match
      const { password, ...userWithoutPassword } = user;
      res
        .status(200)
        .json({ message: "Login successful", user: userWithoutPassword });
    } else {
      // Authentication failed
      res.status(401).json({ message: "Authentication failed" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
