const socket = require('ws');
const constants = require("../../constants/constants");
const utils = require("../../utils/util");

const handlers = [
    {
        async canHandle(handlerInput) {
            
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                 && handlerInput.requestEnvelope.request.intent.name === "ListFacilitiesIntent"
        },
        async handle(handlerInput) {
            let speakOutput;
            let x = {};
            let ws;
            let response = {};
            let data = {};
                                                                    
            try{
                
                
                response = await utils.getReq(constants.ENDPOINT_FACILITIES, { method: 'GET' });
                data = response.data;
                
                const nameListText = data.map(x => x.name);
                let nameListSpeech = nameListText.join(',<break time="0.01s" /> ');
                nameListSpeech = nameListSpeech.replace(/,([^,]+)$/, ' y$1');
                
                x = {
                    screen: `facilities`,
                    intent: `ListFacilitiesIntent`,
                    parameters: [],
                };
                    
                ws = new socket(constants.SOCKET_URL);
                ws.on('open', function open(){
                    ws.send(JSON.stringify(x));
                    ws.close();
                });
                
            
                speakOutput = `<speak>
                                El hotel cuenta con ${data.length} ${data.length > 1 ? "instalaciones" : "instalación"} de libre acceso para los huéspedes.
                                Estas son: <break time="0.02s"/>
                                ${nameListSpeech}
                              </speak>`;
                              
                const attributesManager = handlerInput.attributesManager;
                const attributes = await attributesManager.getSessionAttributes() || {};
                
                attributes.currentIntent = 'facilities';
                              
                
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
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
    

]

module.exports = handlers;