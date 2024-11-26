import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import Hotel from "./models/Hotel.Model.js";
import Room from "./models/Room.Model.js";
import Booking from "./models/Booking.Model.js";

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

      console.log(totalRoom);
      

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

//Get rooms by id of a hotel

app.get("/api/hotels/:hotelId/room/:roomId", async (req, res) => {
  const { hotelId, roomId } = req.params;

  try {
    // Find the room by ID and ensure it belongs to the hotel
    const room = await Room.findOne({ _id: roomId, hotel: hotelId });
    if (!room) {
      return res.status(404).json({
        message: "Room not found or does not belong to the specified hotel",
      });
    }

    // Optionally fetch the hotel details if needed
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    // Respond with room and hotel details
    res.status(200).json(room);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
});

//BOOKING APIIISSS

app.post("/api/hotels/:hotelId/room/:roomId/book-room", async (req, res) => {
  const hotelId = req.params.hotelId;
  const roomId = req.params.roomId;
  try {
    const {
      firstName,
      lastName,
      guests,
      rooms,
      checkIn,
      checkOut,
      contactEmail,
      contactPhone,
    } = req.body;

    const hotel = await Hotel.findById(hotelId);
    const room = await Room.findById(roomId);

    console.log(hotel, room);

    if (!hotel || !room) {
      return res.status(404).json({ message: "Hotel or Room not found" });
    }

    const newBooking = new Booking({
      firstName,
      lastName,
      guests,
      rooms,
      checkIn,
      checkOut,
      contactEmail,
      contactPhone,
      hotelId: hotel?._id,
      roomId: room?._id,
    });

    const savedBooking = await newBooking.save();
    res.status(201).json(savedBooking);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error: Unable to create booking");
  }
});

// get all bookings

app.get("/api/all-bookings", async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("hotelId")
      .populate("roomId");
    res.status(200).json(bookings);
  } catch (error) {
    res.status(404).send(error);
  }
});

app.put("/api/update-booking-status/:id", async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  console.log("status", status);
  console.log("id", id);

  try {
    const booking = await Booking.findByIdAndUpdate(
      id,
      { status: status },
      { new: true } // return updated booking
    );
    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Error updating booking status" });
  }
});



// search functionalities

app.post("/api/search_hotels", async (req, res) => {
  const { destination } = req.body;

  try {
    const resultHotels = await Hotel.find({
      city: { $regex: destination, $options: "i" },
    });

    if (resultHotels.length === 0) {
      return res.status(404).json({ message: "No hotels found" });
    }

    res.status(200).json({ hotels: resultHotels });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching hotels" });
  }
});

app.get("/api/search_hotels", async (req, res) => {
  const { destination } = req.query;

  try {
    const resultHotels = await Hotel.find({
      city: { $regex: destination, $options: "i" },
    });

    if (resultHotels.length === 0) {
      return res.status(404).json({ message: "No hotels found" });
    }
    res.status(200).json(resultHotels);
  } catch (err) {
    console.error(err);
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
