const img = document.getElementById("sourceImage");
const canva = document.getElementById("bin_img_canva").getContext("2d");

document.getElementById("pasteButton").addEventListener("click", pasteImage);
document.getElementById("binaryButton").addEventListener("click", () => {
    const imageWidth = document.getElementById("sourceImage").clientWidth;
    const imageHeight = document.getElementById("sourceImage").clientHeight;
    canva.drawImage(img, 0, 0);
    const imageToBin = canva.getImageData(0, 0, imageWidth, imageHeight);
    const threshold = document.getElementById("threshold").value;
    return image_binarization(imageToBin, imageWidth, imageHeight, threshold);
})

img.onload = function () {
    document.getElementById("bin_img_canva").width
        = document.getElementById("sourceImage").clientWidth;
    document.getElementById("bin_img_canva").height
        = document.getElementById("sourceImage").clientHeight;
}

async function pasteImage() {
    try {
        const clipboardItems = await navigator.clipboard.read();

        for (const item of clipboardItems) {
            if (!item.types.includes("image/png")) {
                throw new Error("There is no copied image in buffer!");
            }

            const blob = await item.getType("image/png");

            const img = document.getElementById("sourceImage");
            img.src = URL.createObjectURL(blob);
        }
    }
    catch (error) {
        console.log(error.message);
    }
}

export function image_binarization(image, width, height, threshold) {
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
    canva.putImageData(image, 0, 0);
}