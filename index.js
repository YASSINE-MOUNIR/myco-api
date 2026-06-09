// Entry point for Vercel
// Serverless functions are in /api folder
module.exports = (req, res) => {
  res.status(200).json({ message: "Myco API is running" });
};
