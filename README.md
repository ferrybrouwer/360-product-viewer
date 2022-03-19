# Product Viewer

> A simple 360 degrees product viewer

![preview](https://user-images.githubusercontent.com/4455679/30473734-a1b8a04e-9a01-11e7-930b-3d1fb10797e5.gif)

## Usage

Html:

```html
<!-- product viewer container -->
<div id="pv"></div>

<!-- load product viewer lib -->
<script src="product-viewer.js"></script>

<!-- create instance -->
<script>
	const pv = new ProductViewer({
		element: 		document.getElementById('pv'),
		imagePath: 		'images',
		filePrefix: 	'img',
		fileExtension: '.jpg',
		numberOfImages: 36
	})
</script>
```


## Build

To build the distributed files execute the following command:

```shell
yarn && yarn run build
```

This create a `dist` directory.

## Development

For development you can execute the following command:

```shell
yarn && yarn run watch
```

This will spinup a dev server on `0.0.0.0:8080`.

## Properties

| Property name | Datatype | Property description |
| :------------ | :------- | :------------------- |
| element | HTMLElement | The container to draw the product viewer |
| imagePath | String | The relative path of the images |
| filePrefix | String | The prefix of the file name, for example `img` |
| fileExtension | String | The extension of the file including the dot, for example `.jpg` |
| numberOfImages | Number | The number of images inside `imagePath` |
| invertMovement | Bool | Invert the movement while grabbing (default is `false`) |


## Loading images
The library tries to load images from `imagePath`.
The images to load are of the following format `${imagePath}${filePrefix}${index}${fileExtension}`, where `${index}` is the index + 1 number leftpadded with 1 `'0'`

### Example

```javascript
const pv = new ProductViewer({
	...
	imagePath: 		'images',
	filePrefix: 	'img',
	fileExtension: '.jpg',
	numberOfImages: 4
})
```

Then the library tries to load to following files:

- images/img01.jpg
- images/img02.jpg
- images/img03.jpg
- images/img04.jpg

## Events

### Loaded event

The event `loaded` is dispatched when all images are loaded. This comes in handy for displaying loaders, for example:


```html
<div class="pv-loader"></div>
<div id="pv"></div>

<style>
	.pv-loader {
		background: url('some-loader.gif') no-repeat center center white;
		opacity: 0;
		transition: opacity .4s ease-out;
		pointer-events: none;
	}
	.pv-loader--js-visible {
		opacity: 1;
	}
</style>

<script>
	// create instance
	const pv = new ProductViewer({
		....
	})

	// show loader
	const loader = document.querySelector('.pv-loader')
	loader.classList.add('pv-loader--js-visible')

	// hide loader when images are loaded
	pv.once('loaded', () => loader.classList.remove('pv-loader--js-visible')
</script>
```

### Release event

The event `release` is dispatched when user stops dragging the product. For example to show information when user stops dragging the product when products show the front:

```javascript
pv.on('release', ({index, image}) => {
	if (index > 10 && index < 20) {
		// show some tooltip...
	}
})
```

| Property name | Property type | Property description |
| :------------ | :------------ | :------------------- |
| index | Number | Current image index |
| image | String | Current image relative path |


### Press event

The event `press` is dispatched when user starts dragging the product. For example to stop some other cpu intensive animation on the site:


```javascript
pv.on('press', () => {
	// pause some high cpu intensive operations...
})
```

### Index event

When the index changes the event `index` is being dispatched. This can be useful when you want to take action on index updates while dragging, for example show tooltip while dragging:

```javascript
pv.on('index', ({index, image}) => {
	// show some tooltip...
})
```

| Property name | Property type | Property description |
| :------------ | :------------ | :------------------- |
| index | Number | Current image index |
| image | String | Current image relative path |

### Delta event

To get the offset on the x axis while dragging, you can listen to this event by using the `delta` event. For example when you want to take action when user rotate the product for 180 degrees in one drag action:

```javascript
pv.on('delta', ({x, numberOfImages, offsetIndex}) => {
	if (offsetIndex > numberOfImages / 2) {
		// do some action...
	}
})
```

The callback returns an object which include the following properties:

| Property name | Property type | Property description |
| :------------ | :------------ | :------------------- |
| x | Number | The delta on x position = the difference between x position when user pressed and moved |
| numberOfImages | Number | The total number of images |
| offsetIndex | Number | The number of indexes shift from when user pressed |


## Methods

### animate 360 degrees

To give it a spin of 360 degrees, you can invoke the method `animate360`, for example:

```javascript
pv.animate360(2000)
```

You can set the duration of the animation with the first parameter. This should be in milliseconds. Default the duration is 1000.

The second parameter is the easing, for example:

```javascript
pv.animate360(2000, pv.easings.EASE_OUT)
```

The following ease are available:

- EASE_OUT
- EASE_IN
- EASE
- EASE_IN_OUT
- EASE_LINEAR