import { Buffer } from "buffer";
import { Client as ContractClient, Spec as ContractSpec, } from "@stellar/stellar-sdk/contract";
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
};
export var TaskStatus;
(function (TaskStatus) {
    TaskStatus[TaskStatus["Open"] = 0] = "Open";
    TaskStatus[TaskStatus["InProgress"] = 1] = "InProgress";
    TaskStatus[TaskStatus["InReview"] = 2] = "InReview";
    TaskStatus[TaskStatus["Completed"] = 3] = "Completed";
})(TaskStatus || (TaskStatus = {}));
export class Client extends ContractClient {
    options;
    static async deploy(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy(null, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAAAQAAAAAAAAAAAAAABFRhc2sAAAAGAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAAAAAAD2Rlc2NyaXB0aW9uX2NpZAAAAAAQAAAAAAAAAAhlbXBsb3llcgAAABMAAAAAAAAADWV2aWRlbmNlX2hhc2gAAAAAAAAQAAAAAAAAAAZzdGF0dXMAAAAAB9AAAAAKVGFza1N0YXR1cwAAAAAAAAAAAAZ3b3JrZXIAAAAAA+gAAAAT",
            "AAAAAwAAAAAAAAAAAAAAClRhc2tTdGF0dXMAAAAAAAQAAAAAAAAABE9wZW4AAAAAAAAAAAAAAApJblByb2dyZXNzAAAAAAABAAAAAAAAAAhJblJldmlldwAAAAIAAAAAAAAACUNvbXBsZXRlZAAAAAAAAAM=",
            "AAAAAAAAAAAAAAAIZ2V0X3Rhc2sAAAABAAAAAAAAAAd0YXNrX2lkAAAAAAQAAAABAAAD6AAAB9AAAAAEVGFzaw==",
            "AAAAAAAAAAAAAAALYWNjZXB0X3Rhc2sAAAAAAgAAAAAAAAAHdGFza19pZAAAAAAEAAAAAAAAAAZ3b3JrZXIAAAAAABMAAAAA",
            "AAAAAAAAAAAAAAALY3JlYXRlX3Rhc2sAAAAAAwAAAAAAAAAIZW1wbG95ZXIAAAATAAAAAAAAAA9kZXNjcmlwdGlvbl9jaWQAAAAAEAAAAAAAAAAGYW1vdW50AAAAAAALAAAAAQAAAAQ=",
            "AAAAAAAAAAAAAAALcmVqZWN0X3dvcmsAAAAAAQAAAAAAAAAHdGFza19pZAAAAAAEAAAAAA==",
            "AAAAAAAAAAAAAAALc3VibWl0X3dvcmsAAAAAAgAAAAAAAAAHdGFza19pZAAAAAAEAAAAAAAAAA1ldmlkZW5jZV9oYXNoAAAAAAAAEAAAAAA=",
            "AAAAAAAAAAAAAAAOZ2V0X3Rhc2tfY291bnQAAAAAAAAAAAABAAAABA==",
            "AAAAAAAAAAAAAAAPYXBwcm92ZV9hbmRfcGF5AAAAAAEAAAAAAAAAB3Rhc2tfaWQAAAAABAAAAAA="]), options);
        this.options = options;
    }
    fromJSON = {
        get_task: (this.txFromJSON),
        accept_task: (this.txFromJSON),
        create_task: (this.txFromJSON),
        reject_work: (this.txFromJSON),
        submit_work: (this.txFromJSON),
        get_task_count: (this.txFromJSON),
        approve_and_pay: (this.txFromJSON)
    };
}
