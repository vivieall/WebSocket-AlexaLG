const socket = require('ws');
const constants = require("../../constants/constants");
const utils = require("../../utils/util");

const handlers = [
    
    //ListDishesResturantIntentHandler without slots
    {
        canHandle(handlerInput) {
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                && handlerInput.requestEnvelope.request.intent.name === "ListDishesRestaurantIntent" 
                && !handlerInput.requestEnvelope.request.intent.slots.restaurantName.value
                && !handlerInput.requestEnvelope.request.intent.slots.dishType.value
        },
        async handle(handlerInput) {
            let speakOutput;
            try{
                
                const attributesManager = handlerInput.attributesManager;
                const attributes = await attributesManager.getSessionAttributes() || {};
                attributes.currentIntent = 'ListDishesRestaurantIntent';
                attributesManager.setSessionAttributes(attributes); 
                
                const response = await utils.getReq(constants.ENDPOINT_GYMS, { method: 'GET' });
                const gyms = response.data;
                const nameListText = gyms.map(e => e.name);
                let nameListSpeech = nameListText.join(`, `);
                nameListSpeech = nameListSpeech.replace(/,([^,]+)$/, ' y$1'); 
                
                
                const x = {
                  screen: `services`,
                  intent: `ListServiceIntent`,
                  parameters: []
                };
                
                
                let ws = new socket(constants.SOCKET_URL);
                
                ws.on('open', function open(){
                    ws.send(JSON.stringify(x));
                    ws.close();
                });
                
                speakOutput = `<speak>
                                
                               </speak>`
            }catch(ex){
                speakOutput = ex;
                console.log(ex);
            }
            
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        }
    },
    
    //ListDishesResturantIntentHandler : slots(restaurantName)
    {
        canHandle(handlerInput) {
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                && handlerInput.requestEnvelope.request.intent.name === "ListDishesRestaurantIntent" 
                && handlerInput.requestEnvelope.request.intent.slots.restaurantName.value
                && !handlerInput.requestEnvelope.request.intent.slots.dishType.value
        },
        async handle(handlerInput) {
            let speakOutput;
            try{
                
                const serviceType = handlerInput.requestEnvelope.request.intent.slots.service.value;
                const serviceTypeId = handlerInput.requestEnvelope.request.intent.slots.service.resolutions.resolutionsPerAuthority[0].values[0].value.id;
                const attributesManager = handlerInput.attributesManager;
                const attributes = await attributesManager.getSessionAttributes() || {};
                attributes.currentIntent = 'ListDishesRestaurantIntent';
                attributesManager.setSessionAttributes(attributes); 
                
                
                
                let endpoint = "";
                
                console.log(serviceTypeId);
                
                switch(Number(serviceTypeId)){
                    case 1:
                        endpoint = constants.ENDPOINT_RESTAURANTS;
                        break;
                    case 2:
                        endpoint = constants.ENDPOINT_GYMS;
                        break;
                    case 3:
                        endpoint = constants.ENDPOINT_SPAS;
                        break;
                    default:
                        break;
                }
                
                console.log(endpoint);
            
                const response = await utils.getReq(endpoint, { method: 'GET' });
                const data = response.data;

                const nameListText = data.map(e => e.name);
                let nameListSpeech = nameListText.join(`, `);
                nameListSpeech = nameListSpeech.replace(/,([^,]+)$/, ' y$1'); 
                
                
                const x = {
                  screen: `services`,
                  intent: `ListServiceIntent`,
                  parameters: [{name: "serviceType", value: serviceType }]
                };
                
                let ws = new socket(constants.SOCKET_URL);
                ws.on('open', function open(){
                    ws.send(JSON.stringify(x));
                    ws.close();
                });
                
                
                if(data.length <= 0){
                    speakOutput = `<speak>
                                    Lo lamento, en estos momentos no existen ${serviceType} en las instalaciones del hotel.
                                   </speak>`
                }else{
                    speakOutput =`<speak>
                                    Actualmente disponemos de ${data.length} ${serviceType} ubicados dentro de las instalaciones del hotel.
                                    Estos son:
                                    ${nameListSpeech}.
                                  </speak>`
                } 
                
            }catch(ex){
                speakOutput = ex;
                console.log(ex);
            }
            
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        }
    },
    
    //ListDishesResturantIntentHandler : slots(restaurantName, dishType)
    {
        async canHandle(handlerInput) {
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                && handlerInput.requestEnvelope.request.intent.name === "ListDishesRestaurantIntent"
                && handlerInput.requestEnvelope.request.intent.slots.restaurantName.value
                && handlerInput.requestEnvelope.request.intent.slots.dishType.value
        },
        async handle(handlerInput) {
            let speakOutput;
            const restaurantName = handlerInput.requestEnvelope.request.intent.slots.restaurantName.value;
            const dishType = handlerInput.requestEnvelope.request.intent.slots.dishType.value;
            const dishTypeId = handlerInput.requestEnvelope.request.intent.slots.dishType.resolutions.resolutionsPerAuthority[0].values[0].value.id;
            
            try{
                
                const restaurantsResponse = await utils.getReq(constants.ENDPOINT_RESTAURANTS, { method: 'GET' });
                const restaurantResponse = await utils.getReq(`${constants.ENDPOINT_RESTAURANTS}?name=${restaurantName}`, { method: 'GET' });
                const restaurants = restaurantsResponse.data;
                const restaurant = restaurantResponse.data;
                
                console.log(restaurantsResponse);
                console.log(restaurantResponse);
                
                
                const nameListText = restaurants.map(e => e.name);
                let nameListSpeech = nameListText.join(`, `);
                nameListSpeech = nameListSpeech.replace(/,([^,]+)$/, ' y$1');
                
                
                if(restaurant.length > 0){
                    
                    const dishesResponse = await utils.getReq(constants.ENDPOINT_DISHES, { method: 'GET' });
                    const dishesAll = dishesResponse.data;
                    const dishes = dishesAll.filter(x => x.restaurant_id === restaurant[0].id && x.dish_type_id === dishTypeId);
                    
                    console.log(dishesResponse);
                    console.log(dishes);
                    
                    const dishListText = dishes.map(x => x.name);
                    let dishListSpeech = dishListText.join(`, `);
                    dishListSpeech = dishListSpeech.replace(/,([^,]+)$/, ' y$1');
                    
                    
                    const x = {
                        screen: `restaurants`,
                        intent: `ListDishesRestaurantIntent`,
                        parameters: [{ name: "restaurant", value: restaurant[0].id }, { name: "dishType", value: dishTypeId }]
                    };
                
                    let ws = new socket(constants.SOCKET_URL);
                        ws.on('open', function open(){
                        ws.send(JSON.stringify(x));
                        ws.close();
                    });
                    
                    speakOutput = `<speak>
                                    El restaurante ${restaurant[0].name} tiene ${dishes.length} ${dishType} disponibles para su reserva.
                                    <break time="0.01s"/>
                                    Estos son:
                                    ${dishListSpeech}
                                   </speak>`;
                                   
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .reprompt(speakOutput)
                        .getResponse();
                        
                }else{
                    speakOutput = `<speak>
                                    Lo lamento, el restaurante indicado es incorrecto. Los restaurantes disponibles en el hotel
                                    son los siguientes: 
                                    ${nameListSpeech}
                                    Por favor, indícame nuevamente el nombre del restaurante.
                                    <break time="0.02s"/>
                                    ¿Cuál es el nombre del restaurante que desea visualizar?
                                   </speak>`
                    return handlerInput.responseBuilder
                        .addElicitSlotDirective('restaurantName')
                        .speak(speakOutput)
                        .reprompt(speakOutput)
                        .getResponse();
                }
                    
            }catch(ex){
                console.log(ex);
                speakOutput = `<speak>
                                Lo siento, ha ocurrido un error inesperado y no se ha podido procesar su solicitud. 
                                Por favor, comuníquese con el administrador al siguiente al número <say-as interpret-as="telephone">945433992</say-as>
                                </speak>`;
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .getResponse();
            }
        }
    },
    
    //ListDishesResturantIntentHandler : slots(dishType)
    {
        async canHandle(handlerInput) {
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                && handlerInput.requestEnvelope.request.intent.name === "ListDishesRestaurantIntent"
                && !handlerInput.requestEnvelope.request.intent.slots.restaurantName.value
                && handlerInput.requestEnvelope.request.intent.slots.dishType.value
        },
        async handle(handlerInput) {
            let speakOutput;
            const eventType = handlerInput.requestEnvelope.request.intent.slots.eventType.value;
            try{
                
                const response = await utils.getReq(`${constants.ENDPOINT_EVENTS}?type=${eventType}`, { method: 'GET' });
                const events = response.data;
                const nameListText = events.map(e => e.name);
                let nameListSpeech = nameListText.join(`, `);
                nameListSpeech = nameListSpeech.replace(/,([^,]+)$/, ' y$1');
                speakOutput = `<speak>
                                Seleccionaste el tipo de evento: ${eventType}.
                                Actualmente disponemos de ${events.length} eventos que tendrán lugar próximamente.
                                Estos son:
                                ${nameListSpeech}.
                                </speak>`
            }catch(ex){
                console.log(ex);
                speakOutput = ex;
            }
            
            return handlerInput.responseBuilder
                .addElicitSlotDirective('restaurantName')
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        }
    },
];

module.exports = handlers;




