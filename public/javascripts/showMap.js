mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: place.geometry.coordinates, // starting position [lng, lat]
    zoom: 9 // starting zoom
});

new mapboxgl.Marker()
    .setLngLat(place.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<h4>${place.name}</h4><p>${place.location}</p>`
            )
    )
    .addTo(map)
