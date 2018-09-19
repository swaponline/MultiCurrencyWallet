export const constants = {
  high_precision: 10e-7,
  low_precision: 10e-5,
}

export const areFloatsEqual = (float1, float2) => Math.abs(float1 - float2) <= constants.low_precision
