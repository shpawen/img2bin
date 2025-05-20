const canva = document.getElementById("bin_img_canva")
const canvaContext = canva.getContext("2d");

let imageWidth, imageHeight, originalImageData = null;

document.getElementById("pasteButton").addEventListener("click", pasteImage);
document.getElementById("threshold").addEventListener("input", (event) => {
    const imageWorkingCopy = new ImageData(
        new Uint8ClampedArray(originalImageData.data),
        originalImageData.width,
        originalImageData.height
    );
    return image_binarization(imageWorkingCopy, imageWidth, imageHeight, event.target.value);
})

async function pasteImage() {
    try {
        const clipboardItems = await navigator.clipboard.read();
        originalImageData = null;

        for (const item of clipboardItems) {
            if (!item.types.includes("image/png")) {
                throw new Error("There is no copied image in buffer!");
            }

            const blob = await item.getType("image/png");
            const bitmap = await createImageBitmap(blob);

            imageWidth = bitmap.width;
            imageHeight = bitmap.height;

            canva.width = imageWidth;
            canva.height = imageHeight;

            canvaContext.drawImage(bitmap, 0, 0);

            const imageData = canvaContext.getImageData(0, 0, imageWidth, imageHeight);
            originalImageData = new ImageData(
                new Uint8ClampedArray(imageData.data),
                imageData.width,
                imageData.height
            );

            bitmap.close();
        }
    }
    catch (error) {
        console.log(error.message);
    }
}

async function image_binarization(image, width, height, threshold) {
    console.log(`Threshold is ${threshold}`);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Calculate position of curent pixel (4 ints for one pixel: r, g, b and alpha)
            const pos = (y * width + x) * 4;

            // Read RGBA
            const r = image.data[pos];
            const g = image.data[pos + 1];
            const b = image.data[pos + 2];

            // Convert to greyscale and perform binarization
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            const binaryValue = gray > threshold ? 255 : 0;

            // Set result back (black&white)
            image.data[pos] = binaryValue;     // R
            image.data[pos + 1] = binaryValue; // G
            image.data[pos + 2] = binaryValue; // B
            // Alpha channel remains untouched
        }
    }
    canvaContext.putImageData(image, 0, 0);
}

