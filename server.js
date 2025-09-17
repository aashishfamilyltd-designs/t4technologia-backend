// server.js
import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// 🔑 Secret key for JWT
const JWT_SECRET = "your_secret_key_here";

// ✅ MongoDB Connection
mongoose.connect("mongodb+srv://<username>:<password>@cluster.mongodb.net/t4technologia", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// 📦 Product Schema
const productSchema = new mongoose.Schema({
    pname: String,
    pabout: String,
    plink: String,
    pimage: String,
});

const Product = mongoose.model("Product", productSchema);

// 👤 Dummy admin credentials
const ADMIN = {
    username: "admin",
    password: "12345"
};

// 🔐 Login Route
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (username === ADMIN.username && password === ADMIN.password) {
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
        return res.json({ success: true, message: "Login successful", token });
    }
    res.json({ success: false, message: "Invalid credentials" });
});

// ✅ Middleware to verify token
function verifyToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(403).json({ success: false, message: "No token provided" });

    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ success: false, message: "Failed to authenticate token" });
        req.user = decoded;
        next();
    });
}

// 📦 Add Product (protected route)
app.post("/addProduct", verifyToken, async (req, res) => {
    try {
        const { pname, pabout, plink, pimage } = req.body;
        const newProduct = new Product({ pname, pabout, plink, pimage });
        await newProduct.save();
        res.json({ success: true, message: "Product added successfully" });
    } catch (err) {
        res.json({ success: false, message: "Error adding product" });
    }
});

// 📦 Get All Products
app.get("/products", async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

// 🌍 Server listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
