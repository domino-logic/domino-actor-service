'use strict'


class Response {
  constructor(messenger, msg) {
    this.messenger = messenger
    this.queue = msg.properties.replyTo
    this.corr = msg.properties.corr
  }

  send (msg) {
    if(this.queue){
      this.messenger.publish(this.queue, msg)
    }
  }

  ok (payload) {
    this.send({status: 'ok', correlationId: this.corr, content: payload})
  }

  error (payload) {
    this.send({status: 'ok', correlationId: this.corr, content: payload})
  }
}

module.exports = Response