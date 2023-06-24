import CoinbaseTransaction from './CoinbaseTransaction'
import Transaction from './Transaction';
import { COINBASE_TX } from '../utils/config';

describe('CoinbaseTransaction subclass', () => {
    let coinbaseTx
    let miningRewardAddress = "miningRewardAddress"
    let miningReward = 10
  
    beforeEach(() => {
      coinbaseTx = new CoinbaseTransaction(miningRewardAddress, miningReward)
    })
  
    describe('Constructor', () => {
      it('Creates a transaction instance', () => {
        expect(coinbaseTx).toBeInstanceOf(Transaction)
        expect(coinbaseTx).toBeInstanceOf(CoinbaseTransaction)
      });
    
      it('Has Coinbase Tx fields from config value', () => {
        expect(coinbaseTx).toMatchObject({
          fromAddress: COINBASE_TX.fromAddress,
          memo: COINBASE_TX.memo,
        });
      }); 
    
      it('Sets toAddress and amount from method arguments', () => {
        expect(coinbaseTx).toMatchObject({
          toAddress: miningRewardAddress,
          amount: miningReward,
        });
      }); 
    
      it('Has no fee', () => {
        expect(coinbaseTx.fee).toBe(0)
      });
    })
  
    describe('isValid', () => {
  
      describe('Returns false', () => {
  
        it('When amount is 0 or less', () => {
          coinbaseTx.amount = 0
          expect(coinbaseTx.isValid()).toBe(false)
          coinbaseTx.amount = -1
          expect(coinbaseTx.isValid()).toBe(false)
        });
  
        it('When fromAddress doesnt match config', () => {
          coinbaseTx.fromAddress = "madeupFromAddress"
          expect(coinbaseTx.isValid()).toBe(false)
        });
  
        it('When memo doesnt match config', () => {
          coinbaseTx.memo = "madeupMemo"
          expect(coinbaseTx.isValid()).toBe(false)
        }); 
      })
  
      describe('Returns true', () => {
        it('Otherwise', () => {
          expect(coinbaseTx.isValid()).toBe(true)
        });
      })
  
    })
  });