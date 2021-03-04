const { buffer, flatten, pipeline, transform } = require('streaming-iterables')
const got = require('got@11.8.1')

// A generator to fetch all the pokemon from the pokemon api
const pokedex = async function* () {
  let offset = 0
  while(true) {
    const url = `https://pokeapi.co/api/v2/pokemon/?offset=${offset}`
    const { results: pokemon } = await got(url).json()
    if (pokemon.length === 0) {
      return
    }
    offset += pokemon.length
    yield pokemon
  }
}

// lets buffer two pages so they're ready when we want them
const bufferTwo = buffer(2)

// a transform iterator that will load the monsters two at a time and yield them as soon as they're ready
const pokeLoader = transform(2, async ({ url }) => got(url).json())

// string together all our functions with a flatten to get one pokemon at a time
const pokePipe = pipeline(pokedex, bufferTwo, flatten, pokeLoader)

// lets do it team!
const run = async () => {
  for await (const pokemon of pokePipe){
    console.log(pokemon.name)
    console.log(pokemon.sprites.front_default)
  }
}

run().then(() => console.log('caught them all!'))
