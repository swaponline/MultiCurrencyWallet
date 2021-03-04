/* eslint-env mocha */
'use strict'

// @ts-ignore
const randomBytes = require('iso-random-stream/src/random')
const { expect } = require('aegir/utils/chai')
const all = require('it-all')
const drain = require('it-drain')
const { utf8Encoder } = require('../src/utils')

const { Key } = require('../src')

/**
 * @typedef {import('./types').Datastore} Datastore
 * @typedef {import('./types').Pair} Pair
 */

/**
 * @param {{ teardown: () => void; setup: () => Datastore; }} test
 */
module.exports = (test) => {
  /**
   * @param {Datastore} store
   */
  const cleanup = async store => {
    await store.close()
    await test.teardown()
  }

  const createStore = async () => {
    const store = await test.setup()
    if (!store) throw new Error('missing store')
    await store.open()
    return store
  }

  describe('put', () => {
    /** @type {Datastore} */
    let store

    beforeEach(async () => {
      store = await createStore()
    })

    afterEach(() => cleanup(store))

    it('simple', () => {
      const k = new Key('/z/one')
      return store.put(k, utf8Encoder.encode('one'))
    })

    it('parallel', async () => {
      const data = []
      for (let i = 0; i < 100; i++) {
        data.push({ key: new Key(`/z/key${i}`), value: utf8Encoder.encode(`data${i}`) })
      }

      await Promise.all(data.map(d => store.put(d.key, d.value)))

      const res = await all(store.getMany(data.map(d => d.key)))
      expect(res).to.deep.equal(data.map(d => d.value))
    })
  })

  describe('putMany', () => {
    /** @type {Datastore} */
    let store

    beforeEach(async () => {
      store = await createStore()
    })

    afterEach(() => cleanup(store))

    it('streaming', async () => {
      const data = []
      for (let i = 0; i < 100; i++) {
        data.push({ key: new Key(`/z/key${i}`), value: utf8Encoder.encode(`data${i}`) })
      }

      let index = 0

      for await (const { key, value } of store.putMany(data)) {
        expect(data[index]).to.deep.equal({ key, value })
        index++
      }

      expect(index).to.equal(data.length)

      const res = await all(store.getMany(data.map(d => d.key)))
      expect(res).to.deep.equal(data.map(d => d.value))
    })
  })

  describe('get', () => {
    /** @type {Datastore} */
    let store

    beforeEach(async () => {
      store = await createStore()
    })

    afterEach(() => cleanup(store))

    it('simple', async () => {
      const k = new Key('/z/one')
      await store.put(k, utf8Encoder.encode('hello'))
      const res = await store.get(k)
      expect(res).to.be.eql(utf8Encoder.encode('hello'))
    })

    it('should throw error for missing key', async () => {
      const k = new Key('/does/not/exist')

      try {
        await store.get(k)
      } catch (err) {
        expect(err).to.have.property('code', 'ERR_NOT_FOUND')
        return
      }

      throw new Error('expected error to be thrown')
    })
  })

  describe('getMany', () => {
    /** @type {Datastore} */
    let store

    beforeEach(async () => {
      store = await createStore()
    })

    afterEach(() => cleanup(store))

    it('streaming', async () => {
      const k = new Key('/z/one')
      await store.put(k, utf8Encoder.encode('hello'))
      const source = [k]

      const res = await all(store.getMany(source))
      expect(res).to.have.lengthOf(1)
      expect(res[0]).to.be.eql(utf8Encoder.encode('hello'))
    })

    it('should throw error for missing key', async () => {
      const k = new Key('/does/not/exist')

      try {
        await drain(store.getMany([k]))
      } catch (err) {
        expect(err).to.have.property('code', 'ERR_NOT_FOUND')
        return
      }

      throw new Error('expected error to be thrown')
    })
  })

  describe('delete', () => {
    /** @type {Datastore} */
    let store

    beforeEach(async () => {
      store = await createStore()
    })

    afterEach(() => cleanup(store))

    it('simple', async () => {
      const k = new Key('/z/one')
      await store.put(k, utf8Encoder.encode('hello'))
      await store.get(k)
      await store.delete(k)
      const exists = await store.has(k)
      expect(exists).to.be.eql(false)
    })

    it('parallel', async () => {
      /** @type {[Key, Uint8Array][]} */
      const data = []
      for (let i = 0; i < 100; i++) {
        data.push([new Key(`/a/key${i}`), utf8Encoder.encode(`data${i}`)])
      }

      await Promise.all(data.map(d => store.put(d[0], d[1])))

      const res0 = await Promise.all(data.map(d => store.has(d[0])))
      res0.forEach(res => expect(res).to.be.eql(true))

      await Promise.all(data.map(d => store.delete(d[0])))

      const res1 = await Promise.all(data.map(d => store.has(d[0])))
      res1.forEach(res => expect(res).to.be.eql(false))
    })
  })

  describe('deleteMany', () => {
    /** @type {Datastore} */
    let store

    beforeEach(async () => {
      store = await createStore()
    })

    afterEach(() => cleanup(store))

    it('streaming', async () => {
      const data = []
      for (let i = 0; i < 100; i++) {
        data.push({ key: new Key(`/a/key${i}`), value: utf8Encoder.encode(`data${i}`) })
      }

      await drain(store.putMany(data))

      const res0 = await Promise.all(data.map(d => store.has(d.key)))
      res0.forEach(res => expect(res).to.be.eql(true))

      let index = 0

      for await (const key of store.deleteMany(data.map(d => d.key))) {
        expect(data[index].key).to.deep.equal(key)
        index++
      }

      expect(index).to.equal(data.length)

      const res1 = await Promise.all(data.map(d => store.has(d.key)))
      res1.forEach(res => expect(res).to.be.eql(false))
    })
  })

  describe('batch', () => {
    /** @type {Datastore} */
    let store

    beforeEach(async () => {
      store = await createStore()
    })

    afterEach(() => cleanup(store))

    it('simple', async () => {
      const b = store.batch()

      await store.put(new Key('/z/old'), utf8Encoder.encode('old'))

      b.put(new Key('/a/one'), utf8Encoder.encode('1'))
      b.put(new Key('/q/two'), utf8Encoder.encode('2'))
      b.put(new Key('/q/three'), utf8Encoder.encode('3'))
      b.delete(new Key('/z/old'))
      await b.commit()

      const keys = ['/a/one', '/q/two', '/q/three', '/z/old']
      const res = await Promise.all(keys.map(k => store.has(new Key(k))))

      expect(res).to.be.eql([true, true, true, false])
    })

    it('many (3 * 400)', async function () {
      this.timeout(20 * 1000)
      const b = store.batch()
      const count = 400
      for (let i = 0; i < count; i++) {
        b.put(new Key(`/a/hello${i}`), randomBytes(32))
        b.put(new Key(`/q/hello${i}`), randomBytes(64))
        b.put(new Key(`/z/hello${i}`), randomBytes(128))
      }

      await b.commit()

      /**
       * @param {AsyncIterable<Pair>} iterable
       */
      const total = async iterable => {
        let count = 0
        // eslint-disable-next-line no-unused-vars
        for await (const _ of iterable) count++
        return count
      }

      expect(await total(store.query({ prefix: '/a' }))).to.equal(count)
      expect(await total(store.query({ prefix: '/z' }))).to.equal(count)
      expect(await total(store.query({ prefix: '/q' }))).to.equal(count)
    })
  })

  describe('query', () => {
    /** @type {Datastore} */
    let store
    const hello = { key: new Key('/q/1hello'), value: utf8Encoder.encode('1') }
    const world = { key: new Key('/z/2world'), value: utf8Encoder.encode('2') }
    const hello2 = { key: new Key('/z/3hello2'), value: utf8Encoder.encode('3') }

    /**
     * @param {Pair} entry
     */
    const filter1 = entry => !entry.key.toString().endsWith('hello')
    /**
     * @param {Pair} entry
     */
    const filter2 = entry => entry.key.toString().endsWith('hello2')

    /**
     * @param {Pair[]} res
     */
    const order1 = res => {
      return res.sort((a, b) => {
        if (a.value.toString() < b.value.toString()) {
          return -1
        }
        return 1
      })
    }

    /**
     * @param {Pair[]} res
     */
    const order2 = res => {
      return res.sort((a, b) => {
        if (a.value.toString() < b.value.toString()) {
          return 1
        }
        if (a.value.toString() > b.value.toString()) {
          return -1
        }
        return 0
      })
    }

    /** @type {Array<[string, any, any[]|number]>} */
    const tests = [
      ['empty', {}, [hello, world, hello2]],
      ['prefix', { prefix: '/z' }, [world, hello2]],
      ['1 filter', { filters: [filter1] }, [world, hello2]],
      ['2 filters', { filters: [filter1, filter2] }, [hello2]],
      ['limit', { limit: 1 }, 1],
      ['offset', { offset: 1 }, 2],
      ['keysOnly', { keysOnly: true }, [{ key: hello.key }, { key: world.key }, { key: hello2.key }]],
      ['1 order (1)', { orders: [order1] }, [hello, world, hello2]],
      ['1 order (reverse 1)', { orders: [order2] }, [hello2, world, hello]]
    ]

    before(async () => {
      store = await createStore()

      const b = store.batch()

      b.put(hello.key, hello.value)
      b.put(world.key, world.value)
      b.put(hello2.key, hello2.value)

      return b.commit()
    })

    after(() => cleanup(store))

    tests.forEach(([name, query, expected]) => it(name, async () => {
      let res = await all(store.query(query))

      if (Array.isArray(expected)) {
        if (query.orders == null) {
          expect(res).to.have.length(expected.length)
          /**
           * @param {Pair} a
           * @param {Pair} b
           */
          const s = (a, b) => {
            if (a.key.toString() < b.key.toString()) {
              return 1
            } else {
              return -1
            }
          }
          res = res.sort(s)
          const exp = expected.sort(s)

          res.forEach((r, i) => {
            expect(r.key.toString()).to.be.eql(exp[i].key.toString())

            if (r.value == null) {
              expect(exp[i].value).to.not.exist()
            } else {
              expect(r.value).to.deep.equal(exp[i].value)
            }
          })
        } else {
          expect(res).to.be.eql(expected)
        }
      } else if (typeof expected === 'number') {
        expect(res).to.have.length(expected)
      }
    }))

    it('allows mutating the datastore during a query', async () => {
      const hello3 = { key: new Key('/z/4hello3'), value: utf8Encoder.encode('4') }
      let firstIteration = true

      for await (const {} of store.query({})) { // eslint-disable-line no-empty-pattern
        if (firstIteration) {
          expect(await store.has(hello2.key)).to.be.true()
          await store.delete(hello2.key)
          expect(await store.has(hello2.key)).to.be.false()

          await store.put(hello3.key, hello3.value)
          firstIteration = false
        }
      }

      const results = await all(store.query({}))

      expect(firstIteration).to.be.false('Query did not return anything')
      expect(results.map(result => result.key)).to.have.deep.members([
        hello.key,
        world.key,
        hello3.key
      ])
    })

    it('queries while the datastore is being mutated', async () => {
      const writePromise = store.put(new Key(`/z/key-${Math.random()}`), utf8Encoder.encode('0'))
      const results = await all(store.query({}))
      expect(results.length).to.be.greaterThan(0)
      await writePromise
    })
  })

  describe('lifecycle', () => {
    /** @type {Datastore} */
    let store

    before(async () => {
      store = await test.setup()
      if (!store) throw new Error('missing store')
    })

    after(() => cleanup(store))

    it('close and open', async () => {
      await store.close()
      await store.open()
      await store.close()
      await store.open()
    })
  })
}
