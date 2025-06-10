import React from 'react';

interface VideoControlsProps {
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onEndCall: () => void;
  isVideoOn: boolean;
  isAudioOn: boolean;
}

const VideoControls: React.FC<VideoControlsProps> = ({
  onToggleVideo,
  onToggleAudio,
  onEndCall,
  isVideoOn,
  isAudioOn
}) => {
  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      justifyContent: 'center',
      background: 'rgba(0, 0, 0, 0.8)',
      padding: '8px',
      borderRadius: '12px',
      backdropFilter: 'blur(10px)'
    }}>
      <button
        onClick={onToggleVideo}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: 'none',
          background: isVideoOn ? '#374151' : '#ef4444',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          transition: 'background 0.2s'
        }}
        title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
      >
        {isVideoOn ? '📹' : '📷'}
      </button>

      <button
        onClick={onToggleAudio}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: 'none',
          background: isAudioOn ? '#374151' : '#ef4444',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          transition: 'background 0.2s'
        }}
        title={isAudioOn ? 'Mute' : 'Unmute'}
      >
        {isAudioOn ? '🎤' : '🔇'}
      </button>

      <button
        onClick={onEndCall}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: 'none',
          background: '#ef4444',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        title="Leave call"
      >
        📞
      </button>
    </div>
  );
};

export default VideoControls;