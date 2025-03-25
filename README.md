# speech-to-speech-streaming-project
Here’s a detailed description you can use for your README file, covering project instructions and functionality:

---

# Speech-to-Speech Streaming Application

## Overview
This project is a **Speech-to-Speech Streaming Application** that allows users to:
1. Upload a video file containing audio.
2. Extract the audio from the video.
3. Transcribe the extracted audio.
4. Translate the transcription into a selected target language.
5. Generate audio for the translated text.
6. Merge the generated audio back with the original video to produce a new video file with the translated audio.

The application combines frontend and backend components to streamline the process, leveraging powerful tools and libraries like React, Flask, FFmpeg, gTTS, and Google Translator API.

---

## Features
### Frontend:
- **File Upload**: Users can upload a video file directly from their device.
- **Language Selection**: A dropdown menu lets users choose the target language for translation.
- **Video Preview**: Uploaded videos can be previewed on the UI.
- **Dynamic Status Updates**: The interface provides updates during audio extraction, transcription, translation, and merging processes.
- **Generated Outputs**: The app displays transcriptions, translations, and generated audio for review.

### Backend:
- **Audio Extraction**: Uses FFmpeg to extract audio from uploaded videos.
- **Audio Preprocessing**: Removes silence and optimizes audio for transcription accuracy.
- **Transcription**: Transcribes the extracted audio using Google Speech Recognition.
- **Translation**: Translates the transcription into the target language using Google Translator.
- **Text-to-Speech Conversion**: Converts the translated text into audio using gTTS.
- **Audio-Video Merging**: Merges the generated audio with the original video using FFmpeg.

---

## Instructions
### Prerequisites:
1. Install Node.js for running the frontend.
2. Install Python for running the backend.
3. Ensure FFmpeg is installed and accessible from the command line.
4. Install dependencies for the backend using:
   ```bash
   pip install -r requirements.txt
   ```

### Setup:
1. Clone this repository.
2. Navigate to the `frontend` directory and install dependencies:
   ```bash
   npm install
   ```
3. Navigate to the `backend` directory and install Python dependencies as mentioned above.

### Running the Application:
#### Backend:
1. Start the backend server by running:
   ```bash
   python va.py
   ```
2. The backend will be accessible at `http://localhost:5001`.

#### Frontend:
1. Start the frontend application by navigating to the `frontend` directory and running:
   ```bash
   npm start
   ```
2. The frontend will be accessible at `http://localhost:5173`.

---

## How to Use:
1. **Upload Video**: On the frontend, upload a video file.
2. **Extract and Transcribe**: Click the "Extract and Transcribe" button to extract audio and generate transcription.
3. **Translate**: Select the target language from the dropdown menu and click "Translate."
4. **Generate Audio**: Click "Generate Audio" to produce speech in the target language.
5. **Merge Audio with Video**: Choose the generated audio and click "Merge" to create the new video file with translated audio.

---

## Technologies Used
- **React**: Frontend framework for building the user interface.
- **Flask**: Backend framework for handling API requests and processing.
- **FFmpeg**: Tool for audio and video processing.
- **Google Speech Recognition**: Library for audio transcription.
- **gTTS**: Library for text-to-speech conversion.
- **pydub**: Library for audio manipulation.
- **GoogleTranslator**: API for translating text.

---
