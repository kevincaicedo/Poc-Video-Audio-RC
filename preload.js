const { ipcRenderer } = require('electron')

ipcRenderer.on('SET_SOURCE', async (event, sourceId) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: sourceId,
          minWidth: 1280,
          maxWidth: 1280,
          minHeight: 720,
          maxHeight: 720
        }
      }
    })
    handleStream(stream)
  } catch (e) {
    handleError(e)
  }
})

const recordedChunks = [];
let recorder;

function handleStream(stream) {
  // const video = document.querySelector('video')
  // video.srcObject = stream
  // video.onloadedmetadata = (e) => video.play()

  navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then((mediaStream) => {
    var audioTracks = mediaStream.getAudioTracks();
    //add video and audio sound
    // var medias = document.querySelector("audio");
    // console.log("Medias", medias);
    // for (var i = 0; i < medias.length; i++) {
    //   var tmpStream = medias[i].captureStream();
    //   if (tmpStream) {
    //     var tmpTrack = tmpStream.getAudioTracks()[0];
    //     audioTracks.push(tmpTrack);
    //   }
    // }

    // mix audio tracks
    // if (audioTracks.length > 0) {
    var mixAudioTrack = mixTracks(audioTracks);
    stream.addTrack(mixAudioTrack);
    // }

    // stream.addTrack(audioTracks);
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = handleDataAvailable;
    recorder.start(1000);
    recorder.onstop = handleStop;
  }).catch(function (err) {
    console.log("handle stream error", err);
  })
}

function handleError(e) {
  console.log(e)
}

function mixTracks(tracks) {
  var ac = new AudioContext();
  var dest = ac.createMediaStreamDestination();
  for (var i = 0; i < tracks.length; i++) {
    const source = ac.createMediaStreamSource(new MediaStream([tracks[i]]));
    source.connect(dest);
  }
  return dest.stream.getTracks()[0];
}

// Captures all recorded chunks
function handleDataAvailable(e) {
  console.log('video data available');
  recordedChunks.push(e.data);
}

// Saves the video file on stop
async function handleStop(e) {
  const blob = new Blob(recordedChunks, {
    type: 'video/webm; codecs=vp9'
  });

  const buffer = Buffer.from(await blob.arrayBuffer());
  const base64 = buffer.toString('base64');
  const fileName = `${Date.now()}.webm`;

  ipcRenderer.send('SAVE_VIDEO', {
    fileName,
    base64
  });

  // const { filePath } = await dialog.showSaveDialog({

  //   buttonLabel: 'Save video',
  //   defaultPath: `vid-${Date.now()}.webm`
  // });

  // console.log(filePath);

  // writeFile(filePath, buffer, () => console.log('video saved successfully!'));
}

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }

  const stopBtn = document.getElementById('stopBtn');
  stopBtn.onclick = e => {
    recorder.stop();
    // startBtn.classList.remove('is-danger');
    // startBtn.innerText = 'Start';
  };

  const deepSpeech = document.getElementById('deepSpeech');
  deepSpeech.onclick = e => {
    ipcRenderer.invoke('recognize-wav', file).then(result => {
      // add the recognition results to this.state.results
      console.log('result', result);
      const results = { ...this.state.results };
      results[file] = result;
      this.setState({ results });
    });
  };
})
