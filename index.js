import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import Hotel from "./models/Hotel.Model.js";
import Room from "./models/Room.Model.js";
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

app.post(
  "/api/add-hotel",
  upload.array("uploadImages", 6),
  async (req, res) => {
    try {
      const { hotelname, description, address, city, email, phone } = req.body;

      const imagePaths = req.files.map((file) => file.path);
      const newHotel = new Hotel({
        hotelname,
        description,
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
  }
);

app.get("/api/hotels", async (req, res) => {
  try {
    const hotels = await Hotel.find(); // Fetch all hotels
    res.json(hotels);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

app.get("/api/hotels/:hotelId", async (req, res) => {
  try {
    console.log("Params", req.params.hotelId);
    const hotel = await Hotel.findById(req.params.hotelId);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not exist" });
    }
    res.json(hotel);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// Rooms API

//POST

app.post(
  "/api/hotels/:hotelId/add-rooms",
  upload.array("uploadImages", 6),
  async (req, res) => {
    try {
      const hotelId = req.params.hotelId;
      const {
        roomType,
        totalRoom,
        capacity,
        price,
        amenities,
        roomDescriptions,
      } = req.body; // Room details

      //check if hotel exists with the same id
      const hotel = await Hotel.findById(req.params.hotelId);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      const imagePaths = req.files.map((file) => file.path);
      const newRoom = new Room({
        roomType,
        roomDescriptions,
        totalRoom,
        capacity,
        price,
        amenities,
        hotel: hotelId,
        roomimages: imagePaths,
      });

      const savedRoom = await newRoom.save();
      res.status(201).json(savedRoom);
    } catch (err) {
      console.log(err);
      res.status(500).send("Server Error, room not saved!");
    }
  }
);

//GET

app.get("/api/hotels/:hotelId/rooms", async (req, res) => {
  try {
    const hotelId = req.params.hotelId;
    console.log(req.params.hotelId);

    const hotel = await Hotel.findById(hotelId);
    console.log("Hotel: ", hotel);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not foundssss" });
    }
    const rooms = await Room.find({ hotel: hotelId });
    console.log("Rooms: ", rooms);

    res.json(rooms);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error, rooms not found!");
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
