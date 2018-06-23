import { request } from 'helpers'


const send = () => {
  const url = `https://htlc.me/v0/invoices/6b1d6d70-7f85-40a8-a286-acf6675ccfc2`

  return request.post(url, {
    body: '{tokens:4000}',
  })
    .then((res) => console.log(res))
}

export default {
  send,
}
