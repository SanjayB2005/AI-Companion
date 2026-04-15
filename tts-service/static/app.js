const chatEl = document.getElementById("chat");
const messageEl = document.getElementById("message");
const withVoiceEl = document.getElementById("withVoice");
const statusEl = document.getElementById("status");
const sendTextBtn = document.getElementById("sendText");
const recordBtn = document.getElementById("recordSpeech");
const audioPlayer = document.getElementById("audioPlayer");
const emotionEl = document.getElementById("emotionIndicator");

let mediaStream = null;
let mediaRecorder = null;
let chunks = [];

let sessionActive = false;
let chunkRecording = false;
let speechDetectedInChunk = false;
let speechStartTs = 0;
let isSendingSpeech = false;

let audioContext = null;
let analyser = null;
let sourceNode = null;
let rafId = null;
let lastVoiceTs = 0;
let noiseFloor = 0.008;

const SILENCE_MS = 1800;
const MIN_SPEECH_MS = 350;
const VOICE_THRESHOLD_MIN = 0.012;
const NOISE_MULTIPLIER = 2.8;

const EMOTION_EMOJI = {
  happy: "😊",
  sad: "🥺",
  curious: "🤔",
  neutral: "😌",
};

function showEmotion(emotion) {
  const emoji = EMOTION_EMOJI[emotion] || "😌";
  emotionEl.textContent = `Rocky is feeling ${emotion} ${emoji}`;
}

function addLine(who, text) {
  const line = document.createElement("div");
  line.className = "line";
  line.innerHTML = `<span class="who">${who}:</span> ${text}`;
  chatEl.appendChild(line);
  chatEl.scrollTop = chatEl.scrollHeight;
}

function setStatus(text) {
  statusEl.textContent = text;
}

async function sendText() {
  const message = messageEl.value.trim();
  if (!message) return;

  addLine("what i said", message);
  messageEl.value = "";
  setStatus("Generating response...");

  try {
    const res = await fetch("/api/chat/text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, with_voice: withVoiceEl.checked }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Request failed");

    addLine("ai", data.ai_text);
    if (data.detected_emotion) {
      showEmotion(data.detected_emotion);
    }
    if (data.ai_audio_url) {
      audioPlayer.src = data.ai_audio_url;
      audioPlayer.play().catch(() => {});
    }
  } catch (err) {
    addLine("ai", `Error: ${err.message}`);
  } finally {
    setStatus("Idle");
  }
}

function stopAudioAnalysis() {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  if (sourceNode) {
    sourceNode.disconnect();
    sourceNode = null;
  }
  if (audioContext) {
    audioContext.close().catch(() => {});
    audioContext = null;
  }
  analyser = null;
}

function stopSessionResources() {
  stopAudioAnalysis();
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }
  mediaRecorder = null;
  chunkRecording = false;
  speechDetectedInChunk = false;
}

function analyzeVolumeLoop() {
  if (!sessionActive || !analyser) {
    return;
  }

  const data = new Uint8Array(analyser.fftSize);
  analyser.getByteTimeDomainData(data);

  let sumSq = 0;
  for (let i = 0; i < data.length; i += 1) {
    const v = (data[i] - 128) / 128;
    sumSq += v * v;
  }
  const rms = Math.sqrt(sumSq / data.length);
  const dynamicThreshold = Math.max(VOICE_THRESHOLD_MIN, noiseFloor * NOISE_MULTIPLIER);
  const now = Date.now();

  if (isSendingSpeech) {
    setStatus("Thinking...");
  } else if (rms > dynamicThreshold) {
    if (!speechDetectedInChunk) {
      speechStartTs = now;
    }
    speechDetectedInChunk = true;
    lastVoiceTs = now;
    setStatus("Listening...");
  } else {
    noiseFloor = noiseFloor * 0.92 + rms * 0.08;
  }

  if (
    !isSendingSpeech &&
    speechDetectedInChunk &&
    chunkRecording &&
    now - lastVoiceTs >= SILENCE_MS
  ) {
    setStatus("Thinking...");
    stopCurrentChunk();
  }

  rafId = requestAnimationFrame(analyzeVolumeLoop);
}

function ensureAudioAnalysis() {
  if (!mediaStream || audioContext) {
    return;
  }

  audioContext = new AudioContext();
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;

  sourceNode = audioContext.createMediaStreamSource(mediaStream);
  sourceNode.connect(analyser);

  analyzeVolumeLoop();
}

function stopCurrentChunk() {
  if (mediaRecorder && chunkRecording && mediaRecorder.state !== "inactive") {
    chunkRecording = false;
    mediaRecorder.stop();
  }
}

function startChunkRecording() {
  if (!sessionActive || !mediaStream || isSendingSpeech) {
    return;
  }

  chunks = [];
  speechDetectedInChunk = false;
  speechStartTs = 0;
  lastVoiceTs = Date.now();

  mediaRecorder = new MediaRecorder(mediaStream);
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  mediaRecorder.onstop = async () => {
    const speechDurationMs = speechDetectedInChunk ? Date.now() - speechStartTs : 0;
    const hasUsefulAudio =
      speechDetectedInChunk && chunks.length > 0 && speechDurationMs >= MIN_SPEECH_MS;

    if (sessionActive && hasUsefulAudio) {
      const blob = new Blob(chunks, { type: "audio/webm" });
      await sendSpeech(blob);
    }

    if (sessionActive) {
      startChunkRecording();
    } else {
      setStatus("Idle");
    }
  };

  mediaRecorder.start();
  chunkRecording = true;
  setStatus("Listening...");
}

async function startSpeakSession() {
  mediaStream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      channelCount: 1,
    },
  });
  sessionActive = true;
  ensureAudioAnalysis();
  startChunkRecording();
  recordBtn.textContent = "Stop";
}

function stopSpeakSession() {
  sessionActive = false;
  recordBtn.textContent = "Speak";
  stopCurrentChunk();
  stopSessionResources();
  setStatus("Idle");
}

async function toggleRecording() {
  if (!sessionActive) {
    await startSpeakSession();
    return;
  }
  stopSpeakSession();
}

async function playAudioAndWait(url) {
  audioPlayer.src = url;

  try {
    await audioPlayer.play();
  } catch (_err) {
    return;
  }

  await new Promise((resolve) => {
    const done = () => {
      audioPlayer.removeEventListener("ended", done);
      audioPlayer.removeEventListener("error", done);
      audioPlayer.removeEventListener("abort", done);
      resolve();
    };

    audioPlayer.addEventListener("ended", done, { once: true });
    audioPlayer.addEventListener("error", done, { once: true });
    audioPlayer.addEventListener("abort", done, { once: true });
  });
}

async function sendSpeech(blob) {
  if (isSendingSpeech) {
    return;
  }

  isSendingSpeech = true;
  setStatus("Thinking...");

  const form = new FormData();
  form.append("audio", blob, "recording.webm");
  form.append("with_voice", String(withVoiceEl.checked));

  try {
    const res = await fetch("/api/chat/speech", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Speech request failed");

    addLine("what i said", data.user_text);
    addLine("ai", data.ai_text);
    if (data.detected_emotion) {
      showEmotion(data.detected_emotion);
    }
    if (data.ai_audio_url) {
      if (sessionActive && withVoiceEl.checked) {
        await playAudioAndWait(data.ai_audio_url);
      } else {
        audioPlayer.src = data.ai_audio_url;
        audioPlayer.play().catch(() => {});
      }
    }
  } catch (err) {
    addLine("ai", `Error: ${err.message}`);
  } finally {
    isSendingSpeech = false;
    if (!sessionActive) {
      setStatus("Idle");
    }
  }
}

sendTextBtn.addEventListener("click", sendText);
recordBtn.addEventListener("click", () => {
  toggleRecording().catch((err) => {
    addLine("ai", `Error: ${err.message}`);
    stopSpeakSession();
    setStatus("Idle");
  });
});
