require('dotenv').config();

export const DEFAULT_PORT: number = parseInt(process.env.DEFAULT_PORT || '3000');

//Multiple peer setup- setup
let PEER_PORT
export const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`

if (process.env.GENERATE_PEER_PORT === "true") {
  PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000)
}

export const PORT = PEER_PORT || DEFAULT_PORT