import type {
  DraggableProvided,
  DraggableStateSnapshot,
} from "@hello-pangea/dnd";
import { Draggable } from "@hello-pangea/dnd";

import { type Card } from "../../common/types/types";
import { CardsList } from "../card-list/card-list";
import { DeleteButton } from "../primitives/delete-button";
import { Splitter } from "../primitives/styled/splitter";
import { Title } from "../primitives/title";
import { Footer } from "./components/footer";
import { Container } from "./styled/container";
import { Header } from "./styled/header";
import { ListEvent } from "../../common/enums/list-event.enum";
import { CardEvent } from "../../common/enums/card-event.enum";
import { useContext } from "react";
import { SocketContext } from "../../context/socket";

type Props = {
  listId: string;
  listName: string;
  cards: Card[];
  index: number;
};

export const Column = ({ listId, listName, cards, index }: Props) => {
  const socket = useContext(SocketContext);
  
  const handleRenameList = (newName: string) => {
    if (newName !== '') {
      socket.emit(ListEvent.RENAME, listId, newName);
    }
  }

  const handleDeleteList = () => {
    socket.emit(ListEvent.DELETE, listId);
  }

  const handleCreateCard = (name: string) => {
    if (name !== '') {
      socket.emit(CardEvent.CREATE, listId, name);
    }
  }

  return (
    <Draggable draggableId={listId} index={index}>
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
        <Container
          className="column-container"
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <Header
            className="column-header"
            isDragging={snapshot.isDragging}
            {...provided.dragHandleProps}
          >
            <Title
              aria-label={listName}
              title={listName}
              onChange={handleRenameList}
              fontSize="large"
              width={200}
              isBold
            />
            <Splitter />
            <DeleteButton color="#FFF0" onClick={handleDeleteList} />
          </Header>
          <CardsList listId={listId} listType="CARD" cards={cards} />
          <Footer onCreateCard={handleCreateCard} />
        </Container>
      )}
    </Draggable>
  );
};
