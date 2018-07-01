self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('balancedmws').then(cache => {
      
      return cache.addAll([
        '/',
        '/index.html',
        '/styles.css',
        '/script.js',
        'https://free.currencyconverterapi.com/api/v5/currencies',
        'https://fonts.googleapis.com/css?family=Roboto:400,300,500,700,100',
        'https://fonts.googleapis.com/css?family=Lobster+Two|Merriweather|Neuton|Redressed',
      ]);
    }).catch(err => console.log(err))
  );
});

self.addEventListener('fetch', function (event) {
  console.log(event.request.url);
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    })
  );
});