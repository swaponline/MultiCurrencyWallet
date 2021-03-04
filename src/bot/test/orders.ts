import chai from 'chai'
import chaiHttp from 'chai-http'
import { app, server, listener } from '../app'


//During the test the env variable is set to test
process.env.NODE_ENV = 'test'

chai.should()
chai.use(chaiHttp)

//@ts-ignore
before(async () => { await app.ready })
//@ts-ignore
after(async () => { await listener.close() })


describe('Wallet', () => {

  // beforeEach((done) => setTimeout(done, 3000))

  describe('/me endpoint', () => {

    it('should GET balance', async () => {

      return chai.request(server)
        .get('/me/balance')
        .then((res) => {

        // .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.balances.should.not.be.eql(0)

          console.log('body', res.body)
          // res.body.length.should.be.eql(0)
          return true
        })

    })
  })
})


describe('Orders', () => {

  beforeEach((done) => {
    //@ts-ignore
    app.sync.then(done)
  })

  describe('/orders endpoint', () => {

    it('should GET list of orders', (done) => {

      chai.request(server)
        .get('/orders')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('array')
          res.body.length.should.not.be.eql(0)
          done()
        })

    })

    it('should create new order', (done) => {
      const order_example_json = {
        'buyCurrency': 'ETH',
        'sellCurrency': 'BTC',
        'buyAmount': 0.07,
        'sellAmount': 0.01
      }

      chai.request(server)
        .post('/orders')
        .send(order_example_json)
        .end((err, res) => {
          res.should.have.status(201)
          res.body.should.be.a('object')
          // res.body.id.should.not.be.eql(0)

          chai.request(server)
            .get('/orders')
            .end((err, res) => {
              res.should.have.status(200)
              res.body.should.be.a('array')
              res.body.length.should.not.be.eql(0)
              done()
            })

        })

    })
  })
})
