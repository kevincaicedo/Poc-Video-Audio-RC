// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
const SpeechGrammarList = window.SpeechGrammarList || webkitSpeechGrammarList;
const SpeechRecognitionEvent = window.SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

const colors = ['aqua', 'azure', 'beige', 'bisque', 'black', 'blue', 'brown', 'chocolate', 'coral'];
const grammar = '#JSGF V1.0; grammar colors; public <color> = ' + colors.join(' | ') + ' ;'

const recognition = new SpeechRecognition();
const speechRecognitionList = new SpeechGrammarList();

speechRecognitionList.addFromString(grammar, 1);

recognition.grammars = speechRecognitionList;
recognition.continuous = true;
recognition.lang = 'es-CO';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

const diagnostic = document.querySelector('.output');
const bg = document.querySelector('html');
// const hints = document.querySelector('.hints');

let colorHTML = '';
colors.forEach(function (v, i, a) {
    console.log(v, i);
    colorHTML += '<span style="background-color:' + v + ';"> ' + v + ' </span>';
});
// hints.innerHTML = 'Tap/click then say a color to change the background color of the app. Try ' + colorHTML + '.';

document.body.onclick = function () {
    recognition.start();
    console.log('Ready to receive a color command.');
}

recognition.onresult = function (event) {
    const size = event.results.length - 1;
    let color = event.results[size][0].transcript;
    diagnostic.textContent = 'Result received: ' + color + '.';
    bg.style.backgroundColor = color;

    console.log('Confidence: ', color);
}

recognition.onspeechend = function () {
    recognition.stop();
}

recognition.onnomatch = function (event) {
    diagnostic.textContent = 'I didn\'t recognize that color.';
}

recognition.onerror = function (event) {
    console.log(event);
    diagnostic.textContent = 'Error occurred in recognition: ' + event.error;
}
