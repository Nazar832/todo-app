import type { Socket } from "socket.io";

import { CardEvent } from "../common/enums/enums";
import { Card } from "../data/models/card";
import { SocketHandler } from "./socket.handler";
import { logPublisher } from "../logger/logger";
import createLogText from "../helpers/create-log-message";
import { LogMessageType } from "../common/enums/log-message-type.enum";

class CardHandler extends SocketHandler {
  public handleConnection(socket: Socket): void {
    socket.on(CardEvent.CREATE, this.createCard.bind(this));
    socket.on(CardEvent.REORDER, this.reorderCards.bind(this));
    socket.on(CardEvent.DELETE, this.deleteCard.bind(this));
    socket.on(CardEvent.RENAME, this.renameCard.bind(this));
    socket.on(CardEvent.CHANGE_DESCRIPTION, this.changeCardDescription.bind(this));
    socket.on(CardEvent.DUPLICATE, this.duplicateCard.bind(this));
  }

  public createCard(listId: string, cardName: string): void {
    let logText;
    try {
      const newCard = new Card(cardName, "");
      const lists = this.db.getData();

      const updatedLists = lists.map((list) =>
        list.id === listId ? list.setCards(list.cards.concat(newCard)) : list
      );

      this.db.setData(updatedLists);
      this.updateLists();

      logText = createLogText(LogMessageType.INFO, `card with id = ${newCard.id} created in list with id = ${listId}`, undefined)
      logPublisher.notify(logText, LogMessageType.INFO);
    } catch (error) {
      logText = createLogText(LogMessageType.ERROR, `ERROR when creating a card "${cardName}" in list with id = ${listId}: ${error.message}`, undefined);
      logPublisher.notify(logText, LogMessageType.ERROR);
    }
  }

  private reorderCards({
    sourceIndex,
    destinationIndex,
    sourceListId,
    destinationListId,
  }: {
    sourceIndex: number;
    destinationIndex: number;
    sourceListId: string;
    destinationListId: string;
  }): void {
    let logText = createLogText(LogMessageType.INFO, `cards reordered in list with id = ${sourceListId}${sourceListId === destinationListId ?
       ' and ' + destinationListId : ''}`, undefined);
    try {
      const lists = this.db.getData();
    const reordered = this.reorderService.reorderCards({
      lists,
      sourceIndex,
      destinationIndex,
      sourceListId,
      destinationListId,
    });
    this.db.setData(reordered);
    this.updateLists();

    logPublisher.notify(logText, LogMessageType.INFO);
    } catch (error) {
      logText = createLogText(LogMessageType.ERROR, `ERROR when reordering cards in list with id = ${sourceListId}${sourceListId !== destinationListId ?
        ' and ' + destinationListId : ''}`, undefined);
        logPublisher.notify(logText, LogMessageType.ERROR);
    }
  }

  public deleteCard(cardId: string): void {
    let logText = createLogText(LogMessageType.INFO, `card with id = ${cardId} was deleted`, undefined);
    try {
      const lists = this.db.getData();

    const updatedLists = lists.map((list) =>
      list.cards.find(card => card.id === cardId) ? list.setCards(list.cards.filter(card => card.id !== cardId)) : list
    );

    this.db.setData(updatedLists);
    this.updateLists();

    logPublisher.notify(logText, LogMessageType.INFO);
    } catch (error) {
      logText = createLogText(LogMessageType.ERROR, `ERROR when deleting a card with id = ${cardId}`, undefined);
      logPublisher.notify(logText, LogMessageType.ERROR);
    }
  }

  private updateCardProperty(cardId: string, property: 'name' | 'description', newValue: string): void {
    const lists = this.db.getData();

    for (let i = 0; i < lists.length; i++) {
        const card = lists[i].cards.find(card => card.id === cardId);
        if (card) {
          card[property] = newValue;
        }
    }

    this.updateLists();
  }

  public renameCard(cardId: string, newName: string): void {
    let logText = createLogText(LogMessageType.INFO, `card with id = ${cardId} was renamed to ${newName}`, undefined);
    try {
      this.updateCardProperty(cardId, 'name', newName);
      logPublisher.notify(logText, LogMessageType.INFO);
    } catch (error) {
      logText = createLogText(LogMessageType.ERROR, `ERROR when renaming a card with id = ${cardId} to ${newName}`, undefined);
      logPublisher.notify(logText, LogMessageType.ERROR);
    }
  }

  public changeCardDescription(cardId: string, newDescription: string): void {
    let logText = createLogText(LogMessageType.INFO, `card with id = ${cardId} changed it's description to ${newDescription}`, undefined);
    try {
      this.updateCardProperty(cardId, 'description', newDescription);
      logPublisher.notify(logText, LogMessageType.INFO);
    } catch (error) {
      logText = createLogText(LogMessageType.ERROR, `ERROR when changing description of a card with id = ${cardId} to ${newDescription}`, undefined);
      logPublisher.notify(logText, LogMessageType.ERROR);
    }
  }

  public duplicateCard(card): void {
    let logText = createLogText(LogMessageType.INFO, `card with id = ${card.id} was duplicated`, undefined);
    try {
      const clonedCard = new Card(card.name, card.description).clone();

    const lists = this.db.getData();
    const listWithTheCard = lists.find(list => list.cards.some(card_ => card_.id === card.id));
    listWithTheCard.setCards(listWithTheCard.cards.concat(clonedCard));

    this.updateLists();

    logPublisher.notify(logText, LogMessageType.INFO);
    } catch (error) {
      logText = createLogText(LogMessageType.ERROR, `ERROR when duplicating a card with id = ${card.id}`, undefined);
      logPublisher.notify(logText, LogMessageType.ERROR);
    }
  }
}

export { CardHandler };
