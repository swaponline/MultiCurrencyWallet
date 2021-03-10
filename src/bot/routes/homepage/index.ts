import path from 'path'


const home = async (req, res) => {
  res.sendFile(path.join(__dirname + '/../web/home.html'))
}


export default home