import { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaStepBackward, FaStepForward, FaVolumeUp } from 'react-icons/fa';

interface CustomAudioPlayerProps {
    src: string;
    className?: string;
}

const CustomAudioPlayer: React.FC<CustomAudioPlayerProps> = ({ src, className = '' }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleEnded = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('ended', handleEnded);

        // Se autoPlay è attivo, aggiorna lo stato quando l'audio inizia
        if (audio.autoplay && !audio.paused) {
            setIsPlaying(true);
        }

        // Controlla periodicamente se l'audio sta suonando (per gestire l'autoplay)
        const checkPlayState = () => {
            if (audio && !audio.paused && !audio.ended) {
                setIsPlaying(true);
            }
        };

        const playStateInterval = setInterval(checkPlayState, 100);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('ended', handleEnded);
            clearInterval(playStateInterval);
        };
    }, []);

    const togglePlay = async () => {
        const audio = audioRef.current;
        if (!audio) return;

        try {
            if (isPlaying) {
                audio.pause();
            } else {
                await audio.play();
            }
            setIsPlaying(!isPlaying);
        } catch (error) {
            console.error('Error playing audio:', error);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio) return;

        const time = (parseFloat(e.target.value) / 100) * duration;
        audio.currentTime = time;
        setCurrentTime(time);
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const progress = duration ? (currentTime / duration) * 100 : 0;

    return (
        <div className={`bg-black/50 backdrop-blur-xs rounded-lg px-3 pt-3 pb-1 scale-75  text-white ${className}`}>
            <p className='flex justify-center font-medium'>Ygos - Nulla mi cambia</p>
            <audio ref={audioRef} src={src} autoPlay />

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mb-1">
                <button
                    className="text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
                    onClick={() => {
                        const audio = audioRef.current;
                        if (audio) {
                            audio.currentTime = Math.max(0, audio.currentTime - 10);
                        }
                    }}
                >
                    <FaStepBackward size={16} />
                </button>

                <button
                    onClick={togglePlay}
                    className="bg-white/20 hover:bg-white/30 transition-colors rounded-full p-3 text-white"
                >
                    {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} />}
                </button>

                <button
                    className="text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
                    onClick={() => {
                        const audio = audioRef.current;
                        if (audio) {
                            audio.currentTime = Math.min(duration, audio.currentTime + 10);
                        }
                    }}
                >
                    <FaStepForward size={16} />
                </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={handleSeek}
                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                        background: `linear-gradient(to right, #ffffff ${progress}%, rgba(255,255,255,0.2) ${progress}%)`
                    }}
                />
                <div className="flex justify-between text-xs text-white/60 mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            {/* Volume Control */}

            <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .slider::-moz-range-thumb {
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
      `}</style>
        </div>
    );
};

export default CustomAudioPlayer;
