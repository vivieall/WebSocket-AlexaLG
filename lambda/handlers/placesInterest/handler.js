const socket = require('ws');
const constants = require("../../constants/constants");
const utils = require("../../utils/util");

const handlers = [
    {
        async canHandle(handlerInput) {
            
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                 && handlerInput.requestEnvelope.request.intent.name === "ListPlaceInterestIntent"
                 && !handlerInput.requestEnvelope.request.intent.slots.confirmChangePlaceType.value
                 && !handlerInput.requestEnvelope.request.intent.slots.placeType.value
        },
        async handle(handlerInput) {
            let speakOutput;
            let x = {};
            let ws;
            let response = {};
            let data = {};
                                                                    
            try{
                
                
                response = await utils.getReq(constants.ENDPOINT_PLACES_TYPES, { method: 'GET' });
                data = response.data;
                
                const nameListText = data.map(x => x.name);
                let nameListSpeech = nameListText.join(',<break time="0.01s" /> ');
                nameListSpeech = nameListSpeech.replace(/,([^,]+)$/, ' y$1');
                
                x = {
                    screen: `placesInterest`,
                    intent: `ListPlaceInterestIntent`,
                    parameters: [],
                };
                    
                ws = new socket(constants.SOCKET_URL);
                ws.on('open', function open(){
                    ws.send(JSON.stringify(x));
                    ws.close();
                });
                
                speakOutput = `<speak>
                                El hotel cuenta con información de lugares de interés agrupados en ${data.length} categorías:
                                Estas son: <break time="0.02s"/>
                                ${nameListSpeech}
                                <break time="0.01s"/>
                                ¿Deseas ver los lugares de interés de una categoría en específico?
                              </speak>`;
                              
                              
                const attributesManager = handlerInput.attributesManager;
                const attributes = await attributesManager.getSessionAttributes() || {};
                
                
                attributes.currentIntent = 'placesInterest';
                attributesManager.setSessionAttributes(attributes);
                
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .addElicitSlotDirective('confirmChangePlaceType')
                    .getResponse();
                
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
    
    
    {
        async canHandle(handlerInput) {
            
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                 && handlerInput.requestEnvelope.request.intent.name === "ListPlaceInterestIntent"
                 && handlerInput.requestEnvelope.request.intent.slots.confirmChangePlaceType.value
                 && !handlerInput.requestEnvelope.request.intent.slots.placeType.value
        },
        async handle(handlerInput) {
            let speakOutput;
            let x = {};
            let ws;
            let response = {};
            let data = {};
                                                                    
            try{
                
                
                const answerId = handlerInput.requestEnvelope.request.intent.slots.confirmChangePlaceType.resolutions.resolutionsPerAuthority[0].values[0].value.id;
                const attributesManager = handlerInput.attributesManager;
                const attributes = await attributesManager.getSessionAttributes() || {};
                
                attributes.currentIntent = 'placesInterest';
                attributesManager.setSessionAttributes(attributes);

                
                if(Number(answerId) < 2){
                    //say yes
                    
                    speakOutput = `<speak>
                                    ¿Cuál es el nombre de la categoría que desea visualizar?.
                                   </speak>`;
                    
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .reprompt(speakOutput)
                        .addElicitSlotDirective('placeType')
                        .getResponse();
                        
                }else{
                    //say no
                   
                    speakOutput = `<speak>
                                    Lo comprendo, recuerda que para visualizar otra categoria de lugar de interés debes decir:
                                    <break time="0.01s" />
                                    "Cambia" <break time="0.01s" /> seguido del nombre de la categoría.
                                   </speak>`;
                                   
                                   
                    return handlerInput.responseBuilder
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
    
    
     {
        async canHandle(handlerInput) {
            
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                 && handlerInput.requestEnvelope.request.intent.name === "ListPlaceInterestIntent"
                 && handlerInput.requestEnvelope.request.intent.slots.confirmChangePlaceType.value
                 && handlerInput.requestEnvelope.request.intent.slots.placeType.value
        },
        async handle(handlerInput) {
            let speakOutput;
            let x = {};
            let ws;
            let response = {};
            let data = {};
                                                                    
            try{
                
                const placeType = handlerInput.requestEnvelope.request.intent.slots.placeType.value;
                
                const attributesManager = handlerInput.attributesManager;
                const attributes = await attributesManager.getSessionAttributes() || {};
                
                attributes.currentIntent = 'placesInterest';
                

                const placesTypes = await utils.getReq(constants.ENDPOINT_PLACES_TYPES, { method: 'GET' });
                const placesTypesListText = placesTypes.data.map(e => e.name);
                let placesTypesListSpeech = placesTypesListText.join(`,<break time="0.01s"/> `);
                placesTypesListSpeech = placesTypesListSpeech.replace(/,([^,]+)$/, ' y$1');
                
                
                const response = await utils.getReq(`${constants.ENDPOINT_PLACES_TYPES}?name=${placeType}`, { method: 'GET' });
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
                                    Lo lamento, lamentablemente no disponemos de información del tipo de lugar de interés de ${placeType}.
                                    Los tipos de lugar de interés disponibles son: <break time="0.02s"/>
                                     ${placesTypesListSpeech}
                                    ¿Cuál es el tipo que deseas visualizar?
                                   </speak>`
                                   
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .reprompt(speakOutput)
                        .addElicitSlotDirective('placeType')
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