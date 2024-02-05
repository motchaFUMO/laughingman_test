let lastDetection = null;
let disappearanceTimer = null;



async function start() {
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.loadFaceLandmarkModel('/models');
    const video = document.createElement('video');
    document.getElementById('webcam-container').append(video);
    navigator.mediaDevices.getUserMedia({ video: {} })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(err => console.error(err));

    video.onloadedmetadata = () => {
        video.width = video.videoWidth;
        video.height = video.videoHeight;
    
        video.play();
        const canvas = faceapi.createCanvasFromMedia(video);
        document.getElementById('canvas-container').append(canvas);
        const displaySize = { width: video.width, height: video.height };
        faceapi.matchDimensions(canvas, displaySize);
        
        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            
            if (resizedDetections.length === 1) {
                lastDetection = resizedDetections[0].detection;
                clearTimeout(disappearanceTimer);
                disappearanceTimer = null;
                updateImagePosition(lastDetection);
            } else if (lastDetection && !disappearanceTimer) {
                disappearanceTimer = setTimeout(() => {
                    document.getElementById('waraiotokoGif').style.display = 'none';
                    lastDetection = null;
                }, 1000);
            }
        }, 100);
    };
}

function updateImagePosition(detection) {
    const { x, y, width, height } = detection.box;
    const img = document.getElementById('waraiotokoGif');
    const originalAspectRatio = img.naturalWidth / img.naturalHeight;
    const enlargementFactor = 1.2; // 顔の検出領域より20%大きく表示
    const newWidth = width * enlargementFactor;
    const newHeight = newWidth / originalAspectRatio; // アスペクト比を維持
    const newX = x - (newWidth - width) / 2;
    const newY = y - (newHeight - height) / 2;
    
    img.style.top = `${newY}px`;
    img.style.left = `${newX}px`;
    img.style.width = `${newWidth}px`;
    img.style.height = `${newHeight}px`;
    img.style.display = 'block';
}

start();
