import Observer from "./observer.interface";

export default interface Publisher {
  subscribe(observer: Observer): void;

  unsubscribe(observer: Observer): void

  notify(log: string, logType: string): void
}
