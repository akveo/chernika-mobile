#cordova-plugin-android-home
Send App in background to Minimize the application and it's still running for android.

Base on [http://stackoverflow.com/questions/17826122/send-application-to-background-mode-when-back-button-is-pressed-in-phonegap](http://stackoverflow.com/questions/17826122/send-application-to-background-mode-when-back-button-is-pressed-in-phonegap).
#Installation
    cordova plugin add https://github.com/ZhichengChen/cordova-plugin-android-home
    
#Usage
 
    navigator.home.home(succesCallback, errorCallback)
    
* **succesCallback**: Callback to invoke when home is success. (*Function*)
* **errorCallback**: Callback to invoke when error occor. (*Function*)



#Example

    navigator.home.home(function(){
        console.info("Successfully launched home intent");
    }, function(){
        console.error("Error launching home intent");
    });
 
#Support Platforms
* Android