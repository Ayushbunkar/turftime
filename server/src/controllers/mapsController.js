import axios from "axios";

export async function getDistance(req, res) {
  const { origin, destination } = req.body;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!origin || !destination || !origin.lat || !origin.lng || !destination.lat || !destination.lng) {
    return res.status(400).json({ error: "Missing or invalid origin/destination coordinates" });
  }

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&key=${apiKey}`;
  try {
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
