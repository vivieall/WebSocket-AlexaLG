
const WS_BASE_URL = "https://ires2-tesis-backend.herokuapp.com/api/v1";
const SOCKET_URL = "wss://socket-app-ws.herokuapp.com";

const GUEST_ID = 1;
const ENDPOINT_EVENTS = `${WS_BASE_URL}/events`;
const ENDPOINT_GYMS = `${WS_BASE_URL}/gyms`;
const ENDPOINT_SPAS = `${WS_BASE_URL}/spas`;
const ENDPOINT_FACILITIES = `${WS_BASE_URL}/locals`;
const ENDPOINT_RESTAURANTS = `${WS_BASE_URL}/restaurants`;
const ENDPOINT_DISHES = `${WS_BASE_URL}/dishes`; 
const ENDPOINT_DISH_TYPES = `${WS_BASE_URL}/dish-types`;
const ENDPOINT_PRODUCT_CATEGORIES = `${WS_BASE_URL}/product-categories`;
const ENDPOINT_PRODUCTS = `${WS_BASE_URL}/products`;
const ENDPOINT_TOURISTICPLACES = `${WS_BASE_URL}/touristic-places`;
const ENDPOINT_ACCOUNT = `${WS_BASE_URL}/accounts`;
const ENDPOINT_TRANSACTIONS = `${WS_BASE_URL}/transactions`;
function ENDPOINT_ACCOUNT_BY_GUEST(guestId){return `${WS_BASE_URL}/accounts?guest_id=${guestId}`}
const ENDPOINT_PLACES_TYPES = `${WS_BASE_URL}/touristic-places-types`;


const SERVICES = ["Restaurantes", "Gimnasios", "Spas"];


const topicEnglish = ["sports","entertainment","science","politics","technology"];
const topicSpanish = ["deportes","entretenimiento", "ciencia", "politica","tecnologia"];
const topics = [
    {en: "sports", es: "deportes"},
    {en: "entertainment", es: "entretenimiento"},
    {en: "science", es: "ciencia"},
    {en: "politica", es: "politica"},
    {en: "technology", es: "tecnologia"}
    ]
    
    

module.exports.WS_BASE_URL = WS_BASE_URL;
module.exports.SOCKET_URL = SOCKET_URL;
module.exports.ENDPOINT_EVENTS = ENDPOINT_EVENTS;
module.exports.ENDPOINT_GYMS = ENDPOINT_GYMS;
module.exports.ENDPOINT_SPAS = ENDPOINT_SPAS;
module.exports.ENDPOINT_RESTAURANTS = ENDPOINT_RESTAURANTS;
module.exports.ENDPOINT_DISHES = ENDPOINT_DISHES;
module.exports.ENDPOINT_DISH_TYPES = ENDPOINT_DISH_TYPES;
module.exports.ENDPOINT_PRODUCT_CATEGORIES = ENDPOINT_PRODUCT_CATEGORIES;
module.exports.ENDPOINT_PRODUCTS = ENDPOINT_PRODUCTS;
module.exports.ENDPOINT_FACILITIES = ENDPOINT_FACILITIES;
module.exports.ENDPOINT_TOURISTICPLACES = ENDPOINT_TOURISTICPLACES;
module.exports.ENDPOINT_ACCOUNT = ENDPOINT_ACCOUNT;
module.exports.ENDPOINT_ACCOUNT_BY_GUEST = ENDPOINT_ACCOUNT_BY_GUEST;
module.exports.ENDPOINT_TRANSACTIONS = ENDPOINT_TRANSACTIONS;
module.exports.ENDPOINT_PLACES_TYPES = ENDPOINT_PLACES_TYPES;
module.exports.GUEST_ID = GUEST_ID;





module.exports.SERVICES = SERVICES; 


module.exports.topicEnglish = topicEnglish;
module.exports.topicSpanish = topicSpanish;
module.exports.topics = topics;