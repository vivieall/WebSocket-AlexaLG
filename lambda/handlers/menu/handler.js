const socket = require('ws');
const constants = require("../../constants/constants");
const utils = require("../../utils/util");

const handlers = [
    
    //store
    {
        async canHandle(handlerInput) {
            
            const attributesManager = handlerInput.attributesManager;
            const attributes = await attributesManager.getSessionAttributes() || {};
            const currentIntent = attributes.currentIntent;
            
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                && handlerInput.requestEnvelope.request.intent.name === "ChangeMenuOptionIntent"
                && handlerInput.requestEnvelope.request.intent.slots.menuOption.value
                && currentIntent === 'store'
        },
        async handle(handlerInput) {
            let speakOutput;
            let x = {};
            let ws;
            let response = {};
            let data = {};
                                                                    
            try{
                
                const option = handlerInput.requestEnvelope.request.intent.slots.menuOption.value;
                
                response = await utils.getReq(constants.ENDPOINT_PRODUCT_CATEGORIES, { method: 'GET' });
                data = response.data;
                const nameListText = data.map(x => x.name);
                let nameListSpeech = nameListText.join(',<break time="0.01s" /> ');
                nameListSpeech = nameListSpeech.replace(/,([^,]+)$/, ' y$1');
                
                const productCategorySearch = data.find(x=> x.name.toLowerCase() === option.toLowerCase());
                
                if(productCategorySearch){
                    
                    const productsResult = await utils.getReq(constants.ENDPOINT_PRODUCTS, { method: 'GET' });
                    const products = productsResult.data.filter(x => Number(x.product_category_id) === Number(productCategorySearch.id));
                    
                    const productListText = products.map(x => x.name);
                    let productListSpeech = productListText.join(', <break time="0.01s"/>');
                    productListSpeech = productListSpeech.replace(/,([^,]+)$/, ' y$1');
                    
                    
                    const attributesManager = handlerInput.attributesManager;
                    const attributes = await attributesManager.getSessionAttributes() || {};
                
                    attributes.currentIntent = 'store';
                    //attributes.productCategory = productCategorySearch.id;
                    attributes.productCategory = productCategorySearch.id;
                    attributes.productCategoryName = productCategorySearch.name;
                    attributesManager.setSessionAttributes(attributes);
                    
                    
                    x = {
                    screen: `store`,
                    intent: `storeIntent`,
                    parameters: [
                            {name: 'productCategory', value: productCategorySearch.id},
                        ]
                    };
                    
                    ws = new socket(constants.SOCKET_URL);
                    ws.on('open', function open(){
                        ws.send(JSON.stringify(x));
                        ws.close();
                    });
                    
                
                    speakOutput = `
                                    <speak>
                                        Haz elegido la categoría de ${option}. 
                                        Para esta categoría disponemos de ${products.length} productos.
                                        Estos son:
                                        ${productListSpeech}
                                        Para comprar un producto puedes decir:
                                        "Comprar" <break time="0.02s"/> seguido del nombre del producto.
                                        Entonces, ¿en que puedo ayudarte?
                                    </speak>
                                  `;
                    
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .reprompt(speakOutput)
                        .getResponse();
                }else{
                    
                    speakOutput = `<speak>
                                    Lo lamento, la categoría ${option} no se encuentra dentro de las categorías de productos disponibles.
                                    Las categorías disponibles son: 
                                    ${nameListSpeech}
                                    ¿Cuál es el nombre de la categoría que desea visualizar?
                                   </speak>`
                                   
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .reprompt("Lo lamento, no le he comprendido. Cual es el nombre de la categoria de producto que desea visualizar?")
                        .addElicitSlotDirective('menuOption')
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
                && handlerInput.requestEnvelope.request.intent.name === "ChangeMenuOptionIntent"
                && handlerInput.requestEnvelope.request.intent.slots.menuOption.value
                && currentIntent === 'events'
        },
        async handle(handlerInput) {
            let speakOutput;
            let x = {};
            let ws;
            let response = {};
            let data = {};
                                                                    
            try{
                
                const option = handlerInput.requestEnvelope.request.intent.slots.menuOption.value;
                
                const attributesManager = handlerInput.attributesManager;
                const attributes = await attributesManager.getSessionAttributes() || {};
                
                
                const response = await utils.getReq(`${constants.ENDPOINT_EVENTS}?type=${option}`, { method: 'GET' });
                const events = response.data;
                
                if(events.length > 0){
                    
                    const nameListText = events.map(e => e.name);
                    let nameListSpeech = nameListText.join(`,<break time="0.01s"/> `);
                    nameListSpeech = nameListSpeech.replace(/,([^,]+)$/, ' y$1');
                    
                    x = {
                    screen: `events`,
                    intent: ``,
                    parameters: [
                            {name: 'eventType', value: option},
                        ]
                    };
                    
                    ws = new socket(constants.SOCKET_URL);
                    ws.on('open', function open(){
                        ws.send(JSON.stringify(x));
                        ws.close();
                    });
                    
                    
                    
                    speakOutput = `<speak>
                                    Seleccionaste el tipo de evento: ${option}.
                                    Actualmente disponemos de ${events.length} eventos que tendrán lugar próximamente.
                                    Estos son:
                                    ${nameListSpeech}.
                                    </speak>`;
                                    
                    attributes.currentIntent = 'events';
                    attributes.eventCategory = option;
                    attributesManager.setSessionAttributes(attributes);
                                    
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .reprompt(speakOutput)
                        .getResponse();
                    
                }else{
                    speakOutput = `<speak>
                                    Lo lamento, lamentablemente no disponemos de información del tipo de evento de ${option}.
                                    Los tipos de eventos disponibles son: <break time="0.02s"/>
                                    Música,
                                    Arte,
                                    Moda
                                    Teatro y
                                    Charlas. <break time="0.02s"/> 
                                    ¿Cuál es el tipo de evento que deseas visualizar?
                                   </speak>`
                                   
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .reprompt(speakOutput)
                        .addElicitSlotDirective('menuOption')
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
    
    // places interest
    {
        async canHandle(handlerInput) {
            
            const attributesManager = handlerInput.attributesManager;
            const attributes = await attributesManager.getSessionAttributes() || {};
            const currentIntent = attributes.currentIntent;
            
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                && handlerInput.requestEnvelope.request.intent.name === "ChangeMenuOptionIntent"
                && handlerInput.requestEnvelope.request.intent.slots.menuOption.value
                && currentIntent === 'placesInterest'
        },
        async handle(handlerInput) {
            let speakOutput;
            let x = {};
            let ws;
            let response = {};
            let data = {};
                                                                    
            try{
                
                const option = handlerInput.requestEnvelope.request.intent.slots.menuOption.value;
                
                const attributesManager = handlerInput.attributesManager;
                const attributes = await attributesManager.getSessionAttributes() || {};
                
                
                const placesTypes = await utils.getReq(constants.ENDPOINT_PLACES_TYPES, { method: 'GET' });
                const placesTypesListText = placesTypes.data.map(e => e.name);
                let placesTypesListSpeech = placesTypesListText.join(`,<break time="0.01s"/> `);
                placesTypesListSpeech = placesTypesListSpeech.replace(/,([^,]+)$/, ' y$1');
                
                
                const response = await utils.getReq(`${constants.ENDPOINT_PLACES_TYPES}?name=${option}`, { method: 'GET' });
                const placeTypeObject = response.data;
                
                if(placeTypeObject.length > 0){
                    
                    const placesInterestResult = await utils.getReq(constants.ENDPOINT_TOURISTICPLACES, { method: 'GET' });
                    const placesInterest = placesInterestResult.data.filter(x => x.touristic_places_type_id === Number(placeTypeObject[0].id));
                    
                    const nameListText = placesInterest.map(e => e.name);
                    let nameListSpeech = nameListText.join(`,<break time="0.01s"/> `);
                    nameListSpeech = nameListSpeech.replace(/,([^,]+)$/, ' y$1');
                    
                    speakOutput = `<speak>
                                    Seleccionaste el tipo de lugar turístico: ${placeTypeObject[0].name}.
                                    Actualmente disponemos de ${placesInterest.length} ${placeTypeObject[0].name}.
                                    Estos son:
                                    ${nameListSpeech}.
                                    </speak>`;
                    
                    x = {
                    screen: `placesInterest`,
                    intent: ``,
                    parameters: [
                            {name: 'placesType', value: placeTypeObject[0].id},
                        ]
                    };
                    
                    ws = new socket(constants.SOCKET_URL);
                    ws.on('open', function open(){
                        ws.send(JSON.stringify(x));
                        ws.close();
                    });
                    
                
                                    
                    attributes.currentIntent = 'placesInterest';
                    attributes.placeTypeId = placeTypeObject.id;
                    attributesManager.setSessionAttributes(attributes);
                                    
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .reprompt(speakOutput)
                        .getResponse();
                    
                }else{
                    speakOutput = `<speak>
                                    Lo lamento, lamentablemente no disponemos de información del tipo de lugar de interés de ${option}.
                                    Los tipos de lugar de interés disponibles son: <break time="0.02s"/>
                                     ${placesTypesListSpeech}
                                    ¿Cuál es el tipo que deseas visualizar?
                                   </speak>`
                                   
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .reprompt(speakOutput)
                        .addElicitSlotDirective('menuOption')
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