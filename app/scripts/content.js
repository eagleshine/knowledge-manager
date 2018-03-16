// Enable chromereload by uncommenting this line:
//import 'chromereload/devonly';

import * as $ from "jquery";

const port = chrome.runtime.connect();
const REST_API_BASE = 'http://resorttransport.corp.ne1.yahoo.com:3001/knoman/api/v1';

function getParameterByName(url, name) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function init() {
    port.onMessage.addListener(function (msg) {
        if (msg.onWebsite || msg.onSearch) {
            let endpoint = '/search';
            if (msg.onWebsite) {
                endpoint = '/website';
            }
            console.log(msg.data);
            $.ajax({
                type: 'POST',
                url: REST_API_BASE + '/node' + endpoint,
                dataType: 'json',
                headers: {
                    authorization: 'JWT ' + msg.token
                },
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(msg.data),
                success: function(data) {
                    if (data) {
                        console.log(JSON.stringify(data));
                    }
                },
                failure: function(errMsg) {
                    console.error(errMsg);
                }
            });
        }
        // if (msg.onHistory) {
        //     console.log('vistItems:');
        //     console.log(msg.data);
        // }
    });
}

function getSearchEngine(url) {
    let pattern = /^.*\.([^.]+)(?=\.com).*$/
    let result = url.match(pattern);
    if (result.length > 0) {
        return result[1];
    }
    return 'Unknown';
}

function isSearchEngine(url) {
    return url === 'https://www.google.com' || 
           url.startsWith('https://notifications.google.com') ||
           url.startsWith('https://search.yahoo.com') ||
           url.startsWith('https://www.bing.com');
}

function sentQueryInfo(url) {
    let query = getParameterByName(url, 'q') || getParameterByName(url, 'p');
    console.log('url:' + url);
    if (!query && !isSearchEngine(url)) {
        console.log('plain website');
        console.log('referer:' + document.referrer);
        // plain website 
        port.postMessage({
            website: true,
            data: {
                referrer: document.referrer,
                domain: new URL(url).hostname,
                url: url
                //timestamp: Math.round((new Date()).getTime() / 1000),
                //label: 'Website'
            }
        })
        return;
    }

    if (!query) {return;}

    console.log("query:" + query);
    let searchEngine = getSearchEngine(url);
    // search portal
    port.postMessage({
        search: true,
        data: {
            engine: searchEngine,
            referrer: document.referrer,
            query: query,
            type: 'web'
            //timestamp: Math.round((new Date()).getTime() / 1000),
            //label: 'Search'
        }
    })
}

function load() {
    init();
    sentQueryInfo(window.location.href);
    // port.postMessage({
    //     history: true,
    //     url: window.location.href
    // })
}

document.addEventListener('DOMContentLoaded', load, false);