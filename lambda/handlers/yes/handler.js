const socket = require('ws');
const constants = require("../../constants/constants");
const utils = require("../../utils/util");

const handlers = [
    
    //Yes answer booking gym
    {
        async canHandle(handlerInput) {
            const attributesManager = handlerInput.attributesManager;
            const attributes = await attributesManager.getSessionAttributes() || {};
            const currentIntent = attributes.currentIntent;
            
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                && handlerInput.requestEnvelope.request.intent.name === "AMAZON.YesIntent"
                && currentIntent === "BookingGymIntent"
        },
        async handle(handlerInput) {
            let speakOutput;
            try{
                
                const attributesManager = handlerInput.attributesManager;
                const attributes = await attributesManager.getSessionAttributes() || {};
                const serviceType = attributes.serviceType;
                
                
                const x = {
                  screen: `booking`,
                  intent: `BookingGymIntent`,
                  parameters: []
                };
                
                let ws = new socket(constants.SOCKET_URL);
                
                ws.on('open', function open(){
                    ws.send(JSON.stringify(x));
                    ws.close();
                });
                
                speakOutput = `<speak>
                                ¿Por favor, indícame el nombre del gimnasio que desea reservar?
                               </speak>`;
 
                return handlerInput.responseBuilder
                    .speak("¿Por favor, indícame el nombre del gimnasio que desea reservar?")
                    .reprompt("¿Por favor, indícame el nombre del gimnasio que desea reservar?")
                    .addElicitSlotDirective('serviceName', {
                        name: 'BookingServicesIntent',
                        confirmationStatus: 'NONE',
                        slots: {
                            serviceType: {
                                name: 'serviceType',
                                value: serviceType,
                                confirmationStatus: 'NONE'
                            }
                        }
                    })
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
];

module.exports = handlers;




