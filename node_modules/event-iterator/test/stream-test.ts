import {IncomingMessage, ServerResponse} from "http"
import {createServer, request} from "http"
import {createReadStream} from "fs"
import {assert} from "chai"
import {stream} from "../src/node"

describe("stream", function () {
  describe("with file", function () {
    it("should read data chunks", async function () {
      /* If implementation is correct, then buffer chunks should result in same
         file no matter the buffer size. */
      async function read(highWaterMark: number) {
        const file = createReadStream("package.json", {highWaterMark})
        const data = []
        for await (const chunk of stream.call(file)) {
          data.push(chunk)
        }

        return Buffer.concat(data)
      }

      assert.deepEqual(await read(16), await read(1024))
    })

    it("should throw on error", async function () {
      const file = createReadStream("does not exist")
      try {
        for await (const chunk of stream.call(file)) {
          console.log(chunk)
        }
        assert.ok(false)
      } catch (err) {
        assert.equal(err.code, "ENOENT")
      }
    })
  })

  describe("with http request", function () {
    it("should read data chunks", async function () {
      async function read(port: number) {
        const server = createServer(
          async (req: IncomingMessage, res: ServerResponse) => {
            res.setHeader("Transfer-Encoding", "Chunked")

            for (let i = 0; i < 100; i++) {
              res.write("Hello world!\n")
              await new Promise(resolve => setImmediate(resolve))
            }

            res.end()
          },
        )

        server.listen(port)

        const data: Buffer[] = []
        await new Promise(resolve => {
          request({port}, async res => {
            for await (const chunk of stream.call(res)) {
              data.push(chunk)
            }
            resolve()
          }).end()
        })

        server.close()
        return Buffer.concat(data)
      }

      const received = await read(1234)
      assert.equal(received.length, "Hello world!\n".length * 100)
    })
  })
})
