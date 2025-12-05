import axios from 'axios';
import express from 'express';

const router=express.Router();

const LASTFM_API_KEY=process.env.API_KEY;
const LASTFM_BASE_URL='http://ws.audioscrobbler.com/2.0/';

/**
 * @route GET /tracks/search
 * @description Search for music tracks using the Last.fm API
 * @queryparam {string} track (required) the name of the track to search for
 * @queryparam {boolean} fuzzy (optional) the Last.fm search is fuzzy by default
 *
 * @returns {Array<Object>} 200 - An array of minimal track objects.
 */
router.get('/search',async(req,res)=>{
    const {track,fuzzy}=req.query;

    //optional to check authorization
    if(!track || track.trim()===''){
        return res.status(400).json({ error: 'track parameter required' });
    }
    try{
        const params={
            method: 'track.search',
            api_key: LASTFM_API_KEY,
            track,
            format: 'json'
        };

        const useFuzzy = fuzzy === 'true';
        
        const {data}=await axios.get(`${LASTFM_BASE_URL}`,{params});
        let minimal = data.results.trackmatches.track
                        .filter(_track => _track.mbid && _track.mbid.trim() !== '')
                        .map((_track) => {
                            return {
                
                                        name: _track.name,
                                        artist: _track.artist,
                                        mbid: _track.mbid,
                                        url: _track.url
                            };
                        });
        //strict match
        if(!useFuzzy){
            const searchTerm=track.toLowerCase();
            minimal=minimal.filter(_track=> _track.name.toLowerCase().includes(searchTerm));
        }
        res.json(minimal);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:'failed to search'});
    };
});

/**
 * @route GET /tracks/:mbid
 * @description Get detailed information for a single track from the Last.fm API.
 * @param {string} mbid (required) valid mbid or a string formatted as 'artist|track'.
 * 001bf2b7-586b-4473-8849-b0c6db211da5  or Andra Day|Rise Up
 * @returns {Object} 200 - A sanitized object with detailed track information.
 */
router.get('/:mbid',async(req,res)=>{
    const {mbid}=req.params;
    
    if(!mbid){
        return res.status(400).json({ error: 'mbid required' });
       
    }
    try{
        const params={
            api_key: LASTFM_API_KEY,
            method: 'track.getInfo',
            format: 'json'
        }
        if (mbid.includes('|')){
            const [artist,track]=mbid.split('|');
            params.artist=artist;
            params.track=track;
         }
        else{
            params.mbid=mbid;
        }
        
        const {data} =await axios.get(`${LASTFM_BASE_URL}`,{params});
        // image= data.track.album?.image?.find((img)=>img.size==='extralarge');
        const minimal = {
            //id: data.id,
            name: data.track.name,
            mbid: data.track.mbid,
            //url: data.track.url,
            album: data.track.album.title,
            //image: image['#text'],
            artist_name: data.track.artist.name,
            //published: data.track.wiki.published,
            //toptags: data.track.toptags.tag.map((t) => t.name)
            
        };
        res.status(200).json(minimal);
        
    }
    catch(err){
        console.log(err);
        res.status(500).json({ error: 'Failed to get track by mbid via Last.fm API' });

    }
});

export default router;