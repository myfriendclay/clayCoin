import crypto from 'crypto'

const getSHA256Hash = (...inputs: any[]) => {
  const stringArray = inputs.map(input => JSON.stringify(input))
  const sortedInputsString = stringArray.sort().join()
  return crypto.createHash('sha256')
    .update(sortedInputsString)
    .digest('hex')
}

export default getSHA256Hash