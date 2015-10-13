package com.ionic.deploy;

import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.PackageManager.NameNotFoundException;
import android.content.res.AssetManager;
import android.content.SharedPreferences;
import android.os.AsyncTask;
import android.util.Log;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashSet;
import java.util.Set;
import java.util.Iterator;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import java.util.zip.ZipInputStream;

class JsonHttpResponse {
  String message;
  Boolean error;
  JSONObject json;
}


public class IonicDeploy extends CordovaPlugin {
  String server = "https://apps.ionic.io";
  Context myContext = null;
  String app_id = null;
  boolean debug = true;
  SharedPreferences prefs = null;
  CordovaWebView v = null;
  String version_label = null;
  boolean ignore_deploy = false;
  JSONObject last_update;

  public static final String NO_DEPLOY_LABEL = "NO_DEPLOY_LABEL";
  public static final String NO_DEPLOY_AVAILABLE = "NO_DEPLOY_AVAILABLE";
  public static final String NOTHING_TO_IGNORE = "NOTHING_TO_IGNORE";
  public static final int VERSION_AHEAD = 1;
  public static final int VERSION_MATCH = 0;
  public static final int VERSION_BEHIND = -1;

  /**
   * Sets the context of the Command. This can then be used to do things like
   * get file paths associated with the Activity.
   *
   * @param cordova The context of the main Activity.
   * @param webView The CordovaWebView Cordova is running in.
   */
  public void initialize(CordovaInterface cordova, CordovaWebView webView) {
    super.initialize(cordova, webView);
    this.myContext = this.cordova.getActivity().getApplicationContext();
    this.prefs = getPreferences();
    this.v = webView;
    this.version_label = prefs.getString("ionicdeploy_version_label", IonicDeploy.NO_DEPLOY_LABEL);
    this.initVersionChecks();
  }

  private String getUUID() {
    return this.prefs.getString("uuid", IonicDeploy.NO_DEPLOY_AVAILABLE);
  }

  private String getUUID(String defaultUUID) {
    return this.prefs.getString("uuid", defaultUUID);
  }

  private PackageInfo getAppPackageInfo() throws NameNotFoundException {
    PackageManager packageManager = this.cordova.getActivity().getPackageManager();
    PackageInfo packageInfo = packageManager.getPackageInfo(this.cordova.getActivity().getPackageName(), 0);
    return packageInfo;
  }

  private void initVersionChecks() {
    String ionicdeploy_version_label = IonicDeploy.NO_DEPLOY_LABEL;
    String uuid = this.getUUID();

    try {
      ionicdeploy_version_label = this.constructVersionLabel(this.getAppPackageInfo(), uuid);
    } catch (NameNotFoundException e) {
      logMessage("INIT", "Could not get package info");
    }

    if(!ionicdeploy_version_label.equals(IonicDeploy.NO_DEPLOY_LABEL)) {
      if(this.debug) {
        logMessage("INIT", "Version Label 1: " + this.version_label);
        logMessage("INIT", "Version Label 2: " + ionicdeploy_version_label);
      }
      if(!this.version_label.equals(ionicdeploy_version_label)) {
        this.ignore_deploy = true;
        this.updateVersionLabel(uuid);
        this.prefs.edit().remove("uuid").apply();
      }
    }
  }

  private String constructVersionLabel(PackageInfo packageInfo, String uuid) {
    String version = packageInfo.versionName;
    String timestamp = String.valueOf(packageInfo.lastUpdateTime);
    return version + ":" + timestamp + ":" + uuid;
  }

  private String[] deconstructVersionLabel(String label) {
    return label.split(":");
  }

  public Object onMessage(String id, Object data) {
    boolean is_nothing = "file:///".equals(String.valueOf(data));
    boolean is_index = "file:///android_asset/www/index.html".equals(String.valueOf(data));
    boolean is_original = (is_nothing || is_index) ? true : false;

    if("onPageStarted".equals(id) && is_original) {
      final String uuid = this.getUUID();

      if(!IonicDeploy.NO_DEPLOY_AVAILABLE.equals(uuid)) {
        logMessage("LOAD", "Init Deploy Version");
        this.redirect(uuid, false);
      }
    }
    return null;
  }

  /**
   * Executes the request and returns PluginResult.
   *
   * @param action            The action to execute.
   * @param args              JSONArry of arguments for the plugin.
   * @param callbackContext   The callback id used when calling back into JavaScript.
   * @return                  True if the action was valid, false if not.
   */
  public boolean execute(String action, JSONArray args, final CallbackContext callbackContext) throws JSONException {

    this.app_id = args.getString(0);
    this.prefs = getPreferences();

    initApp(args.getString(0));
    
    final SharedPreferences prefs = this.prefs;

    if (action.equals("initialize")) {
      // No need to do anything here.
      return true;
    } else if (action.equals("check")) {
      logMessage("CHECK", "Checking for updates");
      final String channel_tag = args.getString(1);
      cordova.getThreadPool().execute(new Runnable() {
        public void run() {
          checkForUpdates(callbackContext, channel_tag);
        }
      });
      return true;
    } else if (action.equals("download")) {
      logMessage("DOWNLOAD", "Downloading updates");
      cordova.getThreadPool().execute(new Runnable() {
        public void run() {
          downloadUpdate(callbackContext);
        }
      });
      return true;
    } else if (action.equals("extract")) {
      logMessage("EXTRACT", "Extracting update");
      final String uuid = this.getUUID("");
      cordova.getThreadPool().execute(new Runnable() {
        public void run() {
          unzip("www.zip", uuid, callbackContext);
        }
      });
      return true;
    } else if (action.equals("redirect")) {
      final String uuid = this.getUUID("");
      this.redirect(uuid, true);
      return true;
    } else if (action.equals("info")) {
      this.info(callbackContext);
      return true;
    } else {
      return false;
    }
  }

  private void info(CallbackContext callbackContext) {
    JSONObject json = new JSONObject();

    try {
      json.put("deploy_uuid", this.getUUID());
      json.put("binary_version", this.deconstructVersionLabel(this.version_label)[0]);
    } catch (JSONException e) {
      callbackContext.error("Unable to gather deploy info: " + e.toString());
    }

    callbackContext.success(json);
  }

  private void initApp(String app_id) {
    this.app_id = app_id;
    SharedPreferences prefs = this.prefs;

    prefs.edit().putString("app_id", this.app_id).apply();
    // Used for keeping track of the order versions were downloaded
    int version_count = prefs.getInt("version_count", 0);
    prefs.edit().putInt("version_count", version_count).apply();
  }

  private void checkForUpdates(CallbackContext callbackContext, final String channel_tag) {

    this.last_update = null;
    String ignore_version = this.prefs.getString("ionicdeploy_version_ignore", "");
    String deployed_version = this.prefs.getString("uuid", "");
    String loaded_version = this.prefs.getString("loaded_uuid", "");
    JsonHttpResponse response = postDeviceDetails(deployed_version, channel_tag);

    try {
      if (response.json != null) {
        Boolean compatible = Boolean.valueOf(response.json.getString("compatible_binary"));
        Boolean updatesAvailable = Boolean.valueOf(response.json.getString("update_available"));

        if(!compatible) {
          logMessage("CHECK", "Refusing update due to incompatible binary version");
        } else if(updatesAvailable) {
          try {
            JSONObject update = response.json.getJSONObject("update");
            String update_uuid = update.getString("uuid");
            if(!update_uuid.equals(ignore_version) && !update_uuid.equals(loaded_version)) {
              prefs.edit().putString("upstream_uuid", update_uuid).apply();
              this.last_update = update;
            } else {
              updatesAvailable = new Boolean(false);
            }
            
          } catch (JSONException e) {
            callbackContext.error("Update information is not available");
          }
        }

        if(updatesAvailable && compatible) {
          callbackContext.success("true");
        } else {
          callbackContext.success("false");
        }
      } else {
        logMessage("CHECK", "Unable to check for updates.");
        callbackContext.success("false");
      }
    } catch (JSONException e) {
      logMessage("CHECK", e.toString());
      callbackContext.error("Error checking for updates.");
    }
  }

  private void downloadUpdate(CallbackContext callbackContext) {
    String upstream_uuid = this.prefs.getString("upstream_uuid", "");
    if (upstream_uuid != "" && this.hasVersion(upstream_uuid)) {
      // Set the current version to the upstream uuid
      prefs.edit().putString("uuid", upstream_uuid).apply();
      callbackContext.success("false");
    } else {
      try {
          String url = this.last_update.getString("url");
          final DownloadTask downloadTask = new DownloadTask(this.myContext, callbackContext);
          downloadTask.execute(url);
      } catch (JSONException e) {
        logMessage("DOWNLOAD", e.toString());
        callbackContext.error("Error fetching download");
      }
    }
  }

  /**
   * Get a list of versions that have been downloaded
   *
   * @return
   */
  private Set<String> getMyVersions() {
    SharedPreferences prefs = this.prefs;
    return prefs.getStringSet("my_versions", new HashSet<String>());
  }

  /**
   * Check to see if we already have the version to be downloaded
   *
   * @param uuid
   * @return
   */
  private boolean hasVersion(String uuid) {
    Set<String> versions = this.getMyVersions();

    logMessage("HASVER", "Checking " + uuid + "...");
    for (String version : versions) {
      String[] version_string = version.split("\\|");
      logMessage("HASVER", version_string[0] + " == " + uuid);
      if (version_string[0].equals(uuid)) {
        logMessage("HASVER", "Yes");
        return true;
      }
    }

    logMessage("HASVER", "No");
    return false;
  }

  /**
   * Save a new version string to our list of versions
   *
   * @param uuid
   */
  private void saveVersion(String uuid) {
    SharedPreferences prefs = this.prefs;

    Integer version_count = prefs.getInt("version_count", 0) + 1;
    prefs.edit().putInt("version_count", version_count).apply();

    uuid = uuid + "|" + version_count.toString();

    Set<String> versions = this.getMyVersions();

    versions.add(uuid);

    prefs.edit().putStringSet("my_versions", versions).apply();

    this.cleanupVersions();
  }

  private void cleanupVersions() {
    // Let's keep 5 versions around for now
    SharedPreferences prefs = this.prefs;

    int version_count = prefs.getInt("version_count", 0);
    Set<String> versions = this.getMyVersions();

    if (version_count > 3) {
      int threshold = version_count - 3;

      for (Iterator<String> i = versions.iterator(); i.hasNext();) {
        String version = i.next();
        String[] version_string = version.split("\\|");
        logMessage("VERSION", version);
        int version_number = Integer.parseInt(version_string[1]);
        if (version_number < threshold) {
          logMessage("REMOVING", version);
          i.remove();
          removeVersion(version_string[0]);
        }
      }

      Integer version_c = versions.size();
      logMessage("VERSIONCOUNT", version_c.toString());
      prefs.edit().putStringSet("my_versions", versions).apply();
    }
  }

  /**
   * Ugly, lazy bit of code to whack old version directories...
   *
   * @param uuid
   */
  private void removeVersion(String uuid) {
    File versionDir = this.myContext.getDir(uuid, Context.MODE_PRIVATE);

    if (versionDir.exists()) {
      String deleteCmd = "rm -r " + versionDir.getAbsolutePath();
      Runtime runtime = Runtime.getRuntime();
      try {
        runtime.exec(deleteCmd);
      } catch (IOException e) {
        logMessage("REMOVE", "Failed to remove " + uuid + ". Error: " + e.getMessage());
      }
    }
  }

  private JsonHttpResponse postDeviceDetails(String uuid, final String channel_tag) {

    String endpoint = "/api/v1/apps/" + this.app_id + "/updates/check/";
    JsonHttpResponse response = new JsonHttpResponse();
    JSONObject json = new JSONObject();

    try {
      json.put("device_app_version", this.deconstructVersionLabel(this.version_label)[0]);
      json.put("device_deploy_uuid", uuid);
      json.put("device_platform", "android");
      json.put("channel_tag", channel_tag);

      String params = json.toString();
      byte[] postData = params.getBytes("UTF-8");
      int postDataLength = postData.length;

      URL url = new URL(this.server + endpoint);
      HttpURLConnection conn = (HttpURLConnection) url.openConnection();
      
      conn.setDoOutput(true);
      conn.setRequestMethod("POST");
      conn.setRequestProperty("Content-Type", "application/json");
      conn.setRequestProperty("Accept", "application/json");
      conn.setRequestProperty("Charset", "utf-8");
      conn.setRequestProperty("Content-Length", Integer.toString(postDataLength));

      DataOutputStream wr = new DataOutputStream(conn.getOutputStream());
      wr.write( postData );

      InputStream in = new BufferedInputStream(conn.getInputStream());
      String result = readStream(in);

      JSONObject jsonResponse = new JSONObject(result);

      response.json = jsonResponse;
    } catch (JSONException e) {
      response.error = true;
    } catch (MalformedURLException e) {
      response.error = true;
    } catch (IOException e) {
      response.error = true;
    }

    return response;
  }

  private SharedPreferences getPreferences() {
    // Request shared preferences for this app id
    SharedPreferences prefs = this.myContext.getSharedPreferences("com.ionic.deploy.preferences", Context.MODE_PRIVATE);
    return prefs;
  }

  private String readStream(InputStream is) {
    try {
      ByteArrayOutputStream bo = new ByteArrayOutputStream();
      int i = is.read();
      while(i != -1) {
        bo.write(i);
        i = is.read();
      }
      return bo.toString();
    } catch (IOException e) {
      return "";
    }
  }

  private void logMessage(String tag, String message) {
    if (this.debug == true) {
      Log.i("IONIC.DEPLOY." + tag, message);
    }
  }

  private void updateVersionLabel(String ignore_version) {
    try {
      String ionicdeploy_version_label = this.constructVersionLabel(this.getAppPackageInfo(), this.getUUID());
      this.prefs.edit().putString("ionicdeploy_version_label", ionicdeploy_version_label).apply();
      this.version_label = prefs.getString("ionicdeploy_version_label", IonicDeploy.NO_DEPLOY_LABEL);
      this.prefs.edit().putString("ionicdeploy_version_ignore", ignore_version).apply();
    } catch (NameNotFoundException e) {
      logMessage("LABEL", "Could not get package info");
    }
  }

  /**
   * Extract the downloaded archive
   *
   * @param zip
   * @param location
   */
  private void unzip(String zip, String location, CallbackContext callbackContext) {
    SharedPreferences prefs = getPreferences();
    String upstream_uuid = prefs.getString("upstream_uuid", "");

    logMessage("UNZIP", upstream_uuid);

    this.ignore_deploy = false;
    this.updateVersionLabel(IonicDeploy.NOTHING_TO_IGNORE);

    if (upstream_uuid != "" && this.hasVersion(upstream_uuid)) {
      callbackContext.success("done"); // we have already extracted this version
      return;
    }

    try  {
      FileInputStream inputStream = this.myContext.openFileInput(zip);
      ZipInputStream zipInputStream = new ZipInputStream(inputStream);
      ZipEntry zipEntry = null;

      // Get the full path to the internal storage
      String filesDir = this.myContext.getFilesDir().toString();

      // Make the version directory in internal storage
      File versionDir = this.myContext.getDir(location, Context.MODE_PRIVATE);

      logMessage("UNZIP_DIR", versionDir.getAbsolutePath().toString());

      // Figure out how many entries are in the zip so we can calculate extraction progress
      ZipFile zipFile = new ZipFile(this.myContext.getFileStreamPath(zip).getAbsolutePath().toString());
      float entries = new Float(zipFile.size());

      logMessage("ENTRIES", "Total: " + (int) entries);

      float extracted = 0.0f;

      while ((zipEntry = zipInputStream.getNextEntry()) != null) {
        File newFile = new File(versionDir + "/" + zipEntry.getName());
        newFile.getParentFile().mkdirs();

        byte[] buffer = new byte[2048];

        FileOutputStream fileOutputStream = new FileOutputStream(newFile);
        BufferedOutputStream outputBuffer = new BufferedOutputStream(fileOutputStream, buffer.length);
        int bits;
        while((bits = zipInputStream.read(buffer, 0, buffer.length)) != -1) {
          outputBuffer.write(buffer, 0, bits);
        }

        zipInputStream.closeEntry();
        outputBuffer.flush();
        outputBuffer.close();

        extracted += 1;

        float progress = (extracted / entries) * new Float("100.0f");
        logMessage("EXTRACT", "Progress: " + (int) progress + "%");

        PluginResult progressResult = new PluginResult(PluginResult.Status.OK, (int) progress);
        progressResult.setKeepCallback(true);
        callbackContext.sendPluginResult(progressResult);
      }
      zipInputStream.close();

    } catch(Exception e) {
      //TODO Handle problems..
      logMessage("UNZIP_STEP", "Exception: " + e.getMessage());
    }

    // Save the version we just downloaded as a version on hand
    saveVersion(upstream_uuid);

    String wwwFile = this.myContext.getFileStreamPath(zip).getAbsolutePath().toString();
    if (this.myContext.getFileStreamPath(zip).exists()) {
      String deleteCmd = "rm -r " + wwwFile;
      Runtime runtime = Runtime.getRuntime();
      try {
        runtime.exec(deleteCmd);
        logMessage("REMOVE", "Removed www.zip");
      } catch (IOException e) {
        logMessage("REMOVE", "Failed to remove " + wwwFile + ". Error: " + e.getMessage());
      }
    }

    callbackContext.success("done");
  }


  private void redirect(final String uuid, final boolean recreatePlugins) {
    String ignore = this.prefs.getString("ionicdeploy_version_ignore", IonicDeploy.NOTHING_TO_IGNORE);
    if (!uuid.equals("") && !this.ignore_deploy && !uuid.equals(ignore)) {
      prefs.edit().putString("uuid", uuid).apply();
      final File versionDir = this.myContext.getDir(uuid, Context.MODE_PRIVATE);
      final String deploy_url = versionDir.toURI() + "index.html";

      cordova.getActivity().runOnUiThread(new Runnable() {
        @Override
        public void run() {
          logMessage("REDIRECT", "Loading deploy version: " + uuid);
          prefs.edit().putString("loaded_uuid", uuid).apply();
          webView.loadUrlIntoView(deploy_url, recreatePlugins);
        }
      });
    }
  }

  private class DownloadTask extends AsyncTask<String, Integer, String> {
    private Context myContext;
    private CallbackContext callbackContext;

    public DownloadTask(Context context, CallbackContext callbackContext) {
      this.myContext = context;
      this.callbackContext = callbackContext;
    }

    @Override
    protected String doInBackground(String... sUrl) {
      InputStream input = null;
      FileOutputStream output = null;
      HttpURLConnection connection = null;
      try {
        URL url = new URL(sUrl[0]);
        connection = (HttpURLConnection) url.openConnection();
        connection.connect();

        // expect HTTP 200 OK, so we don't mistakenly save error report
        // instead of the file
        if (connection.getResponseCode() != HttpURLConnection.HTTP_OK) {
          return "Server returned HTTP " + connection.getResponseCode()
              + " " + connection.getResponseMessage();
        }

        // this will be useful to display download percentage
        // might be -1: server did not report the length
        float fileLength = new Float(connection.getContentLength());

        logMessage("DOWNLOAD", "File size: " + fileLength);

        // download the file
        input = connection.getInputStream();
        output = this.myContext.openFileOutput("www.zip", Context.MODE_PRIVATE);

        byte data[] = new byte[4096];
        float total = 0;
        int count;
        while ((count = input.read(data)) != -1) {
          total += count;

          output.write(data, 0, count);

          // Send the current download progress to a callback
          if (fileLength > 0) {
            float progress = (total / fileLength) * new Float("100.0f");
            logMessage("DOWNLOAD", "Progress: " + (int) progress + "%");
            PluginResult progressResult = new PluginResult(PluginResult.Status.OK, (int) progress);
            progressResult.setKeepCallback(true);
            callbackContext.sendPluginResult(progressResult);
          }
        }
      } catch (Exception e) {
        callbackContext.error("Something failed with the download...");
        return e.toString();
      } finally {
        try {
          if (output != null)
            output.close();
          if (input != null)
            input.close();
        } catch (IOException ignored) {

        }

        if (connection != null)
          connection.disconnect();
      }

      // Request shared preferences for this app id
      SharedPreferences prefs = getPreferences();

      // Set the saved uuid to the most recently acquired upstream_uuid
      String uuid = prefs.getString("upstream_uuid", "");

      prefs.edit().putString("uuid", uuid).apply();

      callbackContext.success("true");
      return null;
    }
  }
}
