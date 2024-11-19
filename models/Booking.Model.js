import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
    },
    guests: {
      type: Number,
      required: [true, "Number of guests is required"],
      min: [1, "At least one guest is required"],
    },
    rooms: {
      type: Number,
      required: [true, "Number of rooms is required"],
      min: [1, "At least one room is required"],
    },
    checkIn: {
      type: Date,
      required: [true, "Check-in date is required"],
    },
    checkOut: {
      type: Date,
      required: [true, "Check-out date is required"],
    },
    status: {
      type: Boolean,
      default: false, // Indicates whether the booking is confirmed
    },
    contactEmail: {
      type: String,
      required: [true, "Contact email is required"],
      match: [/.+@.+\..+/, "Please enter a valid email address"],
    },
    contactPhone: {
      type: String,
      required: [true, "Contact phone number is required"],
      match: [/^\d{10,15}$/, "Please enter a valid phone number"], // Example regex for phone validation
    },
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: [true, "Hotel ID is required"],
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: [true, "Room ID is required"],
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
