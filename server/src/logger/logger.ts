import * as fs from 'fs';
import Publisher from '../interfaces/logging/publisher.interface';
import Observer from '../interfaces/logging/observer.interface';
import { LogMessageType } from '../common/enums/log-message-type.enum';

// PATTERN: Observer
class LogPublisher implements Publisher{
    private observers: Observer[] = [];
  
    public subscribe(observer: Observer): void {
      const exists = this.observers.includes(observer);
        if (!exists) {
            this.observers.push(observer);
        }
    }
  
    public unsubscribe(observer: Observer): void {
      this.observers = this.observers.filter(observer_ => observer_ !== observer);
    }
  
    public notify(log: string, logType: string): void {
      this.observers.forEach(observer => observer.update(log, logType));
    }
}
  
class FileLogSubscriber implements Observer {
    private readonly filePath: string;

    constructor(filePath: string) {
        this.filePath = filePath;
    }

    public update(log: string, logType: string): void {
        fs.appendFile(this.filePath, `${log}\n`, (err) => {
            if (err) {
              console.error(`ERROR logging to file: ${err.message}`);
            }
        });
    }
}
  
class ConsoleErrorLogSubscriber implements Observer {
    public update(log: string, logType: string): void {
      if (logType === LogMessageType.ERROR) {
        console.error(log);
      }
    }
}

const logPublisher = new LogPublisher();

const fileLogSubscriber = new FileLogSubscriber('logs.log');
const consoleErrorLogSubscriber = new ConsoleErrorLogSubscriber();

logPublisher.subscribe(fileLogSubscriber);
logPublisher.subscribe(consoleErrorLogSubscriber);

export {fileLogSubscriber, logPublisher};