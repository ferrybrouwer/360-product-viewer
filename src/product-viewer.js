import 'scss/product-viewer.scss'

import path from 'path'
import leftPad from 'left-pad'
import { EventEmitter } from 'events'
import BezierEasing from 'bezier-easing'

import loadImage from 'util/loadImage'

/**
 * @class ProductViewer
 * @classdesc Rotate product handling dragging and auto rotate by swapping images
 */
class ProductViewer extends EventEmitter {
    // default props
    imagePath = null
    filePrefix = null
    fileExtension = null
    images = []
    numberOfImages = 0
    invertMovement = false

    // DOM nodes
    $element = null
    $image = null

    // states
    dragging = false
    index = 0
    animateInterval = null

    // press states (to compute values)
    pressMouseX = null
    pressIndex = 0

    // static easings
    static easings = {
        EASE_LINEAR: BezierEasing(0, 0, 1, 1),
        EASE: BezierEasing(0.25, 0.1, 0.25, 1),
        EASE_IN: BezierEasing(0, 0, 1, 0.5),
        EASE_IN_OUT: BezierEasing(0.42, 0, 0.58, 1),
        EASE_OUT: BezierEasing(0.61, 0.26, 0.08, 1.46)
    }

    /**
     * @constructor
     * @property {HtmlElement}  element           The container element
     * @property {String}       imagePath         The path to the images.
     * @property {String}       filePrefix        File prefix of each image
     * @property {String}       fileExtension     The file extension include the dot
     * @property {Number}       numberOfImages    The number of images
     */
    constructor({ element, imagePath, filePrefix = 'img', fileExtension = '.jpg', numberOfImages = 36 }) {
        super()

        // assign props
        Object.assign(this, { imagePath, filePrefix, fileExtension, numberOfImages })
        this.$element = element
        this.images = [...Array(numberOfImages).keys()].map(i => {
            const filename = `${filePrefix}${leftPad(i + 1, 2, '0')}${fileExtension}`
            return path.join(imagePath, filename)
        })

        // add class to container element
        this.$element.classList.add('product-viewer')

        // load images and setup
        Promise.all(this.images.map(image => loadImage(image)))
            .then(() => this.setup())
            .catch((err) => { throw err })
    }

    /**
     * Setup program
     */
    setup() {

        // bind methods
        this.onPress = this.onPress.bind(this)
        this.onRelease = this.onRelease.bind(this)
        this.onMove = this.onMove.bind(this)
        this.updateIndex = this.updateIndex.bind(this)

        // set element handlers
        this.$element.addEventListener('mousedown', this.onPress, false)
        this.$element.addEventListener('touchstart', this.onPress, false)

        // set document handlers
        document.addEventListener('mouseup', this.onRelease, false)
        document.addEventListener('touchend', this.onRelease, false)
        document.addEventListener('mousemove', this.onMove, false)
        document.addEventListener('touchmove', this.onMove, false)

        // create image node and append to $element
        this.$image = new Image()
        this.$image.src = this.images[0]
        this.$image.classList.add('product-viewer__image')
        this.$element.appendChild(this.$image)
        this.emit('loaded')
    }

    /**
     * Press handler
     */
    onPress(e) {
        // prevent scrolling when pressed
        e.preventDefault()

        // set drag flag
        this.dragging = true
        this.emit('press')

        // add active press class
        this.$element.classList.add('product-viewer--js-press-active')

        // set press values
        this.pressMouseX = this._getPageXByEvent(e)
        this.pressIndex = this.index
    }

    /**
     * Release handler
     */
    onRelease() {
        // unset drag flag
        this.dragging = false
        this.emit('release', {index: this.index, image: this.images[this.index]})

        // unset press values
        this.pressMouseX = null

        // remove active press class
        this.$element.classList.remove('product-viewer--js-press-active')
    }

    /**
     * Animate 360 rotation
     *
     * @param {Number}      duration
     * @param {Function}    ease
     * @public
     */
    animate360(duration = 1000, ease = ProductViewer.easings.EASE_OUT) {
        const startIndex = this.index

        let c = 0
        this.animateInterval = setInterval(() => {
            c += 1
            if (c === this.numberOfImages) {
                clearInterval(this.animateInterval)
            }

            const easeValue = ease(c / this.numberOfImages)
            const newIndex = (startIndex + Math.floor(c * easeValue)) % this.numberOfImages
            this.updateIndex(newIndex)
        }, duration / this.numberOfImages)
    }

    /**
     * Destroy instance
     */
    destroy() {
        // cleanup element handlers
        this.$element.removeEventListener('mousedown', this.onPress, false)
        this.$element.removeEventListener('touchstart', this.onPress, false)

        // cleanup document handlers
        document.removeEventListener('mouseup', this.onRelease, false)
        document.removeEventListener('touchend', this.onRelease, false)
        document.removeEventListener('mousemove', this.onMove, false)
        document.removeEventListener('touchmove', this.onMove, false)

        // remove image from stage
        this.$element.removeChild(this.$image)
        this.emit('destroyed')
    }

    /**
     * Get pageX property from event
     *
     * @param   {MouseEvent|TouchEvent} e
     * @returns {Number}
     * @private
     */
    _getPageXByEvent(e) {
        return !!e.touches ? e.touches[0].pageX : e.pageX
    }

    /**
     * Update index
     *
     * @param {Number} index
     * @returns {Boolean|void}
     * @private
     */
    updateIndex(index) {
        // bail if index if the same
        if (this.index === index) return false

        this.index = index
        this.$image.src = this.images[index]
        this.emit('index', index)
    }

    /**
     * Move handler
     *
     * @returns {Boolean|void}
     */
    onMove(e) {
        // bail if is not dragging
        if (!this.dragging) return true

        // clear interval
        if (this.animateInterval) {
            clearInterval(this.animateInterval)
            this.animateInterval = null
        }

        const offsetX = this._getPageXByEvent(e) - (this.pressMouseX || 0)
        const indexPerPixel = this.numberOfImages / this.$element.offsetWidth

        // get number of indexes to shift
        let offsetIndex = Math.round(offsetX * indexPerPixel) % this.numberOfImages

        // negative rotation direction for improve feeling
        if (this.invertMovement) {
            offsetIndex *= -1
        }

        // calculate new index
        let newIndex = (this.pressIndex + offsetIndex) % this.numberOfImages
        newIndex = newIndex < 0 ? this.numberOfImages - Math.abs(newIndex) : newIndex

        // update index
        this.updateIndex(newIndex)
        this.emit('delta', {x: offsetX, numberOfImages: this.numberOfImages, offsetIndex})
    }
}

// append to global namespace
window.ProductViewer = ProductViewer

export default ProductViewer