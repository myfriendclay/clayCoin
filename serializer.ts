import { Type, plainToClass } from 'class-transformer';
import Block from './blockchain/Block/Block';
import Transaction from './blockchain/Transaction/Transaction';

export class Blockchain {
  id: number;

  @Type(() => Block)
  chain: Block[];
}
