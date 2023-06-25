import Blockchain from "../blockchain/Blockchain/Blockchain";
import Mempool from "../blockchain/Mempool/Mempool";

export const blockchain = new Blockchain()
export const mempool = new Mempool(blockchain)