import CodePush from "react-native-code-push";

// This module wraps CodePush API calls to add test message callbacks to every function for simpler test code.

module.exports = {
    checkForUpdate: function(testApp, onSuccess, onError, deploymentKey) {
        return CodePush.checkForUpdate(deploymentKey)
            .then((remotePackage) => {
                return testApp.checkUpdateSuccess(remotePackage).then(() => { return onSuccess && onSuccess(remotePackage); });
            }, (error) => {
                return testApp.checkUpdateError(error).then(() => { return onError && onError(error); });
            });
    },
    
    download: function(testApp, onSuccess, onError, remotePackage) {
        return remotePackage.download()
            .then((localPackage) => {
                return testApp.downloadSuccess(localPackage).then(() => { return onSuccess && onSuccess(localPackage); });
            }, (error) => {
                return testApp.downloadError(error).then(() => { return onError && onError(error); });
            });
    },
    
    install: function(testApp, onSuccess, onError, installMode, minBackgroundDuration, localPackage) {
        return localPackage.install(installMode, minBackgroundDuration)
            .then(() => {
                // Since immediate installs cannot be reliably logged (due to async network calls), we only log "UPDATE_INSTALLED" if it is a resume or restart update.
                if (installMode !== CodePush.InstallMode.IMMEDIATE) return testApp.installSuccess().then(() => { return onSuccess && onSuccess(); });
                return onSuccess && onSuccess();
            }, () => {
                return testApp.installError().then(() => { return onError && onError(); });
            });
    },
    
    checkAndInstall: function(testApp, onSuccess, onError, installMode, minBackgroundDuration) {
        var installUpdate = this.install.bind(this, testApp, onSuccess, onError, installMode, minBackgroundDuration);
        var downloadUpdate = this.download.bind(this, testApp, installUpdate, onError);
        return this.checkForUpdate(testApp, downloadUpdate, onError);
    },
    
    sync: function(testApp, onSyncStatus, onSyncError, options) {
        return CodePush.sync(options)
            .then((status) => {
                return testApp.onSyncStatus(status).then(() => { return onSyncStatus(status); });
            }, (error) => {
                return testApp.onSyncError(error).then(() => { return onSyncError(error); });
            });
    }
}