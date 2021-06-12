const socket = require('ws');
const constants = require("../../constants/constants");
const utils = require("../../utils/util");

const handlers = [
    
    //facilities
    {
        async canHandle(handlerInput) {
            
            const attributesManager = handlerInput.attributesManager;
            const attributes = await attributesManager.getSessionAttributes() || {};
            const currentIntent = attributes.currentIntent;
            
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                 && handlerInput.requestEnvelope.request.intent.name === "TellMeMoreIntent"
                 && handlerInput.requestEnvelope.request.intent.slots.name.value
                 && currentIntent === 'facilities'
        },
        async handle(handlerInput) {
            let speakOutput;
            let x = {};
            let ws;
            let response = {};
            let data = {};
                                                                    
            try{
                
                const attributesManager = handlerInput.attributesManager;
                const attributes = await attributesManager.getSessionAttributes() || {};
                
                
                const facilityName = handlerInput.requestEnvelope.request.intent.slots.name.value; 
                
                const facilitiesResult = await utils.getReq(constants.ENDPOINT_FACILITIES, { method: 'GET' });
                const facilities = facilitiesResult.data;
                
                
                
                
                
                const nameListText = facilities.map(x => x.name);
                let nameListSpeech = nameListText.join(',<break time="0.01s" /> ');
                nameListSpeech = nameListSpeech.replace(/,([^,]+)$/, ' y$1');
                
                const facilitySearch = facilities.find(x => x.name.toLowerCase() === facilityName.toLowerCase());
                
                if(facilitySearch){
                    
                    
                    attributes.currentIntent = 'facilities';
                    attributesManager.setSessionAttributes(attributes);
                    
                    x = {
                    screen: `facilities`,
                    intent: `ListFacilitiesIntent`,
                    parameters: [
                            {name: 'facility', value: facilitySearch.id},
                        ]
                    };
                    
                    ws = new socket(constants.SOCKET_URL);
                    ws.on('open', function open(){
                        ws.send(JSON.stringify(x));
                        ws.close();
                    });
                    
                    speakOutput = `<speak>
                                    ${facilitySearch.description}
                                   </speak>
                                   `;
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .reprompt(speakOutput)
                        .getResponse();
                    
                }else{
                    speakOutput = `<speak>
                                    Lo lamento, la instalación ${facilityName} no se encuentra dentro del hotel.
                                    Las instalaciones disponibles en el hotel son las siguientes:
                                    ${nameListSpeech}
                                    <break time="0.02s"/>
                                    ¿Cuál es el nombre de la instalación de la que deseas información?
                                   </speak>`;
                    
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .reprompt(speakOutput)
                        .addElicitSlotDirective('name')
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

    //events
    {
        async canHandle(handlerInput) {
            
            const attributesManager = handlerInput.attributesManager;
            const attributes = await attributesManager.getSessionAttributes() || {};
            const currentIntent = attributes.currentIntent;
            
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                 && handlerInput.requestEnvelope.request.intent.name === "TellMeMoreIntent"
                 && handlerInput.requestEnvelope.request.intent.slots.name.value
                 && currentIntent === 'events'
        },
        async handle(handlerInput) {
            let speakOutput;
            let x = {};
            let ws;
            let response = {};
            let data = {};
                                                                    
            try{
                
                const attributesManager = handlerInput.attributesManager;
                const attributes = await attributesManager.getSessionAttributes() || {};
                
                const eventType = attributes.eventCategory;
                const eventName = handlerInput.requestEnvelope.request.intent.slots.name.value;
                
                const eventsResult = await utils.getReq(`${constants.ENDPOINT_EVENTS}?type=${eventType}`, { method: 'GET' });
                const events = eventsResult.data;
                
                const eventResult  = await utils.getReq(`${constants.ENDPOINT_EVENTS}?name=${eventName}`, { method: 'GET' });
                const eventSearch = eventResult.data;
                
                const nameListText = events.map(x => x.name);
                let nameListSpeech = nameListText.join(',<break time="0.01s" /> ');
                nameListSpeech = nameListSpeech.replace(/,([^,]+)$/, ' y$1');
                

                
                if(eventSearch.length > 0){
                    
                    attributes.currentIntent = 'events';
                    
                    x = {
                    screen: `events`,
                    intent: ``,
                    parameters: [
                            {name: 'eventType', value: eventType},
                            {name: 'event', value: eventSearch[0].id},
                        ]
                    };
                    
                    ws = new socket(constants.SOCKET_URL);
                    ws.on('open', function open(){
                        ws.send(JSON.stringify(x));
                        ws.close();
                    });
                    
                    speakOutput = `<speak>
                                    ${eventSearch[0].description}
                                   </speak>
                                   `;
                                  
                    attributesManager.setSessionAttributes(attributes);
                    
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .reprompt(speakOutput)
                        .getResponse();
                    
                }else{
                    speakOutput = `<speak>
                                    Lo lamento, no disponemos de información sobre el evento ${eventName}.
                                    Los eventos de ${eventType} de estan próximos a realizarse son:
                                    ${nameListSpeech}
                                    <break time="0.02s"/>
                                    ¿Cuál es el nombre del evento del que deseas información?
                                   </speak>`;
                    
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .reprompt(speakOutput)
                        .addElicitSlotDirective('name')
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
    
    //restaurants
    {
        async canHandle(handlerInput) {
            
            const attributesManager = handlerInput.attributesManager;
            const attributes = await attributesManager.getSessionAttributes() || {};
            const currentIntent = attributes.currentIntent;
            
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                 && handlerInput.requestEnvelope.request.intent.name === "TellMeMoreIntent"
                 && handlerInput.requestEnvelope.request.intent.slots.name.value
                 && currentIntent === 'restaurants'
        },
        async handle(handlerInput) {
            let speakOutput;
            let x = {};
            let ws;
            let response = {};
            let data = {};
                                                                    
            try{
                
                const attributesManager = handlerInput.attributesManager;
                const attributes = await attributesManager.getSessionAttributes() || {};
                
                const dishTypeId = attributes.dishType;
                const dishName = handlerInput.requestEnvelope.request.intent.slots.name.value;
                
                const restaurantId = attributes.restaurantId;
                const restaurantName = attributes.restaurantName;
                
                const dishesResult = await utils.getReq(constants.ENDPOINT_DISHES, { method: 'GET' });
                const dishes = dishesResult.data.filter(x => x.restaurant_id === Number(restaurantId) && x.dish_type_id === Number(dishTypeId));
                
                const nameListText = dishes.map(x => x.name);
                let nameListSpeech = nameListText.join(',<break time="0.01s" /> ');
                nameListSpeech = nameListSpeech.replace(/,([^,]+)$/, ' y$1');
                
                const dishSearch = dishes.find(x => x.name.toLowerCase() === dishName.toLowerCase());
                
                if(dishSearch){
                    
                    
                    attributes.currentIntent = 'restaurants';
                    
                    x = {
                    screen: `restaurants`,
                    intent: ``,
                    parameters: [
                            {name: 'restaurant', value: restaurantId},
                            {name: 'dishType', value: dishTypeId},
                            {name: 'dish', value: dishSearch.id},
                        ]
                    };
                    
                    ws = new socket(constants.SOCKET_URL);
                    ws.on('open', function open(){
                        ws.send(JSON.stringify(x));
                        ws.close();
                    });
                    
                    speakOutput = `<speak>
                                        ${dishSearch.description}
                                   </speak>`;
                                   
                    attributesManager.setSessionAttributes(attributes);
                    
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .reprompt(speakOutput)
                        .getResponse()
                    
                }else{
                    
                    speakOutput = `<speak>
                                    Lo lamento, el restaurante ${restaurantName} no ofrece el plato de comida ${dishName}.
                                    Los platos de comida de hoy son:
                                    ${nameListSpeech}
                                    ¿Cuál es el nombre del plato de comida del que desea información?
                                   </speak>`;
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .reprompt(speakOutput)
                        .addElicitSlotDirective('name')
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
    
    //places interest
    
    {
        async canHandle(handlerInput) {
            
            const attributesManager = handlerInput.attributesManager;
            const attributes = await attributesManager.getSessionAttributes() || {};
            const currentIntent = attributes.currentIntent;
            
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                 && handlerInput.requestEnvelope.request.intent.name === "TellMeMoreIntent"
                 && handlerInput.requestEnvelope.request.intent.slots.name.value
                 && currentIntent === 'placesInterest'
        },
        async handle(handlerInput) {
            let speakOutput;
            let x = {};
            let ws;
            let response = {};
            let data = {};
                                                                    
            try{
                
                const attributesManager = handlerInput.attributesManager;
                const attributes = await attributesManager.getSessionAttributes() || {};
                ///hola mundo
                const placeTypeId = attributes.placeTypeId;
                const placeInterestName = handlerInput.requestEnvelope.request.intent.slots.name.value; 
                
                const placesInterestResult = await utils.getReq(constants.ENDPOINT_TOURISTICPLACES, { method: 'GET' });
                const placesInterest = placesInterestResult.data;
                
                
                const nameListText = placesInterest.map(x => x.name);
                let nameListSpeech = nameListText.join(',<break time="0.01s" /> ');
                nameListSpeech = nameListSpeech.replace(/,([^,]+)$/, ' y$1');
                
                console.log(placeInterestName);
                const placeInterestSearchResult = await utils.getReq(`${constants.ENDPOINT_TOURISTICPLACES}?name=${placeInterestName}`, { method: 'GET' });
                const placeInterestSearch = placeInterestSearchResult.data;
                
                if(placeInterestSearch.length > 0){
                    
                    
                    attributes.currentIntent = 'placesInterest';
                    attributesManager.setSessionAttributes(attributes);
                    
                    x = {
                    screen: `placesInterest`,
                    intent: ``,
                    parameters: [
                            {name: 'placesType', value: placeTypeId},
                            {name: 'place', value: placeInterestSearch[0].id},
                        ]
                    };
                    
                    ws = new socket(constants.SOCKET_URL);
                    ws.on('open', function open(){
                        ws.send(JSON.stringify(x));
                        ws.close();
                    });
                    
                    speakOutput = `<speak>
                                    ${placeInterestSearch[0].description}
                                   </speak>
                                   `;
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .reprompt(speakOutput)
                        .getResponse();
                    
                }else{
                    speakOutput = `<speak>
                                    Lo lamento, no disponemos de información del lugar de interés ${placeInterestName}.
                                    Los lugares de interés de los cuáles tenemos información son:
                                    ${nameListSpeech}
                                    <break time="0.02s"/>
                                    ¿Cuál es el nombre del lugar de interés del cuál deseas información?
                                   </speak>`;
                    
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .reprompt(speakOutput)
                        .addElicitSlotDirective('name')
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
    
    
    

]

module.exports = handlers;