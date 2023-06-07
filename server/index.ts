import { PORT, DEFAULT_PORT } from './api/utils/ports';
import { syncChains } from './api/utils/syncChains';

const server = require('./api/server');

server.listen(PORT, () => {
  console.log(`Blockchain node running on port ${PORT}`)
  if (PORT !== DEFAULT_PORT) {
    syncChains()
  }
})
