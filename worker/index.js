const keys = require('./keys')
const redis = require('redis')

const redisClient = redis.createClient({
    host:keys.redisHost,
    port:keys.redisPort,
    retry_strategy: ()=> 1000 //1000 ms
})

const sub = redisClient.duplicate() //sub stands for subscription
//it is gonna watch redis and get a message anytime
//a new vale shows up

const fib = index => {//fobonacci recursive solution
    if(index<2) return 1;
    return fib(index-1) + fib(index-2)
}

sub.on('message',(channel,message)=>{
    redisClient.hset('values',message,fib(parseInt(message)))
    //once calculated a new fibonacci value and then insert that 
    //into a hash of values or hash CALLED values
})

sub.subscribe('insert') //insert the new value into redis.