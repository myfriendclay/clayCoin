export interface BlockType {
    timestamp: number;
    hash: string | undefined;
    height: number;
    nonce: number;
    miningDurationMs: number;
    previousHash: string | null;
    transactions: TransactionType[];
    difficulty: number;
  }
  
  export interface TransactionType {
    fromAddress: string;
    toAddress: string;
    amount: number;
    memo: string;
    fee: number;
    uuid: string;
    timestamp: number;
  }
  
  export interface AlertType {
    open: boolean;
    alertMessage: string;
    alertType: "success" | "error" | "warning" | "info";
  }