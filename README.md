## My Personal Cryptocurrency Blockchain aka "ClayCoin"

## Description

This is a blockchain backend + frontend webapp that allows you to:

- Create new public/private key wallets
- Add transactions to memPool (only if you have sufficient funds on the blockchain and a valid public/private key pair) 
- Mine a block and receive a mining reward for your generous compute power donation
- Broadcast and receive messages to/from other nodes on the network and sync your blockchain with the longest valid chain

Note: things like target difficulty are set in the `backend/config.ts` file and defaulted to very low numbers like 100 milliseconds so that the app runs quickly. The app will automatically adjust the difficulty level based on the mining time of the previous block.

## Prerequisites

Make sure you have [Docker](https://docs.docker.com/engine/install/) installed on your machine before proceeding. Then `git clone <repository-url>` this repository onto your local machine.

## Getting Started

Note: I know it's atypical to have `.env` file included in git, but since there is no sensitive data and it just makes it easier to get the project up and running, I'm including it for now.

### Backend

1. Navigate to `/backend` directory in terminal tab #1

2. Build the Docker image and run the container for the backend:
```
docker build -t backend-image . && docker run -p 3001:3001 backend-image
```
3. The backend application should now be running on `http://localhost:3001`

### Frontend

1. Navigate to `/frontend` directory in terminal tab #2

2. Build the Docker image and run the container for the frontend:
```
docker build -t frontend-image . && docker run -p 3000:3000 frontend-image
```
3. The frontend application should now be accessible on `http://localhost:3000`.

### Using the app

Once you have the API running in one terminal tab and the Webapp running in another, it's time to have some fun! Here is a good first time workflow to familiarize yourself with the app:

1. Click "Add Transaction" at the top.

2. In the modal that pops up, click "Generate New Wallet".

3. Click "Copy Public Key" and paste it into the "Wallet public key" ballance checker and hit "Check Balance". Note it has 0 ₿. Let's get some money!

4. Save your public key somewhere on your computer. Then click "Copy Private Key" and save it too- you will be using both in a moment.

5. Exit out of the Add Transaction modal, and paste your public key into the "Mining Address" field. Hit Mine Block #1 button.

6. Note that the blockchain just added a block. There are no transactions on the block except for the Coinbase Transaction that you just got rewarded from. Now let's spend that money you just made yourself! As long as you didn't lose your private key... you didn't lose it already, did you?

7. Open Add Transaction again. Note that if you check your balance you now have some dough. Fill out the info- recipient address can be a friend's public key or any string; it's on you if you send it to a bogus address without a matching private key to retrieve it with!

8. When all the info is filed out hit "Send Payment". Note this adds the payment to the Mempool, but not yet the Blockchain. To add it to the Blockchain, you'll want to hit "Mine Block" again.

9. Note another block was added, this time with your transaction. Click on the down arrow on the lefthand side of the newly added block to show the transactions.

10. Note that everytime a node on the network gets an update, it will broadcast a message to all the other nodes. The webapp will update in realtime with the latest blockchain.

## Optional Stuff

1. To run a peer node, i.e. imitate the experience of a peer on the network, in a separate terminal tab from `/backend` directory run:
```
npm run dev-peer
```

2. To run unit test suite:  
```
npm test
```