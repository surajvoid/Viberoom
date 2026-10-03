import { Router } from 'express';
import {
  getSongs,
  getSongById,
  getPlaylists,
  getPlaylistById,
  getRooms,
  getRoomById,
  getFriendsActivity,
  getMusicMatch,
  getDedications,
  createDedication,
  getRadioStations,
  getTopCharts,
  uploadSong,
  searchCatalog,
  searchYouTube,
} from '../controllers/apiController.js';

const router = Router();

router.get('/songs', getSongs);
router.get('/songs/:id', getSongById);
router.get('/playlists', getPlaylists);
router.get('/playlists/:id', getPlaylistById);
router.get('/rooms', getRooms);
router.get('/rooms/:id', getRoomById);
router.get('/friends/activity', getFriendsActivity);
router.get('/match/:user1Id/:user2Id', getMusicMatch);
router.get('/dedications', getDedications);
router.post('/dedications', createDedication);
router.get('/radio-stations', getRadioStations);
router.get('/top-charts', getTopCharts);
router.post('/upload', uploadSong);
router.get('/search', searchCatalog);
router.get('/youtube/search', searchYouTube);

export default router;
