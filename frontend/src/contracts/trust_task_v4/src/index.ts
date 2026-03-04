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
    contractId: "CDHIATCAQT5NLHX52FFWDBSK5U3ZYAAML7AINB3VWVRPOQT6O4BJV6RL",
  }
} as const


export interface Task {
  amount: i128;
  description_cid: string;
  employer: string;
  evidence_hash: string;
  status: TaskStatus;
  worker: Option<string>;
}

export enum TaskStatus {
  Open = 0,
  InProgress = 1,
  InReview = 2,
  Completed = 3,
}

export interface Client {
  /**
   * Construct and simulate a get_task transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_task: ({task_id}: {task_id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Option<Task>>>

  /**
   * Construct and simulate a accept_task transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  accept_task: ({task_id, worker}: {task_id: u32, worker: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a create_task transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  create_task: ({employer, description_cid, amount}: {employer: string, description_cid: string, amount: i128}, options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a reject_work transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  reject_work: ({task_id}: {task_id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a submit_work transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  submit_work: ({task_id, evidence_hash}: {task_id: u32, evidence_hash: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_task_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_task_count: (options?: MethodOptions) => Promise<AssembledTransaction<u32>>

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
      new ContractSpec([ "AAAAAQAAAAAAAAAAAAAABFRhc2sAAAAGAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAAAAAAD2Rlc2NyaXB0aW9uX2NpZAAAAAAQAAAAAAAAAAhlbXBsb3llcgAAABMAAAAAAAAADWV2aWRlbmNlX2hhc2gAAAAAAAAQAAAAAAAAAAZzdGF0dXMAAAAAB9AAAAAKVGFza1N0YXR1cwAAAAAAAAAAAAZ3b3JrZXIAAAAAA+gAAAAT",
        "AAAAAwAAAAAAAAAAAAAAClRhc2tTdGF0dXMAAAAAAAQAAAAAAAAABE9wZW4AAAAAAAAAAAAAAApJblByb2dyZXNzAAAAAAABAAAAAAAAAAhJblJldmlldwAAAAIAAAAAAAAACUNvbXBsZXRlZAAAAAAAAAM=",
        "AAAAAAAAAAAAAAAIZ2V0X3Rhc2sAAAABAAAAAAAAAAd0YXNrX2lkAAAAAAQAAAABAAAD6AAAB9AAAAAEVGFzaw==",
        "AAAAAAAAAAAAAAALYWNjZXB0X3Rhc2sAAAAAAgAAAAAAAAAHdGFza19pZAAAAAAEAAAAAAAAAAZ3b3JrZXIAAAAAABMAAAAA",
        "AAAAAAAAAAAAAAALY3JlYXRlX3Rhc2sAAAAAAwAAAAAAAAAIZW1wbG95ZXIAAAATAAAAAAAAAA9kZXNjcmlwdGlvbl9jaWQAAAAAEAAAAAAAAAAGYW1vdW50AAAAAAALAAAAAQAAAAQ=",
        "AAAAAAAAAAAAAAALcmVqZWN0X3dvcmsAAAAAAQAAAAAAAAAHdGFza19pZAAAAAAEAAAAAA==",
        "AAAAAAAAAAAAAAALc3VibWl0X3dvcmsAAAAAAgAAAAAAAAAHdGFza19pZAAAAAAEAAAAAAAAAA1ldmlkZW5jZV9oYXNoAAAAAAAAEAAAAAA=",
        "AAAAAAAAAAAAAAAOZ2V0X3Rhc2tfY291bnQAAAAAAAAAAAABAAAABA==",
        "AAAAAAAAAAAAAAAPYXBwcm92ZV9hbmRfcGF5AAAAAAEAAAAAAAAAB3Rhc2tfaWQAAAAABAAAAAA=" ]),
      options
    )
  }
  public readonly fromJSON = {
    get_task: this.txFromJSON<Option<Task>>,
        accept_task: this.txFromJSON<null>,
        create_task: this.txFromJSON<u32>,
        reject_work: this.txFromJSON<null>,
        submit_work: this.txFromJSON<null>,
        get_task_count: this.txFromJSON<u32>,
        approve_and_pay: this.txFromJSON<null>
  }
}