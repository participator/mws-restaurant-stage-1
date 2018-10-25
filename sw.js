var cacheName = 'cache-v1';

self.addEventListener('install', function(event) {
    // cache assets
    var urlsToCache = [
        '/',
        '/css/index_responsive.css',
        '/css/restaurant_responsive.css',
        '/css/styles.css',
        '/data/restaurants.json',
        '/img/offline.svg',
        // '/img/1.jpg',
        // '/img/2.jpg',
        // '/img/3.jpg',
        // '/img/4.jpg',
        // '/img/5.jpg',
        // '/img/6.jpg',
        // '/img/7.jpg',
        // '/img/8.jpg',
        // '/img/9.jpg',
        // '/img/10.jpg',
        '/js/apis.js',
        '/js/dbhelper.js',
        '/js/main.js',
        '/js/restaurant_info.js'
    ];

    event.waitUntil(
        caches.open(cacheName).then(function(cache) {
            cache.add('/img/offline.svg');
            console.log('[cached offline.svg]');
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.open(cacheName).then(function(cache) {
            return cache.match(event.request).then(function(response) {
                if (response) {
                    console.log('[cached response]');
                    return response;
                }
                else {
                    return fetch(event.request).then(function(networkResponse) {
                        if (networkResponse) {
                            console.log('[network response]', networkResponse.clone());
                            if (!networkResponse.clone().url.endsWith('.jpg')) {
                                cache.put(event.request, networkResponse.clone());
                            }
                            return networkResponse;
                        }
                    }).catch(function() {
                        if (event.request.url.endsWith('.jpg')) {
                            console.log('[cached img response]');
                            return cache.match('/img/offline.svg').then(function (response) {
                                if (response) {
                                    console.log('[retrieve offline.svg]');
                                    return response;
                                }
                            });
                        }
                    });
                }
            })
        })
    );
});

self.addEventListener('activate', function(event) {
    // Cleanup
    // Remove old cache
});