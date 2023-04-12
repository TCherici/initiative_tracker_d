export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues on CodeSandbox
    image.src = url;
  });


export async function getCroppedImg(
  imageSrc,
  pixelCrop,
  backgroundColor,
) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  // set canvas size to match the image
  canvas.width = image.width;
  canvas.height = image.height;

  // draw uncropped image to extract its data values
  ctx.drawImage(image, 0, 0);
  var data = ctx.getImageData(0, 0, image.width, image.height);

  // Create temporary canvas and new image to keep transparency info
  var tmpCanvas = document.createElement('canvas');
  tmpCanvas.width = image.width
  tmpCanvas.height = image.height
  tmpCanvas.getContext('2d').putImageData(data,0,0);
  var img = new Image();
  img.src = tmpCanvas.toDataURL();
  // set canvas width to final desired crop size - this will clear existing context
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // create background rectangle over all pixelCrop range
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, pixelCrop.width, pixelCrop.height);

  // draw cropped/scaled image over canvas
  await img.decode() // wait for image decoding before drawing it, or it will just be skipped
  ctx.drawImage(
      img,
      -pixelCrop.x,
      -pixelCrop.y,
      image.width,
      image.height
  );
  return canvas.toDataURL('image/jpeg')
}

export async function createPortraitCanvas(imageSrc, name) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 330;
  canvas.height = 430;
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  addName(canvas, name);
  return new Promise((resolve, reject) => {
    canvas.toBlob((file) => {
      resolve(URL.createObjectURL(file));
    }, 'image/jpeg');
  });
}

function addName(portraitCanvas, name) {
  const ctx = portraitCanvas.getContext('2d');
  ctx.font = 'Comic Sans';
  ctx.textAlign = 'center';
  ctx.font = 'bold 32px serif';
  ctx.fillStyle = 'white';
  ctx.fillText(name, portraitCanvas.width / 2, portraitCanvas.height * 0.9);
  ctx.strokeText(name, portraitCanvas.width / 2, portraitCanvas.height * 0.9);
  return portraitCanvas;
}
