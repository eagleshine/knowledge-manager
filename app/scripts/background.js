// Enable chromereload by uncommenting this line:
import 'chromereload/devonly';

chrome.runtime.onInstalled.addListener(function (details) {
  console.log('previousVersion', details.previousVersion);
});

chrome.browserAction.setBadgeText({text: 'KM'});

function init() {
  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.login) {
        chrome.storage.local.set({ profile: request.profile });
      }
    }
  );
}

init();