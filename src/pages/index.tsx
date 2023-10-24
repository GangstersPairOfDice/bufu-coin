import Head from "next/head";
import Link from "next/link";
import * as crypto from "crypto";

export default function Home() {
  // class that defines the block structure
  class Block {
    public index: number; // heigh of block in blockchain
    public hash: string; // sha256 hash from content of block
    public previousHash: string; // ref to previous block hash
    public timestamp: number; // a timestamp
    public data: string; // any data that is included in the block

    // inits object instance of the block class
    constructor(
      index: number,
      hash: string,
      previousHash: string,
      timestamp: number,
      data: string,
    ) {
      this.index = index;
      this.hash = hash;
      this.previousHash = previousHash;
      this.timestamp = timestamp;
      this.data = data;
    }
  }

  // unique identifier of the block
  const calculateHash = (
    index: number,
    previousHash: string,
    timestamp: number,
    data: string,
  ): string =>
    crypto
      .createHash("sha256")
      .update(index + previousHash + timestamp + data)
      .toString();

  // first block in the blockchain
  const genesisBlock: Block = new Block(
    0,
    calculateHash(0, "buy us, fuck you!!", 1234567890, "buy us, fuck you!!!"),
    "buy us, fuck you!!!",
    1234567890,
    "buy us, fuck you!!!",
  );

  // generates next block
  const generateNextBlock = (blockData: string) => {
    const previousBlock: Block = getLatestBlock();
    const nextIndex: number = previousBlock.index + 1;
    const nextTimestamp: number = new Date().getTime() / 1000;
    const nextHash: string = calculateHash(
      nextIndex,
      previousBlock.hash,
      nextTimestamp,
      blockData,
    );
    const newBlock: Block = new Block(
      nextIndex,
      nextHash,
      previousBlock.hash,
      nextTimestamp,
      blockData,
    );
    return newBlock;
  };

  // stores the blockchain in an in-memory js array
  let blockchain: Block[] = [genesisBlock];

  // validates the integrity of blocks
  const isValidNewBlock = (newBlock: Block, previousBlock: Block) => {
    if (previousBlock.index + 1 !== newBlock.index) {
      console.log("invalid index");
      return false;
    } else if (previousBlock.hash !== newBlock.previousHash) {
      console.log("invalid previoushash");
      return false;
    } else if (calculateHashForBlock(newBlock) !== newBlock.hash) {
      console.log(
        typeof newBlock.hash + " " + typeof calculateHashForBlock(newBlock),
      );
      console.log(
        "invalid hash: " +
          calculateHashForBlock(newBlock) +
          " " +
          newBlock.hash,
      );
      return false;
    }
    return true;
  };

  // validates the structure of the block
  const isValidBlockStructure = (block: Block): boolean => {
    return (
      typeof block.index === "number" &&
      typeof block.hash === "string" &&
      typeof block.previousHash === "string" &&
      typeof block.timestamp === "number" &&
      typeof block.data === "string"
    );
  };

  // validates the blockchain
  const isValidChain = (blockchainToValidate: Block[]): boolean => {
    const isValidGenesis = (block: Block): boolean => {
      return JSON.stringify(block) === JSON.stringify(genesisBlock);
    };

    if (!isValidGenesis(blockchainToValidate[0])) {
      return false;
    }

    for (let i = 1; i < blockchainToValidate.length; i++) {
      if (!isValidNewBlock([i], blockchainToValidate[i - 1])) {
        return false;
      }
    }
    return true;
  };

  // choosing the longest chain incase of conflicts
  const replaceChain = (newBlocks: Block[]) => {
    if (isValidChain(newBlocks) && newBlocks.length > blockchain.length) {
      console.log(
        "Received blockchain is valid. Replacing current blockchain with received blockchain",
      );
      blockchain = newBlocks;
      broadcastLatest();
    } else {
      console.log("Received blockchain invalid");
    }
  };
}
