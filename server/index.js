const keys = require('./keys')

//Express App Setup
const express =  require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()
app.use(cors())/*cross origin resource sharing, allows to make request from one domain that the react application is going to running on to a completely
different domain or different port(in this case) that the api is hosted on*/
app.use(bodyParser.json()) /*parse incoming request from the react application and turn the body of
the post request into a json value that our express api can then ver easily work with */


//Postgress Client setup - postgress is similar to mysql
const {Pool} = require('pg')
const pgClient =  new Pool ({
    user:keys.pgUser,
    host:keys.pgHost,
    database:keys.pgDatabase,
    password:keys.pgPassword,
    port: keys.pgPort
})
pgClient.on('error',()=>{
    console.log('Lost PG Connection')
})

pgClient
    .query('CREATE TABLE IF NOT EXISTS values (number INT)')/*table to store 
    indices submitted to the application */
    .catch(err=> console.log(err))


// Redis Client Setup
const redis = require('redis')
const redisClient = redis.createClient({
    host: keys.redisHost,
    port:keys.redisPort,
    retry_strategy: () => 1000 //if we ever lose connection to then try to connect
    //again every one second.
     //separation is with "_" instead camel notation
})

const redisPublisher = redisClient.duplicate() /*
if we ever have a client that is listening or publishing information 
on redis so we have to make duplicate connection because when a connection
is turn into a connection that is going to listen or 
subcribe or plublish information it can not be used for other purposes
so that is why we duplicate the connection  */

// Express route handlers

app.get('/',(req,res)=>{
    res.send('Hi')
})


app.get('/values/all',async(req,res)=>{
    const values =  await pgClient.query('SELECT * from values') /**making an
    asynchrous request to postgress in order to find all the values(indices) that
    has been submitted there */
    res.send(values.rows)/**rows make sure that we only send the values
    and no other relative information */
})

app.get('/values/current',async(req,res)=>{
    redisClient.hgetall('values',(err,values)=>{ /**reaching into redis to
        get all the different values(indices) and the calculated values that we have ever 
        been submitted to our backend */
        /**hgetall: look for a hash value inside the redis instance and just get all the information from it 
         * the hash that we are gonna look at is called 'values'
         */
        res.send(values) /** */
    })
})

app.post('/values',async(req,res)=>{//receiving information from react
    const index = req.body.index

    if(parseInt(index)>40){
        return res.status(422).send('Index too high')
    }

    redisClient.hset('values',index,'Nothing yet!') /*essentially the workers
    is going to replace the nothing yet with the calculated value */
    redisPublisher.publish('insert',index) /**this is going to publish the new
    indice in order to wake up workers so it can calculate the new fibonnaci
    value and then save that into redis. */
    pgClient.query('INSERT INTO values(number) VALUES($1)',[index])
    /**inserting value for the column number */

    res.send({working:true})
})

app.listen(5000,err=>{
    console.log('listening')
})