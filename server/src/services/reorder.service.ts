import { LogMessageType } from "../common/enums/log-message-type.enum";
import { Card } from "../data/models/card";
import { List } from "../data/models/list";
import ReorderService from "../interfaces/reorder.service.interface";
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import { fileLogSubscriber, logPublisher } from "../logger/logger";
import createLogText from "../helpers/create-log-message";

// PATTERN: Proxy
class RealReorderService implements ReorderService {
  public reorder<T>(items: T[], startIndex: number, endIndex: number): T[] {
    const card = items[startIndex];
    const listWithRemoved = this.remove(items, startIndex);
    const result = this.insert(listWithRemoved, endIndex, card);

    return result;
  }

  public reorderCards({
    lists,
    sourceIndex,
    destinationIndex,
    sourceListId,
    destinationListId,
  }: {
    lists: List[];
    sourceIndex: number;
    destinationIndex: number;
    sourceListId: string;
    destinationListId: string;
  }): List[] {
    const target: Card = lists.find((list) => list.id === sourceListId)
      ?.cards?.[sourceIndex];

    if (!target) {
      return lists;
    }

    const newLists = lists.map((list) => {
      if (list.id === sourceListId) {
        list.setCards(this.remove(list.cards, sourceIndex));
      }

      if (list.id === destinationListId) {
        list.setCards(this.insert(list.cards, destinationIndex, target));
      }

      return list;
    });

    return newLists;
  }

  private remove<T>(items: T[], index: number): T[] {
    return [...items.slice(0, index), ...items.slice(index + 1)];
  }

  private insert<T>(items: T[], index: number, value: T): T[] {
    return [...items.slice(0, index), value, ...items.slice(index)];
  }
}

class ReorderServiceWithLogging implements ReorderService {
  private realReorderService: RealReorderService;

  constructor(realReorderService: RealReorderService) {
    this.realReorderService = realReorderService;
  }

  public reorder<T>(items: T[], startIndex: number, endIndex: number): T[] {
    const log = createLogText(LogMessageType.INFO, 'REORDER SERVICE: reorder method called', {items, startIndex, endIndex});
    this.logParameters(log);
    return this.realReorderService.reorder<T>(items, startIndex, endIndex);
  }

  public reorderCards({
    lists,
    sourceIndex,
    destinationIndex,
    sourceListId,
    destinationListId,
  }: {
    lists: List[];
    sourceIndex: number;
    destinationIndex: number;
    sourceListId: string;
    destinationListId: string;
  }): List[] {
    const parameters = {
      lists,
      sourceIndex,
      destinationIndex,
      sourceListId,
      destinationListId,
    }

    const log = createLogText(LogMessageType.INFO, 'REORDER SERVICE: reorderCards method called', parameters);
    this.logParameters(log);
    return this.realReorderService.reorderCards(parameters);
  }

  private logParameters(log: string): void {
    logPublisher.notify(log, LogMessageType.INFO);
  }
}

export { RealReorderService, ReorderServiceWithLogging };
