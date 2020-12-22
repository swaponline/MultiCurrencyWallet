const version = process.env.VERSION

export default {
  name: version ? version.substring(0, 6) : null,
  link: version ? `https://github.com/search?q=${version}&type=Commits` : null,
}
