## My Personal Cryptocurrency Blockchain aka "ClayCoin"

## Description

This is a blockchain with a frontend webapp that allows you to create new public/private key wallets, send payment from one wallet to another using elliptic curve cryptography. To mine a block, put your public key in the Mining Address field to receive the mining block reward, and hit `Mine Block` to find the right nonce. All mined blocks on the blockchain show up in the Blockchain section at the bottom. 

Note things like target difficulty are set in the `config.ts` file and defaulted to very low numbers like 100 milliseconds so that the app runs quickly. The app will automatically adjust the difficulty level based on the mining time of the previous mining time.

## Installation and Setup Instructions

1. `git clone <url>` down this repository onto your local machine. Note you will need `node`, `redis`, and `npm` installed globally on your machine. Assuming you have homebrew installed, you can install each by running: `brew install <name>` e.g. `brew install redis`

2. To install project dependencies run:

`npm install`

3. To run a node on the blockchain, from the root directory `/` run:

`npm run dev`

4. (Optional) To run a peer node, i.e. imitate the experience of a peer on the network, in a separate terminal tab run:

`npm run dev-peer`

5. You will want to add a `.env` file to the root directory and include `DEFAULT_PORT=3001` so that everything is hooked up properly (currently working on getting this to be less janky :)). 

6. To run the front end webapp, navigate to `/app` directory run:

`npm install` followed by `npm start`

7. You can then visit the app and play around with it at:

`localhost:3000`

8. (Optional) To run unit test suite:  

`npm test`