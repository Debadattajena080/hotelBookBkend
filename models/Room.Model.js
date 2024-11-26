import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomDescriptions: {
      type: String,
      required: true,
    },
    roomType: {
      type: String,
      required: true,
      default: "Classic",
    },
    totalRoom: {
      type: Number,
      required: true,
      default: 5,
    },
    capacity: {
      type: Number,
      required: true,
      default: 3,
    },

    price: {
      type: Number,
      required: true,
      default: 10,
    },

    amenities: [{ type: String }],
    roomimages: [{ type: String }],

    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },

    remainingRoom: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

roomSchema.pre("save", function (next) {
  if (this.isNew) {
    this.remainingRoom = this.totalRoom; // Set remainingRoom to totalRoom when creating a new room
  }
  next();
});

const Room = mongoose.model("Room", roomSchema);
export default Room;
