export default (service, name) => {
  if (!service || !service._serviceName || service._serviceName !== name)
    throw new Error(`Required service ${name}, got: ${service} ${service._serviceName}`)
}
