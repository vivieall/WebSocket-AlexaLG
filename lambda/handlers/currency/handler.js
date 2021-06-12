const socket = require('ws');
const constants = require("../../constants/constants");
const utils = require("../../utils/util");

const handlers = [
    {
        async canHandle(handlerInput) {
            
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                 && handlerInput.requestEnvelope.request.intent.name === "ChangeCurrencyIntent"
                 && !handlerInput.requestEnvelope.request.intent.slots.currencyType.value
        },
        async handle(handlerInput) {
            let speakOutput;
            let x = {};
            let ws;
            let response = {};
            let data = {};
                                                                    
            try{
                
                x = {
                    screen: `currencies`,
                    intent: `ChangeCurrencyIntent`,
                    parameters: [],
                };
                    
                ws = new socket(constants.SOCKET_URL);
                ws.on('open', function open(){
                    ws.send(JSON.stringify(x));
                    ws.close();
                });
                
            
                speakOutput = `<speak>
                                Para proceder con el cambio del tipo de moneda es necesario que indiques la moneda a la que deseas cambiar.<break time="0.01s"/>
                                Puedes elegir entre soles, dólares y euros.
                                <break time="0.01s"/>
                                ¿Cuál es el nombre de la moneda a la que deseas cambiar?
                              </speak>`;
                              
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .addElicitSlotDirective('currencyType')
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
                 && handlerInput.requestEnvelope.request.intent.name === "ChangeCurrencyIntent"
                 && handlerInput.requestEnvelope.request.intent.slots.currencyType.value
        },
        async handle(handlerInput) {
            let speakOutput;
            let x = {};
            let ws;
            let response = {};
            let data = {};
                                                                    
            try{

                const currency = handlerInput.requestEnvelope.request.intent.slots.currencyType.value;
                
                const currencies = [{name: 'soles',id: 1 },{name: 'dolares',id: 2 },{name: 'euros',id: 3 },{name: 'dólares',id: 2 },{name: 'euro',id: 3 }];
                const currencyObject = currencies.find(x => x.name.toLowerCase() === currency.toLowerCase());
        
                if(currencyObject){
                    
                    const currencyId = currencyObject.id;
                    
                    x = {
                    screen: `currencies`,
                    intent: `ChangeCurrencyIntent`,
                    parameters: [{name: 'currency', value: currencyId}],
                    };
                    
                    ws = new socket(constants.SOCKET_URL);
                    ws.on('open', function open(){
                        ws.send(JSON.stringify(x));
                        ws.close();
                    });
                        
                    
                    speakOutput = `<speak>
                                La solicitud se ha completado con éxito. El tipo de moneda ha sido cambiado a ${currency}.
                                Recuerda que: <break time="0.01s"/>
                                Para modificar nuevamente el tipo de moneda, debes decir: <break time="0.02s"/>
                                "Cambia el tipo de moneda" <break time="0.02s"/> seguido del nombre de la moneda a la que deseas cambiar. 
                              </speak>`;
                              
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .reprompt(speakOutput)
                        .getResponse();
                
                }else{
                    
                    speakOutput = `<speak>
                                    Lo lamento el tipo de moneda ${currency} no está disponible. Los tipos de moneda disponibles son soles, dólares y euros. 
                                    <break time="0.05s"/>
                                    ¿Cuál es el tipo de moneda al que deseas cambiar?.  
                                    </speak>`;
                                    
                    return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .addElicitSlotDirective('currencyType')
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