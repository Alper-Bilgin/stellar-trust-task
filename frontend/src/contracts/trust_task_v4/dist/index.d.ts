import { Buffer } from "buffer";
import { AssembledTransaction, Client as ContractClient, ClientOptions as ContractClientOptions, MethodOptions } from "@stellar/stellar-sdk/contract";
import type { u32, i128, Option } from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";
export declare const networks: {
    readonly testnet: {
        readonly networkPassphrase: "Test SDF Network ; September 2015";
        readonly contractId: "CDHIATCAQT5NLHX52FFWDBSK5U3ZYAAML7AINB3VWVRPOQT6O4BJV6RL";
    };
};
export interface Task {
    amount: i128;
    description_cid: string;
    employer: string;
    evidence_hash: string;
    status: TaskStatus;
    worker: Option<string>;
}
export declare enum TaskStatus {
    Open = 0,
    InProgress = 1,
    InReview = 2,
    Completed = 3
}
export interface Client {
    /**
     * Construct and simulate a get_task transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_task: ({ task_id }: {
        task_id: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Option<Task>>>;
    /**
     * Construct and simulate a accept_task transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    accept_task: ({ task_id, worker }: {
        task_id: u32;
        worker: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a create_task transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    create_task: ({ employer, description_cid, amount }: {
        employer: string;
        description_cid: string;
        amount: i128;
    }, options?: MethodOptions) => Promise<AssembledTransaction<u32>>;
    /**
     * Construct and simulate a reject_work transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    reject_work: ({ task_id }: {
        task_id: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a submit_work transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    submit_work: ({ task_id, evidence_hash }: {
        task_id: u32;
        evidence_hash: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a get_task_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_task_count: (options?: MethodOptions) => Promise<AssembledTransaction<u32>>;
    /**
     * Construct and simulate a approve_and_pay transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    approve_and_pay: ({ task_id }: {
        task_id: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
}
export declare class Client extends ContractClient {
    readonly options: ContractClientOptions;
    static deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions & Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
    }): Promise<AssembledTransaction<T>>;
    constructor(options: ContractClientOptions);
    readonly fromJSON: {
        get_task: (json: string) => AssembledTransaction<Option<Task>>;
        accept_task: (json: string) => AssembledTransaction<null>;
        create_task: (json: string) => AssembledTransaction<number>;
        reject_work: (json: string) => AssembledTransaction<null>;
        submit_work: (json: string) => AssembledTransaction<null>;
        get_task_count: (json: string) => AssembledTransaction<number>;
        approve_and_pay: (json: string) => AssembledTransaction<null>;
    };
}
