const route = (handler) => async (req, res) => {
  try {
    const result = await handler(req)

    res.json(result)
  } catch (err) {
    // res.status(500).send(JSON.stringify(err))
    res.status(500).json(JSON.stringify(err))
    // res.status().json({ error: err })
  }
}

export default route
