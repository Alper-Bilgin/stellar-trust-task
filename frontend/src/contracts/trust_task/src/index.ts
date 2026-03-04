import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CCPZ253M5RBP2YNEECC6EXIIAKDSTKY4UKO3ZDAUUGFT2DN75UNLR7JZ",
  }
} as const


export interface Task {
  amount: i128;
  employer: string;
  evidence_hash: string;
  status: TaskStatus;
  worker: string;
}

export enum TaskStatus {
  Open = 0,
  InReview = 1,
  Completed = 2,
}

export interface Client {
  /**
   * Construct and simulate a create_task transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  create_task: ({employer, worker, amount}: {employer: string, worker: string, amount: i128}, options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a submit_work transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  submit_work: ({task_id, evidence_hash}: {task_id: u32, evidence_hash: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a approve_and_pay transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  approve_and_pay: ({task_id}: {task_id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAQAAAAAAAAAAAAAABFRhc2sAAAAFAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAAAAAACGVtcGxveWVyAAAAEwAAAAAAAAANZXZpZGVuY2VfaGFzaAAAAAAAABAAAAAAAAAABnN0YXR1cwAAAAAH0AAAAApUYXNrU3RhdHVzAAAAAAAAAAAABndvcmtlcgAAAAAAEw==",
        "AAAAAwAAAAAAAAAAAAAAClRhc2tTdGF0dXMAAAAAAAMAAAAAAAAABE9wZW4AAAAAAAAAAAAAAAhJblJldmlldwAAAAEAAAAAAAAACUNvbXBsZXRlZAAAAAAAAAI=",
        "AAAAAAAAAAAAAAALY3JlYXRlX3Rhc2sAAAAAAwAAAAAAAAAIZW1wbG95ZXIAAAATAAAAAAAAAAZ3b3JrZXIAAAAAABMAAAAAAAAABmFtb3VudAAAAAAACwAAAAEAAAAE",
        "AAAAAAAAAAAAAAALc3VibWl0X3dvcmsAAAAAAgAAAAAAAAAHdGFza19pZAAAAAAEAAAAAAAAAA1ldmlkZW5jZV9oYXNoAAAAAAAAEAAAAAA=",
        "AAAAAAAAAAAAAAAPYXBwcm92ZV9hbmRfcGF5AAAAAAEAAAAAAAAAB3Rhc2tfaWQAAAAABAAAAAA=" ]),
      options
    )
  }
  public readonly fromJSON = {
    create_task: this.txFromJSON<u32>,
        submit_work: this.txFromJSON<null>,
        approve_and_pay: this.txFromJSON<null>
  }
}