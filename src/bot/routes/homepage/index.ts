var path = require('path');


const home = async (req, res) => {


  res.sendFile(path.join(__dirname + '/../web/home.html'));

}



module.exports = home