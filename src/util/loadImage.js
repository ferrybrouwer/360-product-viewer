/**
 * Load image url
 * 
 * @param   {String} url 
 * @returns {Promise.<void>}
 */
export default function loadImage(url) {
    return new Promise((resolve, reject) => {
        const image = new Image()
        image.onload = resolve
        image.onerror = reject
        image.src = url
    })
}