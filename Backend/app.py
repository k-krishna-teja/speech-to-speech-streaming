import os
import subprocess
import speech_recognition as sr
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from deep_translator import GoogleTranslator
from gtts import gTTS

app = Flask(__name__)
CORS(app)

@app.route('/audio/<path:filename>', methods=['GET'])
def serve_audio(filename):
    audio_directory = os.path.join(os.getcwd(), "AudioFiles")
    return send_from_directory(audio_directory, filename)

@app.route('/merged/<path:filename>', methods=['GET'])
def serve_merged_video(filename):
    merged_directory = os.path.join(os.getcwd(), "MergedFiles")
    return send_from_directory(merged_directory, filename)

@app.route('/extract-audio', methods=['POST'])
def extract_audio():
    if 'video' not in request.files:
        return "No video file provided", 400

    video_file = request.files['video']
    input_video_path = "temp_video.mp4"

    try:
        video_file.save(input_video_path)
        output_directory = "AudioFiles"
        os.makedirs(output_directory, exist_ok=True)

        video_name = os.path.splitext(video_file.filename)[0]
        original_audio_path = os.path.join(output_directory, f"{video_name}_original_audio.mp3")
        wav_audio_path = os.path.join(output_directory, f"{video_name}_audio.wav")
        transcription_file = os.path.join(output_directory, f"{video_name}_transcription.txt")

        # Extract original audio
        ffmpeg_command = ["ffmpeg", "-i", input_video_path, "-q:a", "0", "-map", "a", original_audio_path]
        subprocess.run(ffmpeg_command, check=True)

        # Convert audio to WAV
        ffmpeg_command_wav = ["ffmpeg", "-i", original_audio_path, "-ar", "16000", wav_audio_path]
        subprocess.run(ffmpeg_command_wav, check=True)

        # Transcribe the audio
        transcription = transcribe_audio(wav_audio_path)

        # Save transcription
        with open(transcription_file, "w") as f:
            f.write(transcription)

        return jsonify({
            "transcription": transcription,
            "audioPath": f"http://localhost:5001/audio/{video_name}_original_audio.mp3"
        })
    except subprocess.CalledProcessError as e:
        return f"Error during FFmpeg processing: {e}", 500
    except Exception as e:
        return f"Internal server error: {e}", 500

@app.route('/translate-text', methods=['POST'])
def translate_text_endpoint():
    data = request.get_json()
    transcription = data.get("transcription", "")
    target_language = data.get("targetLanguage", "en")

    if not transcription:
        return jsonify({"error": "No transcription provided"}), 400

    try:
        translated_text = translate_text(transcription, target_language)

        output_directory = "AudioFiles"
        os.makedirs(output_directory, exist_ok=True)
        translation_file_path = os.path.join(output_directory, f"translated_{target_language}.txt")
        with open(translation_file_path, "w") as f:
            f.write(translated_text)

        return jsonify({
            "translatedText": translated_text,
            "filePath": translation_file_path
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/text-to-audio', methods=['POST'])
def text_to_audio():
    data = request.get_json()
    translated_text = data.get("translatedText", "")
    language = data.get("language", "en")

    if not translated_text:
        return jsonify({"error": "No translated text provided"}), 400

    try:
        output_directory = "AudioFiles"
        os.makedirs(output_directory, exist_ok=True)
        translated_audio_path = os.path.join(output_directory, f"translated_{language}.mp3")

        # Generate audio using gTTS
        tts = gTTS(translated_text, lang=language)
        tts.save(translated_audio_path)

        return jsonify({"audioFilePath": f"http://localhost:5001/audio/translated_{language}.mp3"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/merge-audio-video', methods=['POST'])
def merge_audio_video():
    data = request.get_json()
    video_path = "temp_video.mp4"
    audio_path = data.get("audioPath")

    if not audio_path:
        return jsonify({"error": "Audio file path missing"}), 400

    output_directory = "MergedFiles"
    os.makedirs(output_directory, exist_ok=True)
    video_no_audio_path = os.path.join(output_directory, "video_no_audio.mp4")
    output_file = os.path.join(output_directory, "merged_output.mp4")

    try:
        # Remove original audio from video
        remove_audio_command = [
            "ffmpeg", "-i", video_path, "-c:v", "copy", "-an", video_no_audio_path
        ]
        subprocess.run(remove_audio_command, check=True)

        # Merge video without audio and padded audio
        merge_command = [
    "ffmpeg", "-i", video_no_audio_path, "-i", audio_path, 
    "-c:v", "copy", "-c:a", "aac", "-strict", "experimental", 
    "-shortest", output_file
        ]       
        subprocess.run(merge_command, check=True)

        return jsonify({"mergedVideoPath": f"http://localhost:5001/merged/{os.path.basename(output_file)}"})
    except subprocess.CalledProcessError as e:
        return jsonify({"error": f"FFmpeg error: {e}"}), 500
    except Exception as e:
        return jsonify({"error": f"Internal server error: {e}"}), 500

def transcribe_audio(audio_path):
    recognizer = sr.Recognizer()
    try:
        with sr.AudioFile(audio_path) as source:
            audio_data = recognizer.record(source)
            return recognizer.recognize_google(audio_data, language="en-US")
    except sr.UnknownValueError:
        return "Google Speech Recognition could not understand the audio."
    except sr.RequestError as e:
        return f"Google Speech Recognition error: {e}"

def translate_text(text, target_language="en"):
    try:
        translator = GoogleTranslator(source="auto", target=target_language)
        return translator.translate(text)
    except Exception as e:
        return f"Translation failed: {e}"

if __name__ == '__main__':
    app.run(port=5001)