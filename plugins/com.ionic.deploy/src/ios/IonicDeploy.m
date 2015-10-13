#import "IonicDeploy.h"
#import <Cordova/CDV.h>
#import "UNIRest.h"
#import "SSZipArchive.h"
#import "IonicConstant.h"

@interface IonicDeploy()

@property (nonatomic) NSURLConnection *connectionManager;
@property (nonatomic) NSMutableData *downloadedMutableData;
@property (nonatomic) NSURLResponse *urlResponse;

@property int progress;
@property NSString *callbackId;
@property NSString *appId;
@property NSString *channel_tag;
@property NSDictionary *last_update;
@property Boolean ignore_deploy; 
@property NSString *version_label;
@property NSString *currentUUID;
@property dispatch_queue_t serialQueue;
@property NSString *cordova_js_resource;

@end

static NSOperationQueue *delegateQueue;

typedef struct JsonHttpResponse {
    __unsafe_unretained NSString *message;
    __unsafe_unretained NSDictionary *json;
    Boolean *error;
} JsonHttpResponse;

@implementation IonicDeploy

- (void) pluginInitialize {
    NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
    self.cordova_js_resource = [[NSBundle mainBundle] pathForResource:@"www/cordova" ofType:@"js"];
    self.serialQueue = dispatch_queue_create("Deploy Plugin Queue", NULL);
    self.version_label = [prefs stringForKey:@"ionicdeploy_version_label"];
    if(self.version_label == nil) {
        self.version_label = NO_DEPLOY_LABEL;
    }
    [self initVersionChecks];
}

- (NSString *) getUUID {
    NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
    NSString *uuid = [prefs stringForKey:@"uuid"];
    if(uuid == nil) {
        uuid = NO_DEPLOY_LABEL;
    }
    return uuid;
}

- (NSArray *) deconstructVersionLabel: (NSString *) label {
    return [label componentsSeparatedByString:@":"];
}

- (NSString *) constructVersionLabel: (NSString *) uuid {
    NSString *version = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleShortVersionString"];
    NSFileManager* fm = [NSFileManager defaultManager];
    NSDictionary* attrs = [fm attributesOfItemAtPath:self.cordova_js_resource error:nil];

    if (attrs != nil) {
        NSDate *date = (NSDate*)[attrs objectForKey: NSFileCreationDate];
        int int_timestamp = [date timeIntervalSince1970];
        NSString *timestamp = [NSString stringWithFormat:@"%d", int_timestamp];
        return [NSString stringWithFormat:@"%@:%@:%@", version, timestamp, uuid];
    }
    return NO_DEPLOY_LABEL;
}

- (void) updateVersionLabel: (NSString *)ignore_version {
    NSLog(@"updating version label");
    NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
    NSString *ionicdeploy_version_label = [self constructVersionLabel:[self getUUID]];
    [prefs setObject:ionicdeploy_version_label forKey: @"ionicdeploy_version_label"];
    [prefs setObject:ignore_version forKey: @"ionicdeploy_version_ignore"];
    [prefs synchronize];
    self.version_label = ionicdeploy_version_label;
}

- (void) initVersionChecks {
    NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
    NSString *uuid = [self getUUID];
    NSString *ionicdeploy_version_label = [self constructVersionLabel:uuid];

    NSLog(@"VERSION LABEL: %@", ionicdeploy_version_label);

    if(![ionicdeploy_version_label isEqualToString: NO_DEPLOY_LABEL]) {
        if(![self.version_label isEqualToString: ionicdeploy_version_label]) {
            self.ignore_deploy = true;
            [self updateVersionLabel:uuid];
            [prefs setObject: @"" forKey: @"uuid"];
            [prefs synchronize];
        }
    }
}

- (void) onReset {
    // redirect to latest deploy
    [self doRedirect];
}

- (void) check:(CDVInvokedUrlCommand *)command {
    self.appId = [command.arguments objectAtIndex:0];
    self.channel_tag = [command.arguments objectAtIndex:1];

    if([self.appId isEqual: @"YOUR_APP_ID"]) {
        [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Please set your app id in app.js for YOUR_APP_ID before using $ionicDeploy"] callbackId:command.callbackId];
        return;
    }

    dispatch_async(self.serialQueue, ^{
        CDVPluginResult* pluginResult = nil;

        NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];

        NSString *our_version = [[NSUserDefaults standardUserDefaults] objectForKey:@"uuid"];

        JsonHttpResponse result = [self postDeviceDetails];

        NSLog(@"Response: %@", result.message);

        if(result.json != nil) {
            NSNumber *compatible = [result.json valueForKey:@"compatible_binary"];
            NSNumber *update_available = [result.json objectForKey:@"update_available"];
            NSString *ignore_version = [prefs objectForKey:@"ionicdeploy_version_ignore"];

            NSLog(@"compatible: %@", (compatible) ? @"True" : @"False");
            NSLog(@"available: %@", (update_available) ? @"True" : @"False");

            if (compatible != [NSNumber numberWithBool:YES]) {
                NSLog(@"Refusing update due to incompatible binary version");
            } else if(update_available == [NSNumber numberWithBool: YES]) {
                NSDictionary *update = [result.json objectForKey:@"update"];
                NSString *update_uuid = [update objectForKey:@"uuid"];

                NSLog(@"update uuid: %@", update_uuid);

                if(![update_uuid isEqual:ignore_version] && ![update_uuid isEqual:our_version]) {
                    [prefs setObject: update_uuid forKey: @"upstream_uuid"];
                    [prefs synchronize];
                    self.last_update = result.json;
                } else {
                  update_available = 0;
                }
            }

            if (update_available == [NSNumber numberWithBool:YES]) {
                NSLog(@"update is true");
                pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@"true"];
            } else {
                NSLog(@"update is false");
                pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@"false"];
            }
        } else {
            NSLog(@"unable to check for updates");
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@"false"];
        }

        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];

    });
}

- (void) download:(CDVInvokedUrlCommand *)command {
    self.appId = [command.arguments objectAtIndex:0];

    dispatch_async(self.serialQueue, ^{
        // Save this to a property so we can have the download progress delegate thing send
        // progress update callbacks
        self.callbackId = command.callbackId;

        NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];

        NSString *upstream_uuid = [[NSUserDefaults standardUserDefaults] objectForKey:@"upstream_uuid"];

        NSLog(@"Upstream UUID: %@", upstream_uuid);

        if (upstream_uuid != nil && [self hasVersion:upstream_uuid]) {
            // Set the current version to the upstream version (we already have this version)
            [prefs setObject:upstream_uuid forKey:@"uuid"];
            [prefs synchronize];

            NSLog(@"redirect");

            [self doRedirect];
        } else {
            NSDictionary *result = self.last_update;
            NSDictionary *update = [result objectForKey:@"update"];
            NSString *download_url = [update objectForKey:@"url"];

            NSLog(@"update is: %@", update);
            NSLog(@"download url is: %@", download_url);

            self.downloadManager = [[DownloadManager alloc] initWithDelegate:self];

            NSURL *url = [NSURL URLWithString:download_url];

            NSArray *paths = NSSearchPathForDirectoriesInDomains(NSApplicationSupportDirectory, NSUserDomainMask, YES);
            NSString *libraryDirectory = [paths objectAtIndex:0];
            NSString *filePath = [NSString stringWithFormat:@"%@/%@", libraryDirectory,@"www.zip"];

            NSLog(@"Queueing Download...");
            [self.downloadManager addDownloadWithFilename:filePath URL:url];
        }
    });
}

- (void) extract:(CDVInvokedUrlCommand *)command {
    self.appId = [command.arguments objectAtIndex:0];

    dispatch_async(self.serialQueue, ^{
        self.callbackId = command.callbackId;


        self.ignore_deploy = false;

        NSArray *paths = NSSearchPathForDirectoriesInDomains(NSApplicationSupportDirectory, NSUserDomainMask, YES);
        NSString *libraryDirectory = [paths objectAtIndex:0];

        NSString *uuid = [[NSUserDefaults standardUserDefaults] objectForKey:@"uuid"];

        NSString *filePath = [NSString stringWithFormat:@"%@/%@", libraryDirectory, @"www.zip"];
        NSString *extractPath = [NSString stringWithFormat:@"%@/%@/", libraryDirectory, uuid];

        NSLog(@"Path for zip file: %@", filePath);

        NSLog(@"Unzipping...");

        [SSZipArchive unzipFileAtPath:filePath toDestination:extractPath delegate:self];
        [self updateVersionLabel:NOTHING_TO_IGNORE];
        BOOL success = [[NSFileManager defaultManager] removeItemAtPath:filePath error:nil];
        NSLog(@"Unzipped...");
        NSLog(@"Removing www.zip %d", success);
    });
}

- (void) redirect:(CDVInvokedUrlCommand *)command {
    self.appId = [command.arguments objectAtIndex:0];

    CDVPluginResult* pluginResult = nil;

    [self doRedirect];

    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void) info:(CDVInvokedUrlCommand *)command {
    NSMutableDictionary *json = [[NSMutableDictionary alloc] init];
    NSString *uuid = [self getUUID];
    if ([uuid isEqualToString:@""]) {
        uuid = NO_DEPLOY_LABEL;
    }
    [json setObject:uuid forKey:@"deploy_uuid"];
    [json setObject:[[self deconstructVersionLabel:self.version_label] firstObject] forKey:@"binary_version"];
    [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:json] callbackId:command.callbackId];
}


- (void) doRedirect {
    NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
    NSString *uuid = [[NSUserDefaults standardUserDefaults] objectForKey:@"uuid"];
    NSString *ignore = [prefs stringForKey:@"ionicdeploy_version_ignore"];
    if (ignore == nil) {
        ignore = NOTHING_TO_IGNORE;
    } 
    NSLog(@"uuid is: %@", uuid);
    if (self.ignore_deploy) {
       NSLog(@"ignore deploy");
    }
    NSLog(@"ignore version: %@", ignore);
    if (![uuid isEqualToString:@""] && !self.ignore_deploy && ![uuid isEqualToString:ignore]) {

        dispatch_async(self.serialQueue, ^{
        if ( uuid != nil && ![self.currentUUID isEqualToString: uuid] ) {
            NSArray *paths = NSSearchPathForDirectoriesInDomains(NSApplicationSupportDirectory, NSUserDomainMask, YES);
            NSString *libraryDirectory = [paths objectAtIndex:0];


            NSString *query = [NSString stringWithFormat:@"cordova_js_bootstrap_resource=%@", self.cordova_js_resource];
            
            NSURLComponents *components = [NSURLComponents new];
            components.scheme = @"file";
            components.path = [NSString stringWithFormat:@"%@/%@/index.html", libraryDirectory, uuid];
            components.query = query;

            self.currentUUID = uuid;

            NSLog(@"Redirecting to: %@", components.URL.absoluteString);
            [self.webView loadRequest: [NSURLRequest requestWithURL:components.URL] ];
        }
        });
    }
}

- (struct JsonHttpResponse) postDeviceDetails {
    NSString *baseUrl = @"https://apps.ionic.io";
    NSString *endpoint = [NSString stringWithFormat:@"/api/v1/apps/%@/updates/check/", self.appId];
    NSString *url = [NSString stringWithFormat:@"%@%@", baseUrl, endpoint];
    NSDictionary* headers = @{@"Content-Type": @"application/json", @"accept": @"application/json"};
    NSString *uuid = [[NSUserDefaults standardUserDefaults] objectForKey:@"uuid"];
    NSString *app_version = [[self deconstructVersionLabel:self.version_label] firstObject];

    if (uuid == nil) {
        uuid = @"";
    }

    NSDictionary *parameters = @{
        @"device_app_version": app_version,
        @"device_deploy_uuid": uuid,
        @"device_platform": @"ios",
        @"channel_tag": self.channel_tag
    };


    UNIHTTPJsonResponse *result = [[UNIRest postEntity:^(UNIBodyRequest *request) {
      [request setUrl:url];
      [request setHeaders:headers];
      [request setBody:[NSJSONSerialization dataWithJSONObject:parameters options:0 error:nil]];
    }] asJson];

    NSLog(@"version is: %@", app_version);
    NSLog(@"uuid is: %@", uuid);
    NSLog(@"channel is: %@", self.channel_tag);

    JsonHttpResponse response;
    NSError *jsonError = nil;

    @try {
        response.message = nil;
        response.json = [result.body JSONObject];
    }
    @catch (NSException *exception) {
        response.message = exception.reason;
        NSLog(@"JSON Error: %@", jsonError);
        NSLog(@"Exception: %@", exception.reason);
    }
    @finally {
        NSLog(@"In Finally");
        NSLog(@"JSON Error: %@", jsonError);

        if (jsonError != nil) {
            response.message = [NSString stringWithFormat:@"%@", [jsonError localizedDescription]];
            response.json = nil;
        }
    }

    return response;
}

- (NSMutableArray *) getMyVersions {
    NSMutableArray *versions;
    NSArray *versionsLoaded = [[NSUserDefaults standardUserDefaults] arrayForKey:@"my_versions"];
    if (versionsLoaded != nil) {
        versions = [versionsLoaded mutableCopy];
    } else {
        versions = [[NSMutableArray alloc] initWithCapacity:5];
    }

    return versions;
}

- (bool) hasVersion:(NSString *) uuid {
    NSArray *versions = [self getMyVersions];

    NSLog(@"Versions: %@", versions);

    for (id version in versions) {
        NSArray *version_parts = [version componentsSeparatedByString:@"|"];
        NSString *version_uuid = version_parts[1];

        NSLog(@"version_uuid: %@, uuid: %@", version_uuid, uuid);
        if ([version_uuid isEqualToString:uuid]) {
            return true;
        }
    }

    return false;
}

- (void) saveVersion:(NSString *) uuid {
    NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
    NSMutableArray *versions = [self getMyVersions];

    int versionCount = (int) [[NSUserDefaults standardUserDefaults] integerForKey:@"version_count"];

    if (versionCount) {
        versionCount += 1;
    } else {
        versionCount = 1;
    }

    [prefs setInteger:versionCount forKey:@"version_count"];
    [prefs synchronize];

    NSString *versionString = [NSString stringWithFormat:@"%i|%@", versionCount, uuid];

    [versions addObject:versionString];

    [prefs setObject:versions forKey:@"my_versions"];
    [prefs synchronize];

    [self cleanupVersions];
}

- (void) cleanupVersions {
    NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
    NSMutableArray *versions = [self getMyVersions];

    int versionCount = (int) [[NSUserDefaults standardUserDefaults] integerForKey:@"version_count"];

    if (versionCount && versionCount > 3) {
        NSInteger threshold = versionCount - 3;

        NSInteger count = [versions count];
        for (NSInteger index = (count - 1); index >= 0; index--) {
            NSString *versionString = versions[index];
            NSArray *version_parts = [versionString componentsSeparatedByString:@"|"];
            NSInteger version_number = [version_parts[0] intValue];
            if (version_number < threshold) {
                [versions removeObjectAtIndex:index];
                [self removeVersion:version_parts[1]];
            }
        }

        NSLog(@"Version Count: %i", (int) [versions count]);
        [prefs setObject:versions forKey:@"my_versions"];
        [prefs synchronize];
    }
}

- (void) removeVersion:(NSString *) uuid {
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSApplicationSupportDirectory, NSUserDomainMask, YES);
    NSString *libraryDirectory = [paths objectAtIndex:0];

    NSString *pathToFolder = [NSString stringWithFormat:@"%@/%@/", libraryDirectory, uuid];

    BOOL success = [[NSFileManager defaultManager] removeItemAtPath:pathToFolder error:nil];

    NSLog(@"Removed Version %@ success? %d", uuid, success);
}

/* Delegate Methods for the DownloadManager */

- (void)downloadManager:(DownloadManager *)downloadManager downloadDidReceiveData:(Download *)download;
{
    // download failed
    // filename is retrieved from `download.filename`
    // the bytes downloaded thus far is `download.progressContentLength`
    // if the server reported the size of the file, it is returned by `download.expectedContentLength`

    self.progress = ((100.0 / download.expectedContentLength) * download.progressContentLength);

    NSLog(@"Download Progress: %.0f%%", ((100.0 / download.expectedContentLength) * download.progressContentLength));

    CDVPluginResult* pluginResult = nil;

    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsInt:self.progress];
    [pluginResult setKeepCallbackAsBool:TRUE];

    [self.commandDelegate sendPluginResult:pluginResult callbackId:self.callbackId];
}

- (void)didFinishLoadingAllForManager:(DownloadManager *)downloadManager
{
    // Save the upstream_uuid (what we just downloaded) to the uuid preference
    NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
    NSString *uuid = [[NSUserDefaults standardUserDefaults] objectForKey:@"uuid"];
    NSString *upstream_uuid = [[NSUserDefaults standardUserDefaults] objectForKey:@"upstream_uuid"];

    [prefs setObject: upstream_uuid forKey: @"uuid"];
    [prefs synchronize];

    NSLog(@"UUID is: %@ and upstream_uuid is: %@", uuid, upstream_uuid);

    [self saveVersion:upstream_uuid];

    NSLog(@"Download Finished...");
    CDVPluginResult* pluginResult = nil;
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@"true"];

    [self.commandDelegate sendPluginResult:pluginResult callbackId:self.callbackId];
}

/* Delegate Methods for SSZipArchive */

- (void)zipArchiveProgressEvent:(NSInteger)loaded total:(NSInteger)total {
    float progress = ((100.0 / total) * loaded);
    NSLog(@"Zip Extraction: %.0f%%", progress);

    CDVPluginResult* pluginResult = nil;

    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsInt:progress];
    [pluginResult setKeepCallbackAsBool:TRUE];

    [self.commandDelegate sendPluginResult:pluginResult callbackId:self.callbackId];

    if (progress == 100) {
        CDVPluginResult* pluginResult = nil;

        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@"done"];

        [self.commandDelegate sendPluginResult:pluginResult callbackId:self.callbackId];
    }
}

@end
