import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema({
  hotelname: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  images: [{ type: String }], // Array to hold image paths
});

const Hotel = mongoose.model("Hotel", hotelSchema);

export default Hotel;
