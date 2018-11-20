let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {  
  initMap();
});

/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {      
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: window.apis.mapbox.token,
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'    
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}
 
/* window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
} */

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      // Create Review form
      fillReviewFormHTML();
      callback(null, restaurant)
    });


    // Get all restaurant reviews
    fetchRestaurantReviews(id);
  }
}

fetchRestaurantReviews = (id) => {
  DBHelper.fetchReviewsByRestaurantId(id, (error, reviews) => {
    self.restaurant.reviews = reviews;
    console.log('[reviews]: ', reviews);

    if (!reviews) {
      console.error(error);
      return;
    }

    // Fill Reviews
    fillReviewsHTML();
  })
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;
  name.setAttribute('tabindex', 0);

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.alt = `Picture of ${restaurant.name}`;
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create review form section
 */
fillReviewFormHTML = () => {
  const container = document.getElementById('reviewForm-container');

  const title = document.createElement('h2');
  title.append('Submit Review');

  container.appendChild(title);

  const form = createReviewFormHTML();

  container.appendChild(form);

  // Add event to watch for submit
  form.addEventListener('submit', event => {
    event.preventDefault(); 

    DBHelper.sendForm(new FormData(form)).then(review => {
      if (review) {
        fillReviewHTML(review);
          console.info('[update reviews]: ', [review]);          
        }
    });
  });
}

/**
 * Create review form HTML and add it to the webpage.
 */
createReviewFormHTML = (id = self.restaurant.id) => {
  const form = document.createElement('form');
  form.action = 'http://localhost:1337/reviews/';
  form.method = 'post';
  
  const userNameLabel = document.createElement('label');
  userNameLabel.append('Name');

  const userName = document.createElement('input');
  userName.name = 'name';
  userName.type = 'text';

  userNameLabel.appendChild(userName);

  const restaurantId = document.createElement('input');
  restaurantId.name = 'restaurant_id';
  restaurantId.type = 'hidden';
  restaurantId.value = id;

  const userRatingLabel = document.createElement('label');
  userRatingLabel.append('Rating');

  const userRating = document.createElement('input');
  userRating.min = 1;
  userRating.max = 5;
  userRating.name = 'rating';
  userRating.type = 'range';
  userRating.value = 3;

  userRatingLabel.appendChild(userRating);

  const comments = document.createElement('textarea');
  comments.maxLength = 500;
  comments.name = 'comments';
  comments.placeholder = 'comments...';

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.innerText = 'Submit';

  form.appendChild(userNameLabel);
  form.appendChild(restaurantId);
  form.appendChild(userRatingLabel);
  form.appendChild(comments);
  form.appendChild(submit);

  return form;
}

/**
 * Create all reviews HTML and add them to the webpage.
 * Add review here
 */
fillReviewHTML = (review) => {
  const container = document.getElementById('reviews-container');

  const ul = document.getElementById('reviews-list');
  
  if (!review && ul.children.length === 0) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }

  // Review list
  ul.insertBefore(createReviewHTML(review), ul.firstChild);
  container.appendChild(ul);
}

/**
 * Create all reviews HTML and add them to the webpage.
 * Add review here
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  const ul = document.getElementById('reviews-list');
  
  if (!reviews && ul.children.length === 0) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }

  // Review list
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = new Date(review.updatedAt).toLocaleString().replace(',', '');
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  li.setAttribute('aria-current', 'page');
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
