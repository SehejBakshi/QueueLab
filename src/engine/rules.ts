export type RuleExplanation = {
    messageId: string;
    type:
        | "ENQUEUE"
        | "DELIVER"
        | "PROCESS_SUCCESS"
        | "PROCESS_FAIL"
        | "VISIBILITY_TIMEOUT"
        | "DLQ"
        | "CONFIG";
    text: string;
};