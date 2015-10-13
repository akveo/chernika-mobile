/**
 * Created by vl on 19.5.15.
 */
function VkSdk() {
    // Does nothing
};
VkSdk.prototype.init = function(appId, successCallback, errorCallback) {

    var initializationError = false;

    cordova.exec(sdkListenerCallback, sdkListenerError, "VkSdk", "initVkSdk", [appId]);

    function sdkListenerCallback(result) {
        if (initializationError)
            return;

        if (result.eventType === 'initialized') {
            successCallback && successCallback(result);
        } else {
            var event = document.createEvent('Event');
            event.initEvent('vkSdk.' + result.eventType, true, true);
            event.detail = result.eventData;
            document.dispatchEvent(event);
        }
    }
    function sdkListenerError(err) {
        if (initializationError)
            return;

        if (err.code === 'initError') {
            initializationError = true;
            errorCallback && errorCallback(err);
        } else {
            document.dispatchEvent(new CustomEvent('vkSdk.error', err));
        }
    }
};

/**
 * Listen to 'vkSdk.newToken' event to catch successful login event
 * @param permissions
 */
VkSdk.prototype.initiateLogin = function(permissions) {
    cordova.exec(null, null, "VkSdk", "loginVkSdk", [permissions]);
};

/**
 * Gets user data by id or ids (comma separated). If no ids provided, takes the id of user currently logged in
 * @param userId comma separated list of ids
 */
VkSdk.prototype.getUser = function(userId, successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, 'VkSdk', 'getUser',[userId]);
};

/**
 * Debugging method to get the fingerprint of your application and put it in the field on application admin page
 * @param successCallback
 * @param errorCallback
 */
VkSdk.prototype.getFingerPrintVkSdk = function(successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, "VkSdk", "getFingerPrintVkSdk", []);
};

VkSdk.prototype.logout = function(successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, "VkSdk", "logout");
};

module.exports = new VkSdk();