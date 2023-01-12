import React, { useCallback } from 'react';
import styled from 'styled-components';
import './bottombar.css'

const BottomBar = ({
  clickChat,
  clickCameraDevice,
  goToBack,
  toggleCameraAudio,
  userVideoAudio,
  clickScreenSharing,
  screenShare,
  videoDevices,
  showVideoDevices,
  setShowVideoDevices
}) => {
  const handleToggle = useCallback(
    (e) => {
      setShowVideoDevices((state) => !state);
    },
    [setShowVideoDevices]
  );

  return (
    <div className='bottombar'>
      <div className='bottombar-left'>
        <CameraButton onClick={toggleCameraAudio} data-switch='video'>
          <div>
            {userVideoAudio.video ? (
              <i className='fas fa-video'></i>
            ) : (
              <i className='fas fa-video-slash'></i>
            )}
          </div>
          Camera
        </CameraButton>
        <CameraButton onClick={toggleCameraAudio} data-switch='audio'>
          <div>
            {userVideoAudio.audio ? (
              <i className='fas fa-microphone'></i>
            ) : (
              <i className='fas fa-microphone-slash'></i>
            )}
          </div>
          Audio
        </CameraButton>
      </div>
      {/* <div className='bottombar-center'>
        <div className='bottombar-chatButton' onClick={clickChat}>
          <div>
            <i className='fas fa-comments'></i>
          </div>
          Chat
        </div>
        <div className='bottombar-screenShare' onClick={clickScreenSharing}>
          <div>
            <i
              className={`fas fa-desktop ${screenShare ? 'sharing' : ''}`}
            ></i>
          </div>
          Share Screen
        </div>

      </div> */}
      <div>
        <div className='bottomBar-stopButton' onClick={goToBack}>Stop</div>
      </div>
    </div>
  );
};

const CameraButton = styled.div`
  position: relative;
  width: 75px;
  border: none;
  font-size: 0.9375rem;
  padding: 5px;

  * {
    pointer-events: none;
  }

  .fa-microphone-slash {
    color: #ee2560;
  }

  .fa-video-slash {
    color: #ee2560;
  }
`;

export default BottomBar;