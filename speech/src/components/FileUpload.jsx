import React, { useState } from "react";
import "./styles.css";

function FileUpload({ onExtractAudio }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoSrc, setVideoSrc] = useState(null);
  const [generatedAudioSrc, setGeneratedAudioSrc] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [mergedVideoSrc, setMergedVideoSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("es");

  const resetStates = () => {
    setGeneratedAudioSrc(null);
    setTranscription("");
    setTranslatedText("");
    setMergedVideoSrc(null);
    setStatusMessage("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setVideoSrc(URL.createObjectURL(file));
      resetStates();
    }
  };

  const handleExtractAudio = async () => {
    if (selectedFile) {
      setLoading(true);
      setStatusMessage("Processing video and extracting audio...");
      try {
        const { audioURL, transcriptionText } = await onExtractAudio(
          selectedFile
        );
        setGeneratedAudioSrc(audioURL);
        setTranscription(transcriptionText);
        setStatusMessage("Audio extracted and transcribed successfully.");
      } catch (error) {
        console.error("Error extracting audio:", error);
        setStatusMessage("Audio extraction failed.");
      }
      setLoading(false);
    } else {
      alert("Please upload a video file first.");
    }
  };

  const handleTranslateText = async () => {
    if (transcription) {
      setLoading(true);
      setStatusMessage("Translating transcription...");
      try {
        const response = await fetch("http://localhost:5001/translate-text", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ transcription, targetLanguage }),
        });

        if (response.ok) {
          const data = await response.json();
          setTranslatedText(data.translatedText);
          setStatusMessage("Translation completed successfully.");
        } else {
          console.error("Translation failed:", await response.text());
          setStatusMessage("Translation failed.");
        }
      } catch (error) {
        console.error("Error translating text:", error);
        setStatusMessage("Translation failed due to connection error.");
      }
      setLoading(false);
    } else {
      alert("Please extract and transcribe the audio first.");
    }
  };

  const handleTextToAudio = async () => {
    if (translatedText) {
      setLoading(true);
      setStatusMessage(
        `Converting translated text to audio (${targetLanguage})...`
      );
      try {
        const response = await fetch("http://localhost:5001/text-to-audio", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ translatedText, language: targetLanguage }),
        });

        if (response.ok) {
          const data = await response.json();
          setGeneratedAudioSrc(data.audioFilePath);
          setStatusMessage(
            `Text-to-Audio conversion successful (${targetLanguage}).`
          );
        } else {
          console.error(
            "Text-to-Audio conversion failed:",
            await response.text()
          );
          setStatusMessage("Text-to-Audio conversion failed.");
        }
      } catch (error) {
        console.error("Error converting text to audio:", error);
        setStatusMessage(
          "Text-to-Audio conversion failed due to connection error."
        );
      }
      setLoading(false);
    } else {
      alert("Please translate the transcription first.");
    }
  };

  const handleMergeAudioVideo = async (audioPath) => {
    if (audioPath && selectedFile) {
      setLoading(true);
      setStatusMessage("Merging audio with video...");
      try {
        const response = await fetch(
          "http://localhost:5001/merge-audio-video",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              videoPath: "temp_video.mp4",
              audioPath,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          setMergedVideoSrc(data.mergedVideoPath);
          setStatusMessage("Audio and Video merged successfully.");
        } else {
          console.error("Merging failed:", await response.text());
          setStatusMessage("Merging failed.");
        }
      } catch (error) {
        console.error("Error merging audio and video:", error);
        setStatusMessage("Merging failed due to connection error.");
      }
      setLoading(false);
    } else {
      alert("Please select an audio file before merging.");
    }
  };

  return (
    <div>
      <h1>Speech-to-Speech Recognition</h1>
      <input type="file" accept="video/*" onChange={handleFileChange} />
      <select
        value={targetLanguage}
        onChange={(e) => setTargetLanguage(e.target.value)}
      >
        <option value="en">English</option>
        <option value="es">Spanish</option>
        <option value="fr">French</option>
        <option value="de">German</option>
        <option value="it">Italian</option>
        <option value="zh">Chinese (Simplified)</option>
        <option value="ja">Japanese</option>
      </select>
      {videoSrc && (
        <div>
          <h2>Video Preview</h2>
          <video controls src={videoSrc} width="400"></video>
        </div>
      )}
      {loading && <p>{statusMessage}</p>}
      {!loading && generatedAudioSrc && (
        <div>
          <h2>Generated Audio ({targetLanguage})</h2>
          <audio controls src={generatedAudioSrc}></audio>
          <button onClick={() => handleMergeAudioVideo(generatedAudioSrc)}>
            Merge with {targetLanguage} Audio
          </button>
        </div>
      )}
      {!loading && transcription && (
        <div>
          <h2>Transcription (English)</h2>
          <p>{transcription}</p>
        </div>
      )}
      {!loading && translatedText && (
        <div>
          <h2>Translation ({targetLanguage})</h2>
          <p>{translatedText}</p>
        </div>
      )}
      {!loading && mergedVideoSrc && (
        <div>
          <h2>Merged Video</h2>
          <video controls src={mergedVideoSrc} width="400"></video>
        </div>
      )}
      <button onClick={handleExtractAudio} disabled={loading}>
        {loading ? "Processing..." : "Extract and Transcribe"}
      </button>
      <button onClick={handleTranslateText} disabled={loading}>
        {loading ? "Processing..." : "Translate"}
      </button>
      <button onClick={handleTextToAudio} disabled={loading}>
        {loading ? "Processing..." : "Generate Audio"}
      </button>
    </div>
  );
}

export default FileUpload;
