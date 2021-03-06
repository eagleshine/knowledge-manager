// Enable chromereload by uncommenting this line:
//import 'chromereload/devonly';

var lastSearch = {};
var lastURL = {};
var research = '';
var user = {
  name: 'Lorenzai Knoman',
  //email: 'lorenzai.knoman@gmail.com'
  email: ''
};
var token = '';

chrome.runtime.onInstalled.addListener(function (details) {
  console.log('previousVersion', details.previousVersion);
});

chrome.browserAction.setBadgeText({text: 'KM'});

// Need to remove "default_popup": "pages/popup.html" from manifest.json
// for the following to work
// chrome.browserAction.onClicked.addListener(function(tab) { alert('icon clicked')});

function init() {
  chrome.storage.local.get({ user: user, token: ''}, function(result) {
    user = result.user;
    token = result.token;
  });
  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.login) {
        user = request.user;
        token = request.token;
        chrome.storage.local.set({ user: request.user, token: request.token });
        return;
      }
      if (request.mounted) {
        sendResponse({
          token: token,
          user: user
        });
        return;
      }
      if (request.logout) {
        user = request.user;
        token = request.token;
        chrome.storage.local.remove(['user', 'token']);
      }
    }
  );
  chrome.runtime.onConnect.addListener(function (port) {
    port.onMessage.addListener(function(msg) {
        if (msg.search) {
          msg.data.research = research;
          msg.data.lastURL = lastURL;
          lastSearch = {
            query: msg.data.content,
            timestamp: (new Date()).getTime()
          };
          port.postMessage({
            onSearch: true,
            token: token,
            data: msg.data
          })
          return;
        }
        if (msg.website) {
          msg.data.research = research;
          msg.data.search = lastSearch;
          msg.data.lastURL = lastURL;
          lastURL = {
            content: msg.data.url,
            timestamp: (new Date()).getTime()
          };
          port.postMessage({
            onWebsite: true,
            token: token,
            data: msg.data
          })
          return;
        }
        if (msg.history) {
          chrome.history.getVisits({url: msg.url}, function(visitItems) {
            port.postMessage({
              onHistory: true,
              data: visitItems
            })
          });
          return;
        }
    });
  });
  chrome.webRequest.onHeadersReceived.addListener(
    function (details) {
      for (var i = 0; i < details.responseHeaders.length; ++i) {
        if (details.responseHeaders[i].name.toLowerCase() == 'x-frame-options') {
          details.responseHeaders.splice(i, 1);
          return {
            responseHeaders: details.responseHeaders
          };
        }
      }
    }, {
      urls: ["<all_urls>"]
    }, ["blocking", "responseHeaders"]
  );
}

init();