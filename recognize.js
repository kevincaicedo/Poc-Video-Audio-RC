const DeepSpeech = require('deepspeech');
const fs = require('fs');
const path = require('path');
const wav = require('wav');

// return the deepspeech model or download it if it is not found
function getModel(appDataPath, callback) {
    let modelPath = path.resolve(appDataPath, 'deepspeech-0.9.3-models.pbmm');
    let scorerPath = path.resolve(appDataPath, 'deepspeech-0.9.3-models.scorer');
    if (fs.existsSync(modelPath) && fs.existsSync(scorerPath)) {
        callback(createModel(modelPath, scorerPath));
    }

    throw new Error('Model not found');
}

// create the deepspeech model
function createModel(modelPath, scorerPath) {
    const model = new DeepSpeech.Model(modelPath);
    model.enableExternalScorer(scorerPath);
    return model;
}

// create a deepspeech stream to process a .wav file
function recognizeWav(path, model) {
    return new Promise(function (resolve, reject) {
        try {
            let modelStream = model.createStream();
            const bufferSize = 512;
            const file = fs.createReadStream(path, { highWaterMark: bufferSize });
            const reader = new wav.Reader();
            reader.on('format', function (format) {
                if (format.sampleRate !== model.sampleRate()) {
                    reject(new Error('invalid sample rate: ' + format.sampleRate));
                }
                reader.on('end', function () {
                    const results = modelStream.finishStream();
                    resolve(results);
                });
                reader.on('data', function (data) {
                    modelStream.feedAudioContent(data);
                });
            });
            file.pipe(reader);
        }
        catch (e) {
            reject(e);
        }
    });
}

module.exports = {
    getModel,
    recognizeWav
};