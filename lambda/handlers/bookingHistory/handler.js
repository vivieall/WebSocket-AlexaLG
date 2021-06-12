const socket = require('ws');
const constants = require("../../constants/constants");

const handlers = [
    
    {
        async canHandle(handlerInput) {
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                && handlerInput.requestEnvelope.request.intent.name === "BookingHistoryIntent"
        },
        async handle(handlerInput) {
            let speakOutput;
            let x = {};
            let ws;
            
            try{
                x = {
                    screen: `bookingHistory`,
                    intent: `BookingHistoryIntent`,
                    parameters: []
                    };
                    
                
                ws = new socket(constants.SOCKET_URL);
                ws.on('open', function open(){
                    ws.send(JSON.stringify(x));
                    ws.close();
                });
                
                
                speakOutput = `<speak>
                                En el televisor se muestra el listado de las reservas realizadas durante tu estadía.
                               </speak>`;
                               
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
