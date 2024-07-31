import type { DraggableLocation } from "@hello-pangea/dnd";

import { type Card, type List } from "../common/types/types";

const listIsTheSource = (list: List, source: DraggableLocation) => list.id === source.droppableId;
const listIsTheDestination = (list: List, destination: DraggableLocation) => list.id === destination.droppableId;

export const reorderService = {
  reorderItems<T extends Card | List>(items: T[], startIndex: number, endIndex: number): T[] {
    const itemToRemove = items[startIndex];
    const withItemRemoved = this.removeItemFromArray<T>(items, startIndex);
    const reorderedItems: T[] = this.addItemToArray<T>(withItemRemoved, endIndex, itemToRemove);

    return reorderedItems;
  },

  reorderCards(
    lists: List[],
    source: DraggableLocation,
    destination: DraggableLocation
  ): List[] {
    const current: Card[] =
      lists.find(list => listIsTheSource(list, source))?.cards || [];
    const next: Card[] =
      lists.find((list) => listIsTheDestination(list, destination))?.cards || [];
    const target: Card = current[source.index];

    const isMovingInSameList = source.droppableId === destination.droppableId;

    if (isMovingInSameList) {
      const reorderedCards: Card[] = this.reorderItems<Card>(current, source.index, destination.index);

      return lists.map((list) =>
        listIsTheSource(list, source) ? { ...list, cards: reorderedCards } : list
      );
    }

    const newLists = lists.map((list) => {
      return {
        ...list,
        cards: listIsTheSource(list, source) ? this.removeItemFromArray<Card>(current, source.index) : (listIsTheDestination(list, destination) ? 
          this.addItemToArray<Card>(next, destination.index, target) : list.cards)
      };
    });

    return newLists;
  },

  removeItemFromArray<T extends Card | List>(items: T[], index: number): T[] {
    return items.slice(0, index).concat(items.slice(index + 1));
  },

  addItemToArray<T extends Card | List>(items: T[], index: number, item: T): T[] {
    return items.slice(0, index).concat(item).concat(items.slice(index));
  },
};
