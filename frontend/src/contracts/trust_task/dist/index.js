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
        contractId: "CCPZ253M5RBP2YNEECC6EXIIAKDSTKY4UKO3ZDAUUGFT2DN75UNLR7JZ",
    }
};
export var TaskStatus;
(function (TaskStatus) {
    TaskStatus[TaskStatus["Open"] = 0] = "Open";
    TaskStatus[TaskStatus["InReview"] = 1] = "InReview";
    TaskStatus[TaskStatus["Completed"] = 2] = "Completed";
})(TaskStatus || (TaskStatus = {}));
export class Client extends ContractClient {
    options;
    static async deploy(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy(null, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAAAQAAAAAAAAAAAAAABFRhc2sAAAAFAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAAAAAACGVtcGxveWVyAAAAEwAAAAAAAAANZXZpZGVuY2VfaGFzaAAAAAAAABAAAAAAAAAABnN0YXR1cwAAAAAH0AAAAApUYXNrU3RhdHVzAAAAAAAAAAAABndvcmtlcgAAAAAAEw==",
            "AAAAAwAAAAAAAAAAAAAAClRhc2tTdGF0dXMAAAAAAAMAAAAAAAAABE9wZW4AAAAAAAAAAAAAAAhJblJldmlldwAAAAEAAAAAAAAACUNvbXBsZXRlZAAAAAAAAAI=",
            "AAAAAAAAAAAAAAALY3JlYXRlX3Rhc2sAAAAAAwAAAAAAAAAIZW1wbG95ZXIAAAATAAAAAAAAAAZ3b3JrZXIAAAAAABMAAAAAAAAABmFtb3VudAAAAAAACwAAAAEAAAAE",
            "AAAAAAAAAAAAAAALc3VibWl0X3dvcmsAAAAAAgAAAAAAAAAHdGFza19pZAAAAAAEAAAAAAAAAA1ldmlkZW5jZV9oYXNoAAAAAAAAEAAAAAA=",
            "AAAAAAAAAAAAAAAPYXBwcm92ZV9hbmRfcGF5AAAAAAEAAAAAAAAAB3Rhc2tfaWQAAAAABAAAAAA="]), options);
        this.options = options;
    }
    fromJSON = {
        create_task: (this.txFromJSON),
        submit_work: (this.txFromJSON),
        approve_and_pay: (this.txFromJSON)
    };
}
