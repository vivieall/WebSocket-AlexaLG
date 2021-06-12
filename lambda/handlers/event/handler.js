const socket = require('ws');
const constants = require("../../constants/constants");
const utils = require("../../utils/util");


const handlers = [
    
    //ListEventsIntentHandler
    {
        canHandle(handlerInput) {
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                && handlerInput.requestEnvelope.request.intent.name === "ShowEventsIntent" 
                && !handlerInput.requestEnvelope.request.intent.slots.eventType.value
        },
        async handle(handlerInput) {
            let speakOutput;
            try{
                
                
                const attributesManager = handlerInput.attributesManager;
                const attributes = await attributesManager.getSessionAttributes() || {};
                attributes.currentIntent = 'events';

                let ws = new socket(constants.SOCKET_URL);
                
                const response = {
                  screen: `events`,
                  intent: `showEventsIntent`,
                  parameters: []
                }; 
                
                
                ws.on('open', function open(){
                    ws.send(JSON.stringify(response));
                    ws.close();
                });
                
                speakOutput = `<speak>
                                Disponemos de una variada lista de eventos agrupados en 5 categorías, las cuáles son:
                                    Música,
                                    Arte,
                                    Moda
                                    Teatro y
                                    Charlas. <break time="0.02s"/>
                                En estos momentos se muestran los eventos de música que tendrán lugar próximamente.
                                <break time="0.05s"/>
                                Recuerda que: <break time="0.02s"/>
                                Para visualizar otro tipo de evento puedes utilizar el control remoto del televisor y hacer uso de las flechas direccionales, 
                                o puedes decir "Cambia" <break time="0.05s"/> seguido del nombre del tipo de evento.
                               </speak>`;
                
                attributes.eventCategory = 'musica';
                attributesManager.setSessionAttributes(attributes); 
                
                               
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .getResponse();
                               
                               
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
    
    //ListEventsIntentHandler ? eventType
    {
        canHandle(handlerInput) {
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                && handlerInput.requestEnvelope.request.intent.name === "ShowEventsIntent" 
                && handlerInput.requestEnvelope.request.intent.slots.eventType.value
        },
        async handle(handlerInput) {
            let speakOutput;
            try{
                
                const eventType = handlerInput.requestEnvelope.request.intent.slots.eventType.value;
                const attributesManager = handlerInput.attributesManager;
                const attributes = await attributesManager.getSessionAttributes() || {};
                attributes.currentIntent = 'events';
                
                
                console.log(eventType);
                
                const response = await utils.getReq(`${constants.ENDPOINT_EVENTS}?type=${eventType}`, { method: 'GET' });
                const events = response.data;
                console.log(events);
                
                const nameListText = events.map(e => e.name);
                let nameListSpeech = nameListText.join(`, `);
                nameListSpeech = nameListSpeech.replace(/,([^,]+)$/, ' y$1'); 
                
                
                const x = {
                  screen: `events`,
                  intent: `showEventsIntent`,
                  parameters: [{name: "eventType", value: eventType }]
                };
                
            
                
                let ws = new socket(constants.SOCKET_URL);
                ws.on('open', function open(){
                    ws.send(JSON.stringify(x));
                    ws.close();
                });
                
                
                if(events.length <= 0){
                    speakOutput = `<speak>
                                    En estos momentos no existen eventos de ${eventType} que estén próximos a realizarse.
                                   </speak>`
                }else{
                    speakOutput =`<speak>
                                    Actualmente disponemos de ${events.length} eventos de ${eventType} que tendran lugar proximamente.
                                    Estos son:
                                    ${nameListSpeech}.
                                  </speak>`
                } 
                console.log(speakOutput);
                
                attributes.eventCategory = eventType;
                attributesManager.setSessionAttributes(attributes); 
                
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
    
    //SelectEventTypesIntentHandler
    {
        async canHandle(handlerInput) {
            
            const attributesManager = handlerInput.attributesManager;
            const attributes = await attributesManager.getSessionAttributes() || {};
            const currentIntent = attributes.currentIntent;
            
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                && handlerInput.requestEnvelope.request.intent.name === "ChangeEventTypesIntent"
                && handlerInput.requestEnvelope.request.intent.slots.eventType.value
                && currentIntent === "events"
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
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        }
    },
    
];

module.exports = handlers;




