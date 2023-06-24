import Block from './Block'
import GenesisBlock from './GenesisBlock';
import { GENESIS_BLOCK_DATA } from '../utils/config';

describe('isValidGenesisBlock()', () => {

    let genesisBlock: GenesisBlock
    beforeEach(() => {
      genesisBlock = new GenesisBlock()
    })
  
  
    it('Returns false if Genesis block has non zero height', () => {
      genesisBlock.height = 1
      expect(genesisBlock.isValid()).toBe(false)
    })
  
    it('Returns false if Genesis block has previous hash thats not null', () => {
      genesisBlock.previousHash = "someOtherHash"
      expect(genesisBlock.isValid()).toBe(false)
    })
  
    it('Returns false if doesnt have proof of work hash', () => {
      jest.spyOn(genesisBlock, 'hasProofOfWork').mockImplementation(() => false);
      expect(genesisBlock.isValid()).toBe(false)
    })
  
    it('Returns true otherwise', () => {
      expect(genesisBlock.isValid()).toBe(true)
    })
  
  });
  
  describe('GenesisBlock', () => {
  
    let genesisBlock
    beforeEach(() => {
      genesisBlock = new GenesisBlock()
    })
  
    describe('Constructor', () => {
      test('Creates a block', () => {
        expect(genesisBlock).toBeInstanceOf(Block)
      });
  
      test('Transactions match genesis config', () => {
        expect(genesisBlock.transactions).toBe(GENESIS_BLOCK_DATA.transactions)
      });
      test('Difficulty match genesis config', () => {
        expect(genesisBlock.difficulty).toBe(GENESIS_BLOCK_DATA.difficulty)
      });
      test('previousHash is null', () => {
        expect(genesisBlock.previousHash).toBe(null)
      });
  
      test('height is 0', () => {
        expect(genesisBlock.height).toBe(0)
      });
  
      it('Automatically creates a timestamp', () => {
        const minTime = Date.now() - 100
        const maxTime = Date.now() + 100
        expect(genesisBlock.timestamp).toBeGreaterThanOrEqual(minTime);
        expect(genesisBlock.timestamp).toBeLessThanOrEqual(maxTime);
      });
    });
  
  });
  