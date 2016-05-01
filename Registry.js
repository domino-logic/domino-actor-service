const redisClient = require('redis').createClient()
const Messenger = require('Messenger')


class Registry {
  constructor (options) {
    this.options = options || {};
    this.action_queue = this.options.action_queue || 'domino_action'
    this.dispatch_queue = this.options.dispatch_queue || 'domino_dispatch'
    this.messenger = new Messenger(options);
  }
  registerActor (queue, callback) {
    this.messenger.consume(queue, callback);
  }

  registerWhatcher (queue, watcherQueue, callback){
    const aggregatedWatcherQueue = `when:${queue}`

    redisClient.sadd(aggregatedWatcherQueue, watcherQueue);

    this.messenger.consume(
      queue,
      this.triggerWatchers.bind(this, aggregatedWatcherQueue)
    );
  }

  triggerWatchers (aggregatedWatcherQueue, payload) {
    function trigger(watcherQueue) {
      this.messenger.publish(watcherQueue, payload)
    }

    redisClient.smembers(
      aggregatedWatcherQueue,
      (watcherQueues) => watcherQueues.forEach(trigger)
    )
  }
}

module.exports = Registry;