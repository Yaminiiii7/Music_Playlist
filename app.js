import express from 'express';
import 'dotenv/config';
import tracks from './api/routes/tracks.js';
import users from './api/routes/users.js';
import playlists from './api/routes/playlists.js';

const app=express();
const PORT=5000;

app.use(express.json());//json to javascript object

app.use('/tracks',tracks);
app.use('/users',users);
app.use('/playlist',playlists);

app.listen(PORT,()=>{

    console.log(`Server is running on localhost:${PORT}`);
})
