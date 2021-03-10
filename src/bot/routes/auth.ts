import auth from 'basic-auth'


const password = process.env.API_PASS || 'qwertyasd123'
const admin = process.env.API_USER || process.env.SERVER_ID || 'admin'

const admins = {
  'admin': { password },
  [admin]: { password },
}

export default function (request, response, next) {
  const user = auth(request)
  if (!user || !admins[user.name] || admins[user.name].password !== user.pass) {
    response.set('WWW-Authenticate', 'Basic realm="example"')
    return response.status(401).send()
  }
  return next()
};
