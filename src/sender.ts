export default class Sender {
  private packageQueue: any;
  private ready: boolean;

  constructor() {
    this.packageQueue = [];
    this.ready = true;
  }

  /**
   * @description
   *     Adds a new message to the message queue to be sent.
   * 
   * @param message any
   * 
   * @return void
   */
  public add(pkg: any) {
    this.packageQueue.push(pkg);
    this.send();
  }

  /**
   * @description
   *     Invokes event callbacks.
   * 
   * @param msgObj any
   * 
   * @return void
   */
  public async invokeCallback(msgObj: any): Promise<void> {
    const args = Array.prototype.slice.call(arguments);
    for await (let cb of msgObj.callbacks) {
      cb.apply(this, args);
    }
  }

  /**
   * @description
   *     Encodes messages and sends event to all clients listening
   *     to the event except for the sender.
   */
  private async send() {
    if (this.ready && this.packageQueue.length) {
      this.ready = false;
      const pkg = this.packageQueue.shift();
      const {
        channelName,
        message,
        from,
        listeners,
      } = pkg;

      const encodedMessage = new TextEncoder().encode(
        JSON.stringify({ [channelName]: message }),
      );
      for await (let listener of listeners) {
        const [clientId, socketConn] = listener;
        if (clientId !== from) {
          try {
            await socketConn.send(encodedMessage);
          } catch (err) {
            console.log(`Unable to send to client: ${clientId}`);
          }
        }
      }
      this.ready = true;
      this.send();
    }
  }
}
