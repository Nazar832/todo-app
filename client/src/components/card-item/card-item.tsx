import type { DraggableProvided } from "@hello-pangea/dnd";

import { type Card } from "../../common/types/types";
import { CopyButton } from "../primitives/copy-button";
import { DeleteButton } from "../primitives/delete-button";
import { Splitter } from "../primitives/styled/splitter";
import { Text } from "../primitives/text";
import { Title } from "../primitives/title";
import { Container } from "./styled/container";
import { Content } from "./styled/content";
import { Footer } from "./styled/footer";
import { CardEvent } from "../../common/enums/card-event.enum";
import { useContext } from "react";
import { SocketContext } from "../../context/socket";

type Props = {
  card: Card;
  isDragging: boolean;
  provided: DraggableProvided;
};

export const CardItem = ({ card, isDragging, provided }: Props) => {
  const socket = useContext(SocketContext);
  
  const handleRenameCard = (newName: string) => {
    if (newName !== '') {
      socket.emit(CardEvent.RENAME, card.id, newName);
    }
  }

  const handleChangeCardDescription = (newDescription: string) => {   
    socket.emit(CardEvent.CHANGE_DESCRIPTION, card.id, newDescription);
  }

  const handleDeleteCard = () => {
    socket.emit(CardEvent.DELETE, card.id);
  }

  const handleCopyCard = () => {
    socket.emit(CardEvent.DUPLICATE, card);
  }

  return (
    <Container
      className="card-container"
      isDragging={isDragging}
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      data-is-dragging={isDragging}
      data-testid={card.id}
      aria-label={card.name}
    >
      <Content>
        <Title onChange={handleRenameCard} title={card.name} fontSize="large" isBold />
        <Text text={card.description} onChange={handleChangeCardDescription} />
        <Footer>
          <DeleteButton onClick={handleDeleteCard} />
          <Splitter />
          <CopyButton onClick={handleCopyCard} />
        </Footer>
      </Content>
    </Container>
  );
};
