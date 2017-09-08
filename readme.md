## [Demo][Demo Page]

Layout images like Flickr.

No absolute positioning, just floats, widths and heights.

Works with both wrapped and plain `img` tags.

Automatically re-layouts on image load and on resize (uses `requestAnimationFrame` to increase performance).

## Usage

```html
<div class="gallery">
	<!-- Plain images -->
	<img src="img/1.jpg" />
	<img src="img/2.jpg" />
	<!-- Wrapped images -->
	<div><img src="img/3.jpg" /></div>
	<a href="img/5.jpg"><img src="img/5.jpg" /></a>
</div>
```

### Vanilla JS

```javascript
new FlickrLayout( document.querySelector( '.gallery' ) );

new FlickrLayout( document.querySelector( '.gallery' ), {
	maxRowHeight: 500,
	gutter: 15,
} );
```

### jQuery

```javascript
$( '.gallery' ).flickrLayout();

$( '.gallery' ).flickrLayout( {
	maxRowHeight: 500,
	gutter: 15,
} );
```

## Options

Setting | Type | Default | Note
-- | -- | -- | --
maxRowHeight | `number` | `400` | Rows will not exceed this height (except for the last row if `expandLastRow` is `true`)
gutter | `number` | `20` | Gap between images (vertical & horizontal)
expandLastRow | `boolean` | `true` | Increase the height of the last row to fill up remaining space
debug | `boolean` | `false` | Log debug messages to console

## Browser Support

If you need it to work with older browsers, change the TypeScript target to `es3` or `es5` and provide polyfills for [Object.assign][Object.assign polyfill] and [Array.from][Array.from polyfill].

[Demo Page]: https://lachlanarthur.github.io/FlickrLayout/demo.html
[Object.assign polyfill]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Polyfill
[Array.from polyfill]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from#Polyfill
