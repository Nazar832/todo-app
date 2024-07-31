import { List } from "../data/models/list";

// PATTERN: Proxy
export default interface ReorderService {
  reorder<T>(items: T[], startIndex: number, endIndex: number): T[];
  reorderCards({
    lists,
    sourceIndex,
    destinationIndex,
    sourceListId,
    destinationListId,
  }:{
    lists: List[];
    sourceIndex: number;
    destinationIndex: number;
    sourceListId: string;
    destinationListId: string;
  }): List[];
}
