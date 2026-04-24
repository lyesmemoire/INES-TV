// 🌍 SOS REGIONAL AWARENESS (Snippet)
app.use((req, res, next) => {
  const region = process.env.FLY_REGION || "fra";

  res.setHeader("x-region", region);

  if (req.headers["x-failover"] === "true") {
    console.log("⚠️ FAILOVER MODE ACTIVE");
  }

  next();
});
