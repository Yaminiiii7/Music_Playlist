import express from 'express';
import 'dotenv/config';
import tracks from './api/routes/tracks.js';
import users from './api/routes/users.js';
import playlists from './api/routes/playlists.js';
import {connect,disconnect} from './db/connection.js'

const app=express();
const PORT=5000;

app.use(express.json());//json to javascript object

app.use('/tracks',tracks);
app.use('/users',users);
app.use('/playlist',playlists);



const start=async()=>{
    try{
        await connect();
        app.listen(PORT,()=>{
            console.log(`Server is running on localhost:${PORT}`);
        });
    }catch(error){        
        console.error('failed to start server:',error.message);
        //exit if server fails to start
        process.exit(1);
    }
};

const shutdown=async()=>{
    console.log('\n shutting down...');
    await disconnect();
    process.exit(0);
}

process.on('SIGTERM',shutdown);
process.on('SIGINT',shutdown);


start();