import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    X,
    Search,
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume2,
    VolumeX,
    Music as MusicIcon,
    Filter,
    Clock,
    ArrowLeft
} from 'lucide-react';
import DashboardLayout from '../components/StudentDashboard/DashboardLayout';
import { getAllSongs, getSongsByCategory, searchSongs } from '../api/musicApi';
import './CalmMusic.css';

const CalmMusic = () => {
    const navigate = useNavigate();
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Player State
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.7);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    const audioRef = useRef(new Audio());

    const categories = ['All', 'Ambient', 'Lofi', 'Nature', 'Classical', 'Acoustic'];

    useEffect(() => {
        fetchSongs();
    }, [selectedCategory]);

    const fetchSongs = async () => {
        setLoading(true);
        try {
            let res;
            if (selectedCategory === 'All') {
                res = await getAllSongs();
            } else {
                res = await getSongsByCategory(selectedCategory.toLowerCase());
            }
            setSongs(res.data);
        } catch (error) {
            console.error("Error fetching songs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            fetchSongs();
            return;
        }
        setLoading(true);
        try {
            const res = await searchSongs(searchQuery);
            setSongs(res.data);
        } catch (error) {
            console.error("Error searching songs:", error);
        } finally {
            setLoading(false);
        }
    };

    // Audio Logic
    useEffect(() => {
        const audio = audioRef.current;

        const updateProgress = () => {
            setProgress((audio.currentTime / audio.duration) * 100);
        };

        const onEnded = () => {
            handleNext();
        };

        const onLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('loadedmetadata', onLoadedMetadata);

        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('loadedmetadata', onLoadedMetadata);
        };
    }, []);

    useEffect(() => {
        audioRef.current.volume = isMuted ? 0 : volume;
    }, [volume, isMuted]);

    const playSong = (song) => {
        if (currentSong?._id === song._id) {
            togglePlay();
            return;
        }
        setCurrentSong(song);
        audioRef.current.src = song.audioUrl;
        audioRef.current.play();
        setIsPlaying(true);
    };

    const togglePlay = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleNext = () => {
        if (!songs.length || !currentSong) return;
        const currentIndex = songs.findIndex(s => s._id === currentSong._id);
        const nextIndex = (currentIndex + 1) % songs.length;
        playSong(songs[nextIndex]);
    };

    const handlePrev = () => {
        if (!songs.length || !currentSong) return;
        const currentIndex = songs.findIndex(s => s._id === currentSong._id);
        const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
        playSong(songs[prevIndex]);
    };

    const handleProgressChange = (e) => {
        const newTime = (e.target.value / 100) * audioRef.current.duration;
        audioRef.current.currentTime = newTime;
        setProgress(e.target.value);
    };

    const formatTime = (seconds) => {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <DashboardLayout>
            <div className="music-page-container">
                <header className="music-header">
                    <button className="back-btn" onClick={() => navigate('/dashboard/activities')}>
                        <ArrowLeft size={18} />
                        <span>Back</span>
                    </button>
                    <div className="title-area">
                        <h1 className="page-title">Calm Music</h1>
                        <p className="page-subtitle">Curated sounds to help you find your peace.</p>
                    </div>
                </header>

                <div className="music-controls-row">
                    <form className="search-bar" onSubmit={handleSearch}>
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search for tracks, artists..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>

                    <div className="category-filters">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="songs-grid">
                    {loading ? (
                        <div className="loading-state">Finding the perfect rhythm...</div>
                    ) : songs.length > 0 ? (
                        songs.map(song => (
                            <div
                                key={song._id}
                                className={`song-card ${currentSong?._id === song._id ? 'playing' : ''}`}
                                onClick={() => playSong(song)}
                            >
                                <div className="song-artwork">
                                    <MusicIcon size={32} />
                                    <div className="play-overlay">
                                        {currentSong?._id === song._id && isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                                    </div>
                                </div>
                                <div className="song-info">
                                    <h3 className="song-title">{song.title}</h3>
                                    <p className="song-artist">{song.artist}</p>
                                    <div className="song-meta">
                                        <span>{song.category}</span>
                                        <span className="dot">•</span>
                                        <span>{formatTime(song.duration)}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">No tracks found. Try a different search or category.</div>
                    )}
                </div>

                {/* Persistent Player */}
                {currentSong && (
                    <div className="persistent-player">
                        <div className="player-content">
                            <div className="player-song-info">
                                <div className="mini-artwork">
                                    <MusicIcon size={20} />
                                </div>
                                <div className="text-info">
                                    <span className="now-playing-title">{currentSong.title}</span>
                                    <span className="now-playing-artist">{currentSong.artist}</span>
                                </div>
                            </div>

                            <div className="player-main-controls">
                                <div className="control-buttons">
                                    <button onClick={handlePrev} className="control-btn"><SkipBack size={20} fill="currentColor" /></button>
                                    <button onClick={togglePlay} className="control-btn play-pause-main">
                                        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                                    </button>
                                    <button onClick={handleNext} className="control-btn"><SkipForward size={20} fill="currentColor" /></button>
                                </div>
                                <div className="progress-area">
                                    <span className="time-val">{formatTime(audioRef.current.currentTime)}</span>
                                    <input
                                        type="range"
                                        className="progress-slider"
                                        min="0"
                                        max="100"
                                        value={progress}
                                        onChange={handleProgressChange}
                                    />
                                    <span className="time-val">{formatTime(duration)}</span>
                                </div>
                            </div>

                            <div className="player-side-controls">
                                <button onClick={() => setIsMuted(!isMuted)} className="icon-btn">
                                    {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                </button>
                                <input
                                    type="range"
                                    className="volume-slider"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={volume}
                                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default CalmMusic;
