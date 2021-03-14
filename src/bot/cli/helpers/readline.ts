import readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

let invite = '> '

const setInvite = (newInvite) => {
  invite = newInvite
}

const read = async (question?) => {
  return new Promise((resolve, reject) => {
    rl.question(question || invite, (answer) => {
      resolve(answer)
    })
  })
}

export default read
