Based on [phaser3-typescript](https://github.com/digitsensitive/phaser3-typescript/).

# Installing

Install the dependencies:

```
npm install
```

# Building and Running

Perform a quick build (bundle.js) and start server:

```
npm run dev
```

# Building for Deployment

```
npm run build
```

Builds to `index.html` and `dist/bundle.js`

------

# How to create levels

## Map layers:
* Create as many layers as needed for 3D functionality in Tiled
* Name each after what its z-index/depth will be (i.e. 0, 2, 4, ...)

## Path:
* Create an array of path tiles (the indices can be seen in the bottom left corner of Tiled): only the tiles necessary for wayfinding need to be listed, not every tile the player will pass through
* Create a src/maps/path{n}.json and add these


## 3Ding path:
* Turn on debug mode in the app
* Find the player t's where the player's z-index/depth needs to change
* Create an array of those and add it to the src/maps/path{n}.json file you created earlier
