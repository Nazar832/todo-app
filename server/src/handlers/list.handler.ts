import type { Socket } from "socket.io";

import { ListEvent } from "../common/enums/enums";
import { List } from "../data/models/list";
import { SocketHandler } from "./socket.handler";
import createLogText from "../helpers/create-log-message";
import { LogMessageType } from "../common/enums/log-message-type.enum";
import { logPublisher } from "../logger/logger";

class ListHandler extends SocketHandler {
  public handleConnection(socket: Socket): void {
    socket.on(ListEvent.CREATE, this.createList.bind(this));
    socket.on(ListEvent.GET, this.getLists.bind(this));
    socket.on(ListEvent.REORDER, this.reorderLists.bind(this));
    socket.on(ListEvent.DELETE, this.deleteList.bind(this));
    socket.on(ListEvent.RENAME, this.renameList.bind(this));
  }

  private getLists(callback: (cards: List[]) => void): void {
    callback(this.db.getData());
  }

  private reorderLists(sourceIndex: number, destinationIndex: number): void {
    let logText = createLogText(LogMessageType.INFO, `lists reordered: list moved from index ${sourceIndex} to index ${destinationIndex}`, undefined);
    try {
      const lists = this.db.getData();
    const reorderedLists = this.reorderService.reorder(
      lists,
      sourceIndex,
      destinationIndex
    );
    this.db.setData(reorderedLists);
    this.updateLists();

    logPublisher.notify(logText, LogMessageType.INFO);
    } catch (error) {
      logText = createLogText(LogMessageType.ERROR, `ERROR when reordering lists: moving a list from index ${sourceIndex} to index ${destinationIndex}`, undefined);
      logPublisher.notify(logText, LogMessageType.ERROR);
    }
  }

  private createList(name: string): void {
    let logText;
    try {
      const lists = this.db.getData();
    const newList = new List(name);
    this.db.setData(lists.concat(newList));
    this.updateLists();

    logText = createLogText(LogMessageType.INFO, `new list created with id = ${newList.id}`, undefined);
    logPublisher.notify(logText, LogMessageType.INFO);
    } catch (error) {
      logText = createLogText(LogMessageType.ERROR, `ERROR when creating a list`, undefined);
    logPublisher.notify(logText, LogMessageType.ERROR);
    }
  }

  private deleteList(id: string): void {
    let logText = createLogText(LogMessageType.INFO, `list with id = ${id} was deleted`, undefined);
    try {
      const lists = this.db.getData();
    const withListRemoved = lists.filter(list => list.id !== id);
    this.db.setData(withListRemoved);
    this.updateLists();

    logPublisher.notify(logText, LogMessageType.INFO);
    } catch (error) {
      logText = createLogText(LogMessageType.ERROR, `ERROR when deleting a list with id = ${id}`, undefined);
      logPublisher.notify(logText, LogMessageType.ERROR);
    }
    
  }

  private renameList(id: string, newName: string): void {
    let logText = createLogText(LogMessageType.INFO, `list with id = ${id} was renamed to ${newName}`, undefined);
    try {
      const list = this.db.getData().find(list => list.id === id);
    list.name = newName;
    this.updateLists();

    logPublisher.notify(logText, LogMessageType.INFO);
    } catch (error) {
      logText = createLogText(LogMessageType.ERROR, `ERROR when renaming a list with id = ${id} to ${newName}`, undefined);
      logPublisher.notify(logText, LogMessageType.ERROR);
    }
  }
}

export { ListHandler };
