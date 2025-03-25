import React from "react";
import FileUpload from "./components/FileUpload";

function App() {
  // Function to handle audio extraction by calling the backend
  const handleExtractAudio = async (file) => {
    const formData = new FormData();
    formData.append("video", file);

    try {
      // Make the API call to extract audio
      const response = await fetch("http://localhost:5001/extract-audio", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        // If successful, parse the response and return audio and transcription data
        const data = await response.json();
        return {
          audioURL: data.audioPath,
          transcriptionText: data.transcription,
        };
      } else {
        console.error("Failed to extract audio:", await response.text());
      }
    } catch (error) {
      console.error("Error connecting to the backend:", error);
    }

    // Return default values if the process fails
    return { audioURL: null, transcriptionText: "" };
  };

  return (
    <div>
      {/* Pass the handleExtractAudio function to the FileUpload component */}
      <FileUpload onExtractAudio={handleExtractAudio} />
    </div>
  );
}

export default App;
