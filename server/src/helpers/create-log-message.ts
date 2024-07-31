import { randomUUID } from "crypto";
import { List } from "../data/models/list";

export default function createLogText<T>(logType: string, message: string, parameters: {items: T[], startIndex: number, endIndex: number} | {
    lists: List[];
    sourceIndex: number;
    destinationIndex: number;
    sourceListId: string;
    destinationListId: string;
  } | undefined): string {
    const logText: {
        logID: string;
        timestamp: string;
        type: string;
        message: string;
        parameters?: typeof parameters;
        id?: string;
      } = {
        logID: randomUUID(),
        timestamp: new Date().toISOString(),
        type: logType,
        message: message,
      };
    
      if (parameters !== undefined) {
        logText.parameters = parameters;
      }

    return JSON.stringify(logText, null, 2);
  }