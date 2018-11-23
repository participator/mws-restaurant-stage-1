/**
 * Common database helper functions.
 */
class DBHelper {

   /**
   * API URL.
   * Change this to restaurants.json file location on your server.
   */
  static get API_Restaurants_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants/`;
  }

   /**
   * API URL.
   * Change this to review.json file location on your server.
   */
  static get API_Reviews_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/reviews?restaurant_id=`;
  }

  /**
   * API POST Review URL
   * Submit new review
   */
  static get API_Review_Create_URL() {
    const port = 1337;
    return `http://localhost:${port}/reviews/`;
  }

  /**
   * API PUT Favorite URL
   * Favorite a Restuarant
   */
  static get API_Restaurant_Favorite_URL() {
    const port = 1337;
    return `http://localhost:${port}/restaurants/{restaurant_id}/`; // /?is_favorite=true`
  }

  /**
   * API PUT Favorite URL
   * Favorite a Restuarant
   */
  static get API_Restaurant_UnFavorite_URL() {
    const port = 1337;
    return `http://localhost:${port}/restaurants/{restaurant_id}/`; // ?is_favorite=false`
  }

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 9080 // Change this to your server port
    return `http://localhost:${port}/data/restaurants.json`;
  }

  /**
   * Fetch all restaurants.
   * Uses XMLHttpRequest
   */
  static fetchRestaurants(callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', DBHelper.API_Restaurants_URL);
    xhr.onload = () => {
      if (xhr.status === 200) { // Got a success response from server!
        const restaurants = JSON.parse(xhr.responseText);
        callback(null, restaurants);
      } else { // Oops!. Got an error from server.
        const error = (`Request failed. Returned status of ${xhr.status}`);
        callback(error, null);
      }
    };
    xhr.onerror = console.log;
    xhr.send();
  }

  /**
   * Fetch all restaurants.
   * Uses Fetch API
   */
  // static fetchRestaurants(callback) {
  //   fetch(DBHelper.API_URL)
  //   .then(function(response) {
  //     response.json().then(function(data) {
  //       callback(null, data);
  //     });
  //   }).catch(function(error) {
  //     callback(error);
  //   });
  // }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Fetch all reviews for a restaurant.
   * Uses Fetch API
   */
  static fetchReviewsByRestaurantId(restaurantId, callback) {
    fetch(`${DBHelper.API_Reviews_URL}${restaurantId}`)
    .then(function(response) {
      response.json().then(function(data) {
        // TODO: Normalize Date Format Posted to Server
        const sorted = data.sort((reviewA, reviewB) => {
          if (new Date(reviewA.updatedAt) > new Date(reviewB.updatedAt)) return -1;
          if (new Date(reviewA.updatedAt) < new Date(reviewB.updatedAt)) return 1;
        });
        callback(null, sorted);
      });
    }).catch(function(error) {
      callback(error);
    });
  }

  static toggleRestaurantFavoriteStatus(id, setFavorite, callback) {
    let url;

    if (setFavorite) {
      url = DBHelper.API_Restaurant_Favorite_URL.replace('{restaurant_id}', id);
    }
    else {
      url = DBHelper.API_Restaurant_UnFavorite_URL.replace('{restaurant_id}', id);
    }

    const xhr = new XMLHttpRequest();
    xhr.open('put', url);
    xhr.send(JSON.stringify({is_favorite: setFavorite}));
    xhr.onload = function(event) {
      if (event.target.response && event.target.status === 200) {
        return callback(JSON.parse(event.target.response).is_favorite);
      }
      throw new Error('Response not okay status');
    };
    xhr.onerror = function(event) {
      console.log('[error] toggle restaurant favorite status failed', event.target.response);
    }
  }

  /**
   * Post form
   * @param {form} FormData for review form 
   */
  static sendForm(form) {
    let data = [];
    
    form.forEach((value, name) => {
      data.push(`${name}=${value}`)
    })

    let stringedData = data.join('&');

    return fetch(DBHelper.API_Review_Create_URL, {
      body: stringedData,
      method: 'post',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).then(response => {
      if (response && response.statusText === 'Created') {
        return response.json();
      }
      else {
        throw new Error('Failed to create review');
      }
    }).catch(err => {
      console.log('[err]: ', err);
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  } 
  /* static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  } */

}

