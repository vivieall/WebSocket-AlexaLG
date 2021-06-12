const socket = require('ws');
const constants = require("../../constants/constants");
const utils = require("../../utils/util");

const handlers = [
    {
        async canHandle(handlerInput) {
            
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                 && handlerInput.requestEnvelope.request.intent.name === "ChangeLanguageIntent"
                 && !handlerInput.requestEnvelope.request.intent.slots.language.value
        },
        async handle(handlerInput) {
            let speakOutput;
            let x = {};
            let ws;
            let response = {};
            let data = {};
                                                                    
            try{
                
                x = {
                    screen: `languages`,
                    intent: `ChangeLanguageIntent`,
                    parameters: [],
                };
                    
                ws = new socket(constants.SOCKET_URL);
                ws.on('open', function open(){
                    ws.send(JSON.stringify(x));
                    ws.close();
                });
                
            
                speakOutput = `<speak>
                                Para proceder con el cambio del lenguaje es necesario que indiques el idioma al que deseas cambiar.
                                Puedes elegir entre español, inglés y portugués.
                                <break time="0.01s"/>
                                ¿Cuál es el nombre del lenguaje al que deseas cambiar?
                              </speak>`;
                              
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .addElicitSlotDirective('language')
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
                 && handlerInput.requestEnvelope.request.intent.name === "ChangeLanguageIntent"
                 && handlerInput.requestEnvelope.request.intent.slots.language.value
        },
        async handle(handlerInput) {
            let speakOutput;
            let x = {};
            let ws;
            let response = {};
            let data = {};
                                                                    
            try{

                const language = handlerInput.requestEnvelope.request.intent.slots.language.value;
                //const languageId = handlerInput.requestEnvelope.request.intent.slots.language.resolutions.resolutionsPerAuthority[0].values[0].value.id;
                const languages = [{name: 'español',id: 1 },{name: 'ingles',id: 2 },{name: 'portugués',id: 3 },{name: 'Inglés',id: 2 },{name: 'portugues',id: 3 }];
                
                const languageObject = languages.find(x => x.name.toLowerCase() === language.toLowerCase());
                
                if(languageObject){
                    
                    const languageId = languageObject.id;
                     x = {
                    screen: `languages`,
                    intent: `ChangeLanguageIntent`,
                    parameters: [{name: 'language', value: languageId}],
                    };
                    
                    ws = new socket(constants.SOCKET_URL);
                    ws.on('open', function open(){
                        ws.send(JSON.stringify(x));
                        ws.close();
                    });
                    
                    
                    speakOutput = `<speak>
                                La solicitud se ha completado con éxito. El idioma ha sido cambiado a ${language}.
                                Recuerda que:
                                Para modificar nuevamente el lenguaje del televisor, debes decir: <break time="0.02s"/>
                                "Cambia el idioma" <break time="0.02s"/> seguido del nombre del lenguaje al que deseas cambiar. 
                              </speak>`;
                              
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .getResponse();
                
                }else{
                    
                    speakOutput = `<speak>
                                    Lo lamento, el idioma no se encuentra disponible.  Los idiomas disponibles son   Español, Inglés y Portugués.  
                                    <break time="0.05s"/>
                                    ¿Cuál es idioma al que deseas cambiar?
                                    </speak>`;
                                    
                    return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .addElicitSlotDirective('language')
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