import { PORT, DEFAULT_PORT } from './api/utils/ports';
import { syncChains } from './api/utils/syncChains';

const app = require('./api/server');

app.listen(PORT, () => {
  console.log(`Blockchain node running on port ${PORT}`)
  if (PORT !== DEFAULT_PORT) {
    syncChains()
  }
})
