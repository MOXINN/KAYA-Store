const path = require("path");  

process.env.NODE_CONFIG_DIR = path.join(__dirname, "config");

const app = require("./app");


const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on ${PORT}`);
});
