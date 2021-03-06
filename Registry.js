'use strict'


const redisClient = require('redis').createClient()
const Response = require('./Response')

class Registry {
  constructor (options) {
    this.messenger = options.messenger
    this.expiration = options.expiration || 60 * 5 // default 5 minutes
  }


  registerActor (queue, callback) {
    this.messenger.consume(queue, (msg) => {
      callback(msg, new Response(this.messenger, msg));
    })
    console.log(`Registered actor on ${queue}`)
  }

  _now () {
    return parseInt(new Date().getTime() / 1000, 10)
  }

  registerWhatcher (queue, watcherQueue, callback){
    const aggregatedWatcherQueue = `when:${queue}`

    const addToRedisQueue = () => {
      redisClient.zadd(
        aggregatedWatcherQueue,
        this._now(),
        watcherQueue
      )
    }

    addToRedisQueue()
    setInterval(addToRedisQueue, this.expiration * 1000 / 2)

    this.messenger.consume(
      watcherQueue,
      (body) => callback(body, this.messenger.broadcast.bind(this.messenger))
    )

    this.messenger.consume(
      queue,
      this.triggerWatchers.bind(this, aggregatedWatcherQueue)
    )

    console.log(`Registered watcher on ${queue}`)
  }

  hasExpired (timestamp) {
    return timestamp < this._now() - this.expiration
  }

  triggerWatchers (aggregatedWatcherQueue, payload) {
    function trigger(err, watcherQueues) {
      var counter = 0

      for(let i = 0 ; i < watcherQueues.length ; i = i + 2){
        let watcherQueue = watcherQueues[i]
        let timestamp = watcherQueues[i + 1]

        if(this.hasExpired(timestamp)){
          console.log(`Deregister watcher ${watcherQueue} from ${aggregatedWatcherQueue}`)
          redisClient.zrem(aggregatedWatcherQueue, watcherQueue)
        }else{
          this.messenger.publish(watcherQueue, payload.content)
        }
      }
    }

    redisClient.zrange(
      aggregatedWatcherQueue, 0, -1, 'WITHSCORES',
      trigger.bind(this)
    )
  }
}

module.exports = Registry