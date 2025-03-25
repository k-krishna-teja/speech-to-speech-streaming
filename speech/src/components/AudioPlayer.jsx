import React from "react";

function AudioPlayer({ audioSrc }) {
  return (
    <div>
      <audio controls>
        <source src={audioSrc} type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}

export default AudioPlayer;
