import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import Hotel from "./models/Hotel.Model.js";
import mongoDBConnection from "./db/connectDB.js";

const app = express();
mongoDBConnection();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads"); 
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/api/add-hotel", upload.array("uploadImages", 10), async (req, res) => {
  try {
    const { hotelname, description, price, address, city, email, phone } = req.body;

    const imagePaths = req.files.map(file => file.path);
    const newHotel = new Hotel({
      hotelname,
      description,
      price,
      city,
      address,
      email,
      phone,
      images: imagePaths,
    });

    const savedHotel = await newHotel.save();
    res.json(savedHotel);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

app.get("/api/hotels", async (req, res) => {
  try {
    const hotels = await Hotel.find(); // Fetch all hotels
    res.json(hotels);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

app.get("/api/hotels/:id", async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    res.json(hotel);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
