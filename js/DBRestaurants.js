(function() {

    const version = 1;

    const restaurantsDBPromise = idb.open('restaurants-store', version, function(upgradeDB) {
        // console.log('[idb.open]', upgradeDB);
        const objectStore = upgradeDB.createObjectStore('restaurants');
        // objectStore.put('world', 'hello');
    });

    // restaurantsDBPromise.then(function(db) {
    //     console.log('[db]', db);
    //     const tx = db.transaction('restaurants');
    //     const objectStore = tx.objectStore('restaurants');
    //     return objectStore.get('hello');
    // }).then(function(val) {
    //     console.log('The value of hello is : ', val);
    // });

    // restaurantsDBPromise.then(function(db) {
    //     const tx = db.transaction('restaurants', 'readwrite');
    //     const objectStore = tx.objectStore('restaurants');
    //     objectStore.put('value', 'Key');
    //     return tx.complete;
    // }).then(function() {
    //     console.log('New entry added = Key:Value');
    // });

    let restaurants;
    DBHelper.fetchRestaurants(restaurantsCallback);

    restaurantsDBPromise.then(function(db) {
        const tx = db.transaction('restaurants', 'readwrite');
        const objectStore = tx.objectStore('restaurants');
        
        restaurants.forEach(function(restaurant) {
            objectStore.put(restaurant, restaurant.id);
        });

        return tx.complete;
    }).then(function() {
        console.log('[Restaurants added]');
    });
    
    function restaurantsCallback(error, rtts) {
        if (error) console.error('[Error obtained when getting restaurants]: ', error);
        restaurants = rtts;
    }

})();