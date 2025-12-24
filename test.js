require("dotenv").config();
const getAccessToken = require("./zohoAuth");

getAccessToken().then(token => {
  console.log("ACCESS TOKEN:", token);
}).catch(err => {
  console.log(err.response?.data || err.message);
});
