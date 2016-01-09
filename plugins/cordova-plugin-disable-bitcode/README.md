# cordova-plugin-disable-bitcode

> [Cordova plugin](https://www.npmjs.com/package/cordova-plugin-disable-bitcode) to disable bitcode in iOS build settings.

> Why this plugin ?
Bitcode is not supported in every Cordova plugins and if you're using one of these, you will get something like the following error :
```
You must rebuild it with bitcode enabled (Xcode setting ENABLE_BITCODE), obtain
an updated library from the vendor, or disable bitcode for this target.
for architecture arm64 clang: error: linker command failed with exit code 1
```

> :warning: It's not a solution to disable this setting but a workaround waiting for all your plugins updates.

## Installation
First you need to add dependencies to Cordova and xcode in your project : `npm i -D cordova xcode`.
  
Then Configure this plugin in your `config.xml` file : `<plugin name="cordova-plugin-disable-bitcode" spec="1.2.1" />`
<br/>The bitcode will be disabled after adding your platform.

Or, if your platform is already installed you can simply run : `cordova plugin add cordova-plugin-disable-bitcode`.

## License

MIT © [Alexis Kofman](http://twitter.com/alexiskofman)
