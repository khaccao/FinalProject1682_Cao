const express = require("express");
const cors = require("cors"); // ✅ Thêm dòng này
const connectDB = require("./configs/database");
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/task");
const productRoutes = require("./routes/product");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use("/routes/auth", authRoutes);
app.use("/routes/task", taskRoutes);
app.use("/routes/product", productRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

require("./services/scheduler");
