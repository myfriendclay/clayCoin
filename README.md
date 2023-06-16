## My Personal Cryptocurrency Blockchain aka "ClayCoin"

## Description

This is a blockchain backend + frontend webapp that allows you to:

- Create new public/private key wallets
- Add transactions to memPool (only if you have sufficient funds on the blockchain and a valid public/private key pair) 
- Mine a block and receive a mining reward for your generous compute power donation

Note: things like target difficulty are set in the `backend/config.ts` file and defaulted to very low numbers like 100 milliseconds so that the app runs quickly. The app will automatically adjust the difficulty level based on the mining time of the previous block.

## Prerequisites

Make sure you have [Docker](https://docs.docker.com/engine/install/) installed on your machine before proceeding. Then `git clone <repository-url>` this repository onto your local machine.

## Getting Started

Note: I know it's atypical to have `.env` file included in git, but since there is no sensitive data and it just makes it easier to get the project up and running, I'm including it for now.

### Backend

1. Navigate to `/backend` directory 

2. Build the Docker image and run the container for the backend:
```
docker build -t backend-image . && docker run -p 3001:3001 backend-image
```
3. The backend application should now be running on `http://localhost:3001`

### Frontend

1. Navigate to `/frontend` directory

2. Build the Docker image and run the container for the frontend:
```
docker build -t frontend-image . && docker run -p 3000:3000 frontend-image
```
3. The frontend application should now be accessible on `http://localhost:3000`.

## Optional Stuff

1. To run a peer node, i.e. imitate the experience of a peer on the network, in a separate terminal tab from `/backend` directory run:
```
npm run dev-peer
```

2. To run unit test suite:  
```
npm test
```