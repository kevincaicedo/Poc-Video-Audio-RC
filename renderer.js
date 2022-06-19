// const videoSelectBtn = document.getElementById('videoSelectBtn');
// videoSelectBtn.onclick = getVideoSources;

// const { desktopCapturer, Menu } = require('electron');

// // Get the available video sources
// async function getVideoSources() {
//     const inputSources = await desktopCapturer.getSources({
//         types: ['window', 'screen']
//     });

//     const videoOptionsMenu = Menu.buildFromTemplate(
//         inputSources.map(source => {
//             return {
//                 label: source.name,
//                 click: () => selectSource(source)
//             };
//         })
//     );
//     videoOptionsMenu.popup();
// }


// let mediaRecorder; // MediaRecorder instance to capture footage
// const recordedChunks = [];

// // Change the videoSource window to record
// async function selectSource(source) {

//     videoSelectBtn.innerText = source.name;

//     const constraints = {
//         audio: {
//             mandatory: {
//                 chromeMediaSource: 'desktop'
//             }
//         },
//         video: {
//             mandatory: {
//                 chromeMediaSource: 'desktop',
//                 chromeMediaSourceId: source.id
//             }
//         }
//     };

//     // Create a Stream
//     const stream = await navigator.mediaDevices
//         .getUserMedia(constraints);

//     // Preview the source in a video element
//     videoElement.srcObject = stream;
//     videoElement.play();

//     // Create the Media Recorder
//     const options = { mimeType: 'video/webm; codecs=vp9' };
//     mediaRecorder = new MediaRecorder(stream, options);

//     // Register Event Handlers
//     mediaRecorder.ondataavailable = handleDataAvailable;
//     mediaRecorder.onstop = handleStop;
// }
