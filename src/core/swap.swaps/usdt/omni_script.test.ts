import createOmniScript from './omni_script'

test('creates script', () => {
  const output = createOmniScript(10) // USDT

  console.log(output.toString('hex'))

  expect(output.toString('hex')).toBe('6a146f6d6e69000000000000001f000000003b9aca00')
})
