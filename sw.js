(function() {
    'use strict';

    var CACHE_NAME = 'cache-v1';
    // 缓存资源
    self.addEventListener('install', event => {
      event.waitUntil(
          caches.open(CACHE_NAME)
              .then(cache => cache.addAll([
                  './js/main.js',
                  './css/weui.css',
                  './css/example.css',
                  './data/test.json',
                  './index.html',
                  'pages/404.html',
                  "https://cdn.bootcss.com/weui/0.4.3/style/weui.css",
                  "https://fonts.googleapis.com/css?family=Raleway|Merriweather"
              ]))
      );
    });

    //处理缓存（取缓存，取到返回；否则，请求网络，数据获取成功，则缓存数据并返回；否则，返回404）
    self.addEventListener('fetch', event => {
        // //白名单过滤
        // var matched = matchUrl(whiteListUrls,  event.request.url);
        // var isGET = event.request.method === 'GET';
        // console.log('fetch request url: ' + event.request.url + ", matched: " + matched + ", isGET: " + isGET);
        // if (!matched || !isGET) {
        //     return;
        // }
        event.respondWith(
            caches.match(event.request, { ignoreSearch: true })
                .then(response => {
                    return response || fetchAndCache(event.request)
                })
        );
    });

    function fetchAndCache(request) {
        return fetchRequest(request)
                .then(response => {
                    if (response.status === 404) {
                        return caches.match('pages/404.html');
                    }
                    if (!response.ok) {
                        throw Error("url: " + request.url + ", STATUS: " + response.status + " " + response.statusText + ", type = " + response.type);
                    }
                    return caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(request.url, response.clone());
                                    return response;
                                });
                })
                .catch(error => {
                    console.log('Request failed:', error);
                    //TODO You could return a custom offline 404 page here
                });
    }

    //初始化请求参数，添加跨域头
    var fetchInitParam = {
        mode: 'cors'
    };

    function fetchRequest(request) {
        console.log('fetch request url: ' + request.url);
        if (matchUrl(hostUrls, request.url)) {
          return fetch(request);
        }
        return fetch(request.url, fetchInitParam);
    }

    var hostUrls = [
      '//localhost:8080'
    ];

    var whiteListUrls = [
      '//localhost:8080'
    ];

    //匹配URL
    function matchUrl(urls, requestUrl) {
        if (urls && requestUrl) {
            var url = new URL(requestUrl);
            var protocol = url.href.substr(url.protocol.length);
              return protocol.startsWith(urls);
        }
        return false;
    }

})();