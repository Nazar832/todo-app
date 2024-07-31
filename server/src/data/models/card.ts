import { randomUUID } from 'crypto';

// PATTERN: Prototype
class Card {
  public id: string;

  public name: string;

  public description: string;

  public createdAt: Date;

  public constructor(name: string, description: string) {
    this.name = name;
    this.description = description;
    this.createdAt = new Date();
    this.id = randomUUID();
  }

  public clone(): Card {
    const clonedCard = new Card(this.name, this.description);
    return clonedCard;
  }
}

export { Card };
