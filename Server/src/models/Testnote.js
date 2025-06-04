const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: String, default: new Date().toLocaleDateString() },
  time: {
    type: String,
    default: new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  },
  color: { type: String, default: "yellow.200" }, // Default color
  createdAt: { type: Date, default: Date.now },
});
const Note = mongoose.model("Note", noteSchema);

