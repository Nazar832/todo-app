export default interface Observer {
  update(log: string, logType: string): void;
}
