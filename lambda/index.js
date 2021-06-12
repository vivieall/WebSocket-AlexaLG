// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistencerequire('node-fetch');, api calls, and more.
const Alexa = require('ask-sdk-core');
const WebSocket = require('ws');
const fetch = require('node-fetch');
const baseUrl = 'wss://socket-app-ws.herokuapp.com';
const baseUrlAPI = 'https://ires2-tesis-backend.herokuapp.com/api/v1';
var constants = require("./constants/constants.js");
var utils = require("./utils/util.js");



const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = `<speak>Bienvenido al sistema de entretenimiento STAY. Ponemos a tu disposición los siguientes servicios: <break time="0.02s"/>
                            - Reservar restaurantes, gimnasios y spas. <break time="0.02s"/>
                            - Acceder a información sobre instalaciones, eventos y lugares de interés. <break time="0.02s"/>
                            - Comprar en la tienda de productos. <break time="0.02s"/>
                            - Visualizar el historial de reservas. <break time="0.02s"/>
                            - Visualizar el estado de cuenta de tu estadía. <break time="0.02s"/>
                            - Cambiar el idioma de la interfaz del sistema a español, inglés o portugués. <break time="0.02s"/>
                            - Cambiar el tipo de moneda a soles, dólares o euros. <break time="0.02s"/>
                            Entonces, ¿en qué puedo ayudarte?
                            </speak>`;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};



const YesIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.YesIntent';
    },
    async handle(handlerInput) {
       const attributesManager = handlerInput.attributesManager;
       const attributes = await attributesManager.getSessionAttributes() || {};
       const currentIntent = attributes.currentIntent;
       
       
       const hsiaPackageId = attributes.hsiaPackageId;
       const hsiaPackageName = attributes.hsiaPackageName;
       const hsiaPackageNumberDays = attributes.hsiaPackageNumberDays;
       const hsiaPackagePrice = attributes.hsiaPackagePrice;
       let speakOutput = "";
       let response = {};
       let ws;
       let body = {};
       let postResult;
       
       switch (currentIntent) {
          case 'RequestHigherInternetIntent':
                const JSONResult = await getDataAsync(`${baseUrlAPI}/hsia-packages`);
                const hsiaPackages = JSONResult.data.length > 0 ? JSONResult.data : [];
                const nameListText = hsiaPackages.map(item => item.name);
                let nameListSpeech = nameListText.join(', ');
                nameListSpeech = nameListSpeech.replace(/,([^,]+)$/, ' y$1');
                
                
                response = {
                        screen: `highSpeed`,
                        intent: `requestHigherInternet`,
                        parameters: []
                };
                
                ws = new WebSocket(baseUrl);
                    ws.on('open', function open(){
                    ws.send(JSON.stringify(response));
                    ws.close();
                }); 
                
                
                speakOutput = `<speak>
                                Los paquetes disponibles para su compra en este momento son:
                                ${nameListSpeech}.<break time="0.05s"/>
                                Para obtener más información sobre el paquete, diga "Dime más sobre" <break time="0.05s"/> seguido del nombre del paquete.
                                Si está listo para comprar, diga "Comprar" <break time="0.05s"/> seguido del nombre del paquete. 
                                Entonces, ¿en que puedo ayudarte?
                                </speak>`
                return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse(); 
            break;
            
            
            
          case 'BuyInternetPackageIntent':
                
                try{
                    body = {
                        guest_id: 2,
                        hsia_package_id: hsiaPackageId, 
                        number_days: parseInt(hsiaPackageNumberDays),
                        application_date: new Date()
                        
                    }
                    console.log(body);
                    const subscriptionResult = utils.post(`${baseUrlAPI}/hsia-subscriptions`, body);
                    
                    body = {
                        
                        currency_symbol: 'S/.',
                        amount: parseInt(hsiaPackageNumberDays)*hsiaPackagePrice,
                        guest_id: 2,
                        transaction_description: `Plan internet ${hsiaPackageName}/${hsiaPackageNumberDays} días`,
                        transaction_datetime: new Date()
                        
                    }
                    console.log(body);
                    const transactionResult = utils.post(`${baseUrlAPI}/transactions`, body);
                    speakOutput = `<speak>
                                    Se ha procesado su subscripción. En pocos minutos un administrador se contactará con usted para brindarle las credenciales correspondientes a su subscripción. 
                                    Recuerda que para ver tu historial diga "Muéstrame mi historial de compras". <break time="0.05s"/>
                                    Gracias por su compra.
                                  </speak>`;
                    response = {
                        screen: `highSpeed`,
                        intent: `buyInternetPackage`,
                        parameters: [{name: "hsiaPackageId", value: hsiaPackageId},{name: "startBuy", value: true},{name:"days", value: parseInt(hsiaPackageNumberDays)},
                            {name:"endBuy", value: true}]
                    };
                    
                    ws = new WebSocket(baseUrl);
                        ws.on('open', function open(){
                        ws.send(JSON.stringify(response));
                        ws.close();
                    });               
                    
                }catch(ex){
                    console.log(ex)
                    speakOutput = `<speak>
                                    ${ex}
                                   </speak>`;
                }
                return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
                
            
          case 'ShowInfoInternetPackageIntent':
                
                response = {
                    screen: 'highSpeed',
                    intent: `showInfoInternetPackage`,
                    parameters: [{name:`hsiaPackageId`, value: hsiaPackageId}, {name: `startBuy`, value: true}]
                };
                
                ws = new WebSocket(baseUrl);
                    ws.on('open', function open(){
                    ws.send(JSON.stringify(response));
                    ws.close();
                }); 
                
                console.log(hsiaPackageName);
                speakOutput = `<speak>
                                Para proceder con la compra del paquete es necesario que indiques el número de días que durará tu subscripción. 
                                Recuerda que el monto total de tu subscripción depende directamente del número de días que elijas. 
                                ¿Cuál es el número de días de tu subscripción?
                                </speak>`
                                
                
                return handlerInput.responseBuilder
                .addElicitSlotDirective("numberDays",{
                    name: "BuyInternetPackageIntent",
                    slots: {internetPackage: {
                            name: 'internetPackage',
                            value: hsiaPackageName,
                            confirmationStatus: 'NONE'
                    }}
                })
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
            break;
          default:
            return handlerInput.responseBuilder
                .speak('dijiste si')
                .reprompt('dijiste si')
                .getResponse();
            break;
        }
    }
}


const NoIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NoIntent';
    },
    handle(handlerInput) {
         return handlerInput.responseBuilder
                .speak('Lo entiendo, no dudes en volver a consultar')
                .reprompt('Lo entiendo, no dudes en volver a consultar')
                .getResponse();
    }
}



const HelloWorldIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelloWorldIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Hello World!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};


const HelpYouCommandsHandler = {
    canHandle(handlerInput){
         return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'HelpYouCommands'    
    },
    handle(handlerInput, error){
        const speakOutput = `Accediste a la lista de funcionalidades disponibles en el sistema: 
                             - Para visualizar los servicios del hotel puedes decir: "Quiero ver los servicios del hotel"
                             - Para buscar un determinado servicio puedes decir: "Quiero buscar un servicio"
                             - Para reservar los servicios del hotel puedes decir: "Quiero hacer una reserva"
                             - Para visualizar el clima de la semana puedes decir: "Quiero ver el clima"`;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};




// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};




const StartedInProgressListServiceIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'ListServiceIntent'
            && !handlerInput.requestEnvelope.request.intent.slots.service.value
    },
    handle(handlerInput){
        return handlerInput.responseBuilder
          .speak('Los servicios disponibles son los siguientes: restaurantes, gimnasios, spas, eventos e instalaciones del hotel. ¿Qué servicio deseas visualizar?')
          .reprompt('Los servicios disponibles son los siguientes: restaurantes, gimnasios, spas, eventos e instalaciones del hotel. ¿Qué servicio deseas visualizar?')
          .addElicitSlotDirective('service')
          .getResponse();
    }
}




// Get Weathet Forecast
const GetWeatherForecastIntentHandler = {
    canHandle(handlerInput) {
         return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetWeatherForecastIntent';
    },
    async handle(handlerInput) {
        
        let speakOutput = '';
        
        try{
            let ws = new WebSocket(baseUrl)
            const response = {
                screen: 'weathers',
                intent: '',
                parameters: [],
            }
            ws.on('open', function open(){
                ws.send(JSON.stringify(response));
                ws.close();
            }) 
            
            speakOutput = 'El pronóstico del clima de la semana se muestra en el televisor.'
            
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        } catch(err){
            speakOutput = 'No se ha podido realizar la solicitud'
            console.log("err",err)
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        }
    }
}


const CompletedListServiceIntentHandler = {
    canHandle(handlerInput){
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'ListServiceIntent'
            && handlerInput.requestEnvelope.request.intent.slots.service.value;
    },
    async handle(handlerInput){
        let service = handlerInput.requestEnvelope.request.intent.slots.service.value;
        let getServiceUrl = '';
        let speakOutput = '';
        let serviceType = '';
        
        switch (service) {
        case 'restaurantes':
            getServiceUrl = `${baseUrlAPI}/restaurants`;
            serviceType = 'restaurantes';
        break;
        case 'restaurante':
            getServiceUrl = `${baseUrlAPI}/restaurants`;
            serviceType = 'restaurantes';
        break;
        case 'spas':
            getServiceUrl = `${baseUrlAPI}/spas`;
            serviceType = 'spas';
        break;
        case 'spa':
            getServiceUrl = `${baseUrlAPI}/spas`;
            serviceType = 'spas';
        break;
        case 'gimnasios':
            getServiceUrl = `${baseUrlAPI}/gyms`;
            serviceType = 'gimnasios';
        break;
        case 'gimnasio':
            getServiceUrl = `${baseUrlAPI}/gyms`;
            serviceType = 'gimnasios';
        break;
        case 'eventos':
            getServiceUrl = `${baseUrlAPI}/events`;
            serviceType = 'eventos';
        break;
        case 'evento':
            getServiceUrl = `${baseUrlAPI}/events`;
            serviceType = 'eventos';
        break;
        case 'instalaciones':
            getServiceUrl = `${baseUrlAPI}/locals`;
            serviceType = 'instalaciones';
        break;
        case 'instalacion':
            getServiceUrl = `${baseUrlAPI}/locals`;
            serviceType = 'instalaciones';
        break;
        default:
        break;
        }
        console.log(getServiceUrl);
        try{
            let json = await getDataAsync(getServiceUrl);
            let response = json.data;
            console.log(response);
            speakOutput = `En su televisor se muestra la información de los ${serviceType}:`;
            for (var i=0; i<response.length; i++){
                if(i === 0){
                    //first record
                    speakOutput = `${speakOutput} ${response[i].name},`;
                }else if(i === response.length - 1){
                    //last record
                    speakOutput = `${speakOutput} y ${response[i].name}.`;
                }else{
                    //middle record(s)
                    speakOutput = `${speakOutput} ${response[i].name}, `;
                }
            }
          
            let ws = new WebSocket(baseUrl);
            let event = 'view-service';
            let payload = {
                event: event,
                param: service
            }
            
            ws.on('open', function open(){
                ws.send(JSON.stringify(payload));
                ws.close();
            })
              
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        }catch(err){
            return handlerInput.responseBuilder
                .speak(err)
                .getResponse();
        }
    }
}

const StartedInProgressFindServiceIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'FindServiceIntent'
            && handlerInput.requestEnvelope.request.intent.slots.service.value
            && !handlerInput.requestEnvelope.request.intent.slots.name.value;
    },
    async handle(handlerInput) {
        let service = handlerInput.requestEnvelope.request.intent.slots.service.value;
        let getServiceUrl = '';
        let speakOutput = '';
        
        switch (service) {
        case 'restaurante':
            getServiceUrl = `${baseUrlAPI}/restaurants`
        break;
        case 'spa':
            getServiceUrl = `${baseUrlAPI}/spas`
        break;
        case 'gimnasio':
            getServiceUrl = `${baseUrlAPI}/gyms`
        break;
        case 'evento':
            getServiceUrl = `${baseUrlAPI}/events`
        break;
        case 'instalacion':
            getServiceUrl = `${baseUrlAPI}/locals`
        break;
        default:
        break;
        }
        console.log(getServiceUrl);
        try{
            let json = await getDataAsync(getServiceUrl);
            let response = json.data;
            console.log(response);
            speakOutput = `Los ${service}s que tiene el hotel son:`;
            for (var i=0; i<response.length; i++){
                if(i === 0){
                    //first record
                    speakOutput = `${speakOutput} ${response[i].name},`;
                }else if(i === response.length - 1){
                    //last record
                    speakOutput = `${speakOutput} y ${response[i].name}.`;
                }else{
                    //middle record(s)
                    speakOutput = `${speakOutput} ${response[i].name}, `;
                }
            }
            speakOutput = `${speakOutput} ¿Cuál es el nombre del ${service} que desea visualizar?.`
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .addElicitSlotDirective('name')
                .getResponse();
        }catch(err){
            return handlerInput.responseBuilder
                .speak(err)
                .reprompt(err)
                .getResponse()
        }
    }
}

const CompletedFindServiceIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'FindServiceIntent'
            && handlerInput.requestEnvelope.request.intent.slots.service.value
            && handlerInput.requestEnvelope.request.intent.slots.name.value;
    },
    async handle(handlerInput) {
        let service = handlerInput.requestEnvelope.request.intent.slots.service.value;
        let name = handlerInput.requestEnvelope.request.intent.slots.name.value;
        let getServiceUrl = '';
        let baseServiceUrl = '';
        let speakOutput = '';
        
        switch (service) {
        case 'restaurante':
            baseServiceUrl = `${baseUrlAPI}/restaurants`
            getServiceUrl = `${baseUrlAPI}/restaurants?name=${name}`
        break;
        case 'spa':
            baseServiceUrl = `${baseUrlAPI}/spas`
            getServiceUrl = `${baseUrlAPI}/spas?name=${name}`
        break;
        case 'gimnasio':
            baseServiceUrl = `${baseUrlAPI}/gyms`
            getServiceUrl = `${baseUrlAPI}/gyms?name=${name}`
        break;
        case 'evento':
            baseServiceUrl = `${baseUrlAPI}/events`
            getServiceUrl = `${baseUrlAPI}/events?name=${name}`
        break;
        case 'instalacion':
            baseServiceUrl = `${baseUrlAPI}/locals`
            getServiceUrl = `${baseUrlAPI}/locals?name=${name}`
        break;
        default:
        break;
        }
        console.log(getServiceUrl);
        try{
            let json = await getDataAsync(getServiceUrl);
            let response = json.data;
            console.log(response);
            console.log(validateSlots(response,name));
            if(validateSlots(json.data,name)){
                
                let ws = new WebSocket(baseUrl);
                let event = 'find-service';
                let payload = {
                    event: event,
                    serviceType: service,
                    param: name
                }
            
                ws.on('open', function open(){
                    ws.send(JSON.stringify(payload));
                    ws.close();
                })
                
                
                speakOutput = `La información del ${service} ${name} se muestra en el televisor.`
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .getResponse();   
            }else{
                
                let json = await getDataAsync(baseServiceUrl);
                let response = json.data;
                
                speakOutput = `El nombre del ${service} es incorrecto. Recuerda que los ${service}s del hotel son los siguientes: `;
                 for (let i=0; i<response.length; i++){
                    if(i === 0){
                        //first record
                        speakOutput = `${speakOutput} ${response[i].name},`;
                    }else if(i === response.length - 1){
                        //last record
                        speakOutput = `${speakOutput} y ${response[i].name}.`;
                    }else{
                        //middle record(s)
                        speakOutput = `${speakOutput} ${response[i].name}, `;
                    }
                }
                speakOutput = `${speakOutput} ¿Cuál es el nombre del ${service} que desea visualizar?.`
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .addElicitSlotDirective('name')
                    .getResponse();   
            }
        }catch(err){
            return handlerInput.responseBuilder
                .speak(err)
                .reprompt(err)
                .getResponse()
        }
    }
}




const StartedInProgressBookingServiceIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "IntentRequest"
      && handlerInput.requestEnvelope.request.intent.name === "BookingServiceIntent"
      && handlerInput.requestEnvelope.request.dialogState !== 'COMPLETED';
  },
  handle(handlerInput) {
      
    let ws = new WebSocket(baseUrl)
    let event = 'start-booking';
    
    let response = {
                    event: event,
                    param: ''
                }
                
                
                
    console.log(response);
    ws.on('open', function open(){
        ws.send(JSON.stringify(response));
        ws.close();
    });  
      
   return handlerInput.responseBuilder
            .addDelegateDirective()
            .getResponse();
  }
}


const RestaurantGivenBookingServiceIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "IntentRequest"
      && handlerInput.requestEnvelope.request.intent.name === "BookingServiceIntent"
      && handlerInput.requestEnvelope.request.intent.slots.service.value 
      && !handlerInput.requestEnvelope.request.intent.slots.name.value
  },
  handle(handlerInput) {
    
    let ws = new WebSocket(baseUrl)
    let service = handlerInput.requestEnvelope.request.intent.slots.service.value;  
    let event = 'start-booking';
    let response1 = {
                    event: event,
                    param: '' 
                }
    
        ws.on('open', function open(){
        ws.send(JSON.stringify(response1));
        ws.close();
    });
    
    let response2 = {
                    event:'edit-service',
                    param: service 
                }
    
    
    ws.on('open', function open(){
        ws.send(JSON.stringify(response2));
        ws.close();
    });  
    
    return handlerInput.responseBuilder
      .speak(`¿Cuál es el nombre del ${service}?`)
      .reprompt(`¿Cuál es el nombre del ${service}?`)
      .addElicitSlotDirective('name')
      .getResponse();
  }
}

const BookingServiceGetDateIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "IntentRequest"
      && handlerInput.requestEnvelope.request.intent.name === "BookingServiceIntent"
      && handlerInput.requestEnvelope.request.intent.slots.service.value 
      && handlerInput.requestEnvelope.request.intent.slots.name.value
      && !handlerInput.requestEnvelope.request.intent.slots.date.value
  },
  async handle(handlerInput) {

    let name = handlerInput.requestEnvelope.request.intent.slots.name.value;   
    let event = 'edit-service-name';
    let serviceType = '';
    let service = handlerInput.requestEnvelope.request.intent.slots.service.value;
    let speakOutput = '';
    
    switch (service) {
        case 'restaurante':
            serviceType = 'restaurants'
        break;
        case 'spa':
            serviceType = 'spas'
        break;
        case 'gimnasio':
            serviceType = 'gyms'
        break;
        case 'evento':
            serviceType = 'events'
        break;
        case 'instalacion':
            serviceType = 'locals'
        break;
        default:
            serviceType = ''
        break;
    } 
    console.log(serviceType);
    let fetchUrl = `https://ires2-tesis-backend.herokuapp.com/api/v1/${serviceType}`
    try{
        let json = await getDataAsync(fetchUrl);
        console.log(json);
        let response = json.data;
        console.log('validacion' + validateSlots(response, name));
        console.log(name);
        if(validateSlots(response, name)){
            
            let instruction = {
                event: event,
                param: name
            }
            console.log(instruction);
            let ws = new WebSocket(baseUrl);
            ws.on('open', function open(){
                ws.send(JSON.stringify(instruction));
                ws.close();
            });
            
            return handlerInput.responseBuilder
            .speak('¿Cuál es la fecha de la reserva?')
            .reprompt('¿Cuál es la fecha de la reserva?')
            .addElicitSlotDirective('date')
            .getResponse();     
            
        }else{
          
        speakOutput = `El nombre del ${service} es incorrecto. Actualmente hay ${response.length} ${service}s en el hotel. `
        for (var i=0; i<response.length; i++){
            if(i === 0){
                //first record
                speakOutput = speakOutput  + 'Sus nombres son: ' + response[i].name + ', '
            }else if(i === response.length - 1){
                //last record
                speakOutput = speakOutput + 'y ' + response[i].name + `. ¿Cuál es el nombre del ${service} que desea reservar?`
            }else{
                //middle record(s)
                speakOutput = speakOutput + response[i].name + ', '
            }
            
        }
        
        console.log(speakOutput);
         return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(speakOutput)
        .addElicitSlotDirective('name')
        .getResponse();   
        }
    }catch(err){
        console.log(err);
        return handlerInput.responseBuilder
        .speak(err)
        .getResponse();
    }
  }
}


const BookingServiceGetHoursIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "IntentRequest"
      && handlerInput.requestEnvelope.request.intent.name === "BookingServiceIntent"
      && handlerInput.requestEnvelope.request.intent.slots.service.value 
      && handlerInput.requestEnvelope.request.intent.slots.name.value
      && handlerInput.requestEnvelope.request.intent.slots.date.value
      && !handlerInput.requestEnvelope.request.intent.slots.hours.value
  },
  handle(handlerInput) {

    let date = handlerInput.requestEnvelope.request.intent.slots.date.value;  
    let ws = new WebSocket(baseUrl)
    let event = 'edit-service-date';
    let response = {
                    event: event,
                    param: date 
                }
    
    ws.on('open', function open(){
        ws.send(JSON.stringify(response));
        ws.close();
    });  
    
    return handlerInput.responseBuilder
      .speak('¿Cuál es la hora de la reserva?, recuerda que el horario de atención es de las 7.00 am a las 10.00 pm.')
      .reprompt('¿Cuál es la hora de la reserva?')
      .addElicitSlotDirective('hours')
      .getResponse();
  }
}



const ConfirmBookingServiceIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "IntentRequest"
        && handlerInput.requestEnvelope.request.intent.name === "BookingServiceIntent"
        && handlerInput.requestEnvelope.request.intent.slots.service.value
        && handlerInput.requestEnvelope.request.intent.slots.name.value
        && handlerInput.requestEnvelope.request.intent.slots.date.value
        && handlerInput.requestEnvelope.request.intent.slots.hours.value
        && !handlerInput.requestEnvelope.request.intent.slots.confirm.value
  },
  handle(handlerInput) {
     
    let service = handlerInput.requestEnvelope.request.intent.slots.service.value;
    let name = handlerInput.requestEnvelope.request.intent.slots.name.value;
    let date = handlerInput.requestEnvelope.request.intent.slots.date.value;
    let hours = handlerInput.requestEnvelope.request.intent.slots.hours.value;
    
    let ws = new WebSocket(baseUrl)
    let event = 'edit-service-hours';
    let response = {
                    event: event,
                    param: hours 
                }
    
    ws.on('open', function open(){
        ws.send(JSON.stringify(response));
        ws.close();
    });  
    
    const speechText = `Tu reserva del ${service} ${name} se programó para el día  ${date}  a las ${hours}. ¿Quieres confirmar la reserva? Puedes decir "Sí" para confirmar o "No" para cancelar la reserva`;
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .addElicitSlotDirective('confirm')
      .getResponse();
    
    
  }
}


const CompletedBookingServiceIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "IntentRequest"
        && handlerInput.requestEnvelope.request.intent.name === "BookingServiceIntent"
        && handlerInput.requestEnvelope.request.intent.slots.service.value
        && handlerInput.requestEnvelope.request.intent.slots.name.value
        && handlerInput.requestEnvelope.request.intent.slots.date.value
        && handlerInput.requestEnvelope.request.intent.slots.hours.value
        && handlerInput.requestEnvelope.request.intent.slots.confirm.value
        && handlerInput.requestEnvelope.request.dialogState === "COMPLETED";
  },
  handle(handlerInput) {
     
    let speakOutput = '';
    let confirm = handlerInput.requestEnvelope.request.intent.slots.confirm.value;
    if(confirm === 'si'){
        let ws = new WebSocket(baseUrl)
        let event = 'show-booking-modal';
        let response = {
                    event: event,
                    param: '' 
                }
    
    ws.on('open', function open(){
        ws.send(JSON.stringify(response));
        ws.close();
    });  
        speakOutput = 'Tu reserva se ha realizado exitosamente.'
    } 
    else{
        speakOutput = 'Haz cancelado la reserva. Puedes decir "quiero hacer una reserva" para empezar a reservar.'
    }
    return handlerInput.responseBuilder
    .speak(speakOutput)
    .getResponse();
  }
}


const StartInProgressWatchNewsIntentHandler = {
    async canHandle(handlerInput){
        return handlerInput.requestEnvelope.request.type === "IntentRequest"
            && handlerInput.requestEnvelope.request.intent.name === "WatchNewsIntent"
            && !handlerInput.requestEnvelope.request.intent.slots.topic.value
    },
    async handle(handlerInput){
        const topics = constants.topics;
        const nameListText = topics.map(e => e.es);
        let nameListSpeech = nameListText.join(`, `);
        nameListSpeech = nameListSpeech.replace(/,([^,]+)$/, ' y$1');
        
        const response = {
            screen: `news`,
            intent: `listTouristicPlaces`,
            parameters: []
        };
        
        const attributesManager = handlerInput.attributesManager;
        const attributes = await attributesManager.getSessionAttributes() || {};
        attributes.currentIntent = 'watchNewsIntent';
        attributesManager.setSessionAttributes(attributes); 
                
        let ws = new WebSocket(baseUrl);
        ws.on('open', function open(){
            ws.send(JSON.stringify(response));
            ws.close();
        }); 
        
        const speakOutput = `<speak>
                            Actualmente disponemos de ${topics.length} tópicos de noticias, los cuales son:
                            ${nameListSpeech}.<break time="0.05s"/>
                            En estos momentos, en su televisor se muestran las 10 principales noticias sobre actualidad.
                            Para cambiar de tópico de noticias, di "Cambia a" <break time="0.05s"/> seguido del nombre del tipo de noticia.
                            Entonces, ¿en qué puedo ayudarte?
                            </speak>`
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};


const CompletedWatchNewsIntentHandler = {
    canHandle(handlerInput){
        return handlerInput.requestEnvelope.request.type === "IntentRequest"
            && handlerInput.requestEnvelope.request.intent.name === "WatchNewsIntent"
            && handlerInput.requestEnvelope.request.intent.slots.topic.value 
            && handlerInput.requestEnvelope.request.dialogState === "COMPLETED"
    },
    handle(handlerInput){
        const request = handlerInput.requestEnvelope.request;
        const topic = request.intent.slots.topic.value;
        let speakOutput = "";
        if(utils.validateTopic(topic)){
            speakOutput = `<speak>
                            En su televisor se muestran las diez principales noticias del tópico de ${topic}
                           </speak>`
                           
            const response = {
                screen: "news",
                intent: "watchNewsIntent",
                parameters: [{name:"topic", value: topic}]
            };
            
            let ws = new WebSocket(baseUrl)
            ws.on('open', function open(){
                ws.send(JSON.stringify(response))
                ws.close();
            });
            
            return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
        }else{
            const topics = constants.topics;
            speakOutput = "Lo lamento, el tópico elegido es incorrecto. Puedes elegir entre";
            for(let i =0; i < topics.length; i++){
                speakOutput = i !== topics.length - 1 
                ? `${speakOutput} ${topics[i].es},` 
                : `${speakOutput} y ${topics[i].es}. ¿Cuál es el tópico de noticias que desea visualizar?`
            }
            
            return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .addElicitSlotDirective("topic")
            .getResponse();
        }
    }
}

const ChangeNewsTopicIntentHandler = {
    async canHandle(handlerInput){
        const attributesManager = handlerInput.attributesManager;
        const attributes = await attributesManager.getSessionAttributes() || {};
        const currentIntent = attributes.currentIntent;
        return handlerInput.requestEnvelope.request.type === "IntentRequest"
            && handlerInput.requestEnvelope.request.intent.name === "ChangeNewsTopicIntent"
            && handlerInput.requestEnvelope.request.intent.slots.topic.value
            && currentIntent === "watchNewsIntent"
    },
    async handle(handlerInput){
        try{
            const topics = constants.topics;
            const topic = handlerInput.requestEnvelope.request.intent.slots.topic.value;
            const nameListText = topics.map(e => e.es);
            let nameListSpeech = nameListText.join(`, `);
            nameListSpeech = nameListSpeech.replace(/,([^,]+)$/, ' y$1');
            
            const searchResult = topics.find(e => e.es.toLowerCase() === topic.toLowerCase());
            
            if(searchResult){
                const response = {
                    screen: "news",
                    intent: "changeNewsTopic",
                    parameters: [
                            {name:"topic", value: searchResult.en},
                        ]
                    }
                    
                let ws = new WebSocket(baseUrl);
                ws.on('open', function open(){
                    ws.send(JSON.stringify(response));
                    ws.close();
                });                    
                    
                const attributesManager = handlerInput.attributesManager;
                const attributes = await attributesManager.getSessionAttributes() || {};
                attributes.topic = searchResult.en;
                attributesManager.setSessionAttributes(attributes);
                    
                const speakOutput = `<speak> 
                                    Haz seleccionado el tópico de noticias de ${topic}. 
                                    En el televisor se muestran las 10 principales noticias del tópico seleccionado.
                                    </speak>`;
                return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
                    
                }else{
                    const speakOutput = `<speak> 
                                        Lo lamento, la categoría brindada no se encuentra dentro de los tópicos de noticias disponibles. 
                                        Recuerda que los tópicos disponibles son: 
                                        ${nameListSpeech}. 
                                        Entonces, ¿Cuál es el nombre del tópico de noticias que desea visualizar?
                                        </speak>`;
                    return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .addElicitSlotDirective('topic')
                    .getResponse();
                }
        }catch(ex){
            console.log(ex);
            const speakOutput = `<speak>
                                Lo siento, ha ocurrido un error inesperado y no se ha podido procesar su solicitud. 
                                Por favor, comuníquese con el administrador al siguiente al número <say-as interpret-as="telephone">945433992</say-as></speak>`;
            return handlerInput.responseBuilder
            .speak(ex)
            .reprompt(ex)
            .getResponse();
        }
    }
};

// #region HSIA-FEATURE

    const RequestHigherInternetIntentHandler = {
        canHandle(handlerInput){
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                && handlerInput.requestEnvelope.request.intent.name === "RequestHigherInternetIntent"
        },
        async handle(handlerInput){
            try{
                //call endpoint api/v1/hsiapackages
                const speakOutput = `<speak>
                                    Actualmente posees el nivel de conexión básico que ofrece el hotel a sus huéspedes que es de 5 Megabytes por segundo.
                                    Sin embargo, podemos ofrecerte paquetes de mayor velocidad que se ajusten a tus necesidades. 
                                    ¿Deseas que muestre los paquetes de internet que tenemos disponibles?
                                    </speak>`
                
                const attributesManager = handlerInput.attributesManager;
                const attributes = await attributesManager.getSessionAttributes() || {};
                attributes.currentIntent = 'RequestHigherInternetIntent';
                
                attributesManager.setSessionAttributes(attributes);
                
                return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
            }catch(ex){
                const speakOutput = ex;
                console.log(ex);
                return handlerInput.responseBuilder
                .speak(speakOutput)
                .getResponse();
            }
        }
    }
    
    
    
    const StartedShowInfoInternetPackageIntentHandler = {
        async canHandle(handlerInput){
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                && handlerInput.requestEnvelope.request.intent.name === "ShowInfoInternetPackageIntent"
                && !handlerInput.requestEnvelope.request.intent.slots.internetPackage.value
        },
        async handle(handlerInput){
            //call endpoint api/v1/internetPackages
            try{
                const intent = handlerInput.requestEnvelope.request.intent;
                const packageName = intent.slots.internetPackage.value; 
                const JSONResult = await getDataAsync(`${baseUrlAPI}/hsia-packages`);
                const hsiaPackages = JSONResult.data.length > 0 ? JSONResult.data : [];
        
                const nameListText = hsiaPackages.map(item => item.name);
                let nameListSpeech = nameListText.join(', ');
                nameListSpeech = nameListSpeech.replace(/,([^,]+)$/, ' y$1');
                
                const speakOutput = `<speak>
                                    Los paquetes disponibles para su compra en este momento son: 
                                    ${nameListSpeech}. 
                                    Puedes indicarme el nombre del paquete del cuál deseas información?
                                    </speak>`;
                
                return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .addElicitSlotDirective('internetPackage')
                .getResponse();
            
            }catch(ex){
                const speakOutput = `Lo siento, ha ocurrido un error inesperado y no se ha podido procesar su solicitud. Por favor, 
                comuniquese con el administrador al siguiente al numero 945433992`;
                return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
            }
        }
    }
    
    
    const CompletedShowInfoInternetPackageIntentHandler = {
        canHandle(handlerInput){
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                && handlerInput.requestEnvelope.request.intent.name === "ShowInfoInternetPackageIntent"
                && handlerInput.requestEnvelope.request.intent.slots.internetPackage.value
        },
        async handle(handlerInput){
            //call endpoint api/v1/internetPackages?name=${name}
            try{
                const intent = handlerInput.requestEnvelope.request.intent;
                const packageName = intent.slots.internetPackage.value; 
                const JSONResult = await getDataAsync(`${baseUrlAPI}/hsia-packages`);
                const hsiaPackages = JSONResult.data.length > 0 ? JSONResult.data : [];
        
                const nameListText = hsiaPackages.map(item => item.name);
                let nameListSpeech = nameListText.join(', ');
                nameListSpeech = nameListSpeech.replace(/,([^,]+)$/, ' y$1');
                
                const searchResult = hsiaPackages.find(e => e.name.toLowerCase() === packageName.toLowerCase());
                if(searchResult){
                    const speakOutput = `<speak>
                                         El paquete ${packageName} ofrece los siguentes beneficios: <break time="0.05s"/>
                                         ${searchResult.description}
                                         Este paquete tiene un costo de ${searchResult.total_amount} soles por día.
                                         ¿Estás interesado en adquirir este paquete?
                                        </speak>`;
                                        
                    const attributesManager = handlerInput.attributesManager;
                    const attributes = await attributesManager.getSessionAttributes() || {};
                    attributes.currentIntent = 'ShowInfoInternetPackageIntent';
                    attributes.hsiaPackageId = searchResult.id;
                    attributes.hsiaPackageName = searchResult.name;
                    attributesManager.setSessionAttributes(attributes);
                    
                    const response = {
                        screen: `highSpeed`,
                        intent: `showInfoInternetPackage`,
                        parameters: [{name: "hsiaPackageId", value: searchResult.id},{name: "tellMeMore", value: true}]
                    };
                
                    let ws = new WebSocket(baseUrl);
                        ws.on('open', function open(){
                        ws.send(JSON.stringify(response));
                        ws.close();
                    }); 
                                    
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .reprompt(speakOutput)
                        .getResponse();
                }else{
                    const speakOutput = `<speak>
                                        Lo lamento, el paquete ${packageName} no se encuentra dentro de los paquetes de internet que podemos ofrecerte. 
                                        Puedo brindarte información de los siguientes paquetes de internet:
                                        ${nameListSpeech}
                                        ¿Cuál es el nombre del paquete de internet del cuál deseas información?
                                        </speak>`;
                    return handlerInput.responseBuilder
                    .addElicitSlotDirective("internetPackage")
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .getResponse();
                }
            }catch(ex){
                const speakOutput =`<speak>
                                    Lo siento, ha ocurrido un error inesperado y no se ha podido procesar su solicitud. 
                                    Por favor, comuníquese con el administrador al siguiente al número <say-as interpret-as="telephone">945433992</say-as>
                                    </speak>`;
            return handlerInput.responseBuilder
                .speak(ex)
                .reprompt(ex)
                .getResponse();
            }
        }
    };
    
    
    
    const StartedBuyInternetPackageIntentHandler = {
        canHandle(handlerInput){
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                && handlerInput.requestEnvelope.request.intent.name === "BuyInternetPackageIntent"
                && !handlerInput.requestEnvelope.request.intent.slots.internetPackage.value
        },
        handle(handlerInput){
            return handlerInput.responseBuilder
            .speak("comprado")
            .reprompt("comprado")
            .getResponse();
        }
    }
    
    const InProgressBuyInternetPackageIntentHandler = {
        canHandle(handlerInput){
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                && handlerInput.requestEnvelope.request.intent.name === "BuyInternetPackageIntent"
                && handlerInput.requestEnvelope.request.intent.slots.internetPackage.value
                && !handlerInput.requestEnvelope.request.intent.slots.numberDays.value
        },
        handle(handlerInput){
            
        }
    }
    
    const CompletedBuyInternetPackageIntentHandler = {
        canHandle(handlerInput){
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                && handlerInput.requestEnvelope.request.intent.name === "BuyInternetPackageIntent"
                && handlerInput.requestEnvelope.request.intent.slots.internetPackage.value
                && handlerInput.requestEnvelope.request.intent.slots.numberDays.value
        },
        async handle(handlerInput){
            //call api/v1/internetPackages?name=?
            
            try{
                
                const intent = handlerInput.requestEnvelope.request.intent;
                const packageName = intent.slots.internetPackage.value; 
                const JSONResult = await getDataAsync(`${baseUrlAPI}/hsia-packages`);
                const hsiaPackages = JSONResult.data.length > 0 ? JSONResult.data : [];
    
                const searchResult = hsiaPackages.find(e => e.name.toLowerCase() === packageName.toLowerCase());
                const numberDays = intent.slots.numberDays.value;
                let totalAmount = numberDays*searchResult.total_amount;
                totalAmount = totalAmount.toFixed(2);
                
                const response = {
                        screen: `highSpeed`,
                        intent: `buyInternetPackage`,
                        parameters: [{name: "hsiaPackageId", value: searchResult.id},{name: "startBuy", value: true},{name:"days", value: numberDays}]
                };
                
                let ws = new WebSocket(baseUrl);
                        ws.on('open', function open(){
                        ws.send(JSON.stringify(response));
                        ws.close();
                }); 
                
                const speakOutput = `<speak>
                                        Haz elegido subscribirte al plan de internet ${packageName} por ${numberDays} días, 
                                        el monto total de tu subscripción es de ${totalAmount} soles. 
                                        ¿Deseas confirmar la transacción?
                                    </speak>`
            
                //setup state
                const attributesManager = handlerInput.attributesManager;
                const attributes = await attributesManager.getSessionAttributes() || {};
                attributes.currentIntent = 'BuyInternetPackageIntent';
                attributes.hsiaPackageName = packageName;
                attributes.hsiaPackageNumberDays = numberDays;
                attributes.hsiaPackagePrice = searchResult.total_amount;

                return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
                
            }catch(ex){
                console.log(`error: ${ex}`);
                const speakOutput = `Lo siento, ha ocurrido un error inesperado y no se ha podido procesar su solicitud. Por favor, 
                comuniquese con el administrador al siguiente al numero 945433992`;
                return handlerInput.responseBuilder
                .speak(ex)
                .reprompt(ex)
                .getResponse();
            }
        }
    }
    
    
    
// #endregion

// #region INROOM-DINING FEATURE

const RequestInRoomDiningIntentHandler = {
    canHandle(handlerInput){
        return handlerInput.requestEnvelope.request.type === "IntentRequest"
            && handlerInput.requestEnvelope.request.intent.name === "RequestInRoomDiningIntent"
    },
    handle(handlerInput){
        const speakOutput = `Tenemos una gran variedad de desayunos, almuerzos y cenas que podemos ofrecerte.
                            ¿Deseas que te muestre la carta disponible el día de hoy?`
        return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(speakOutput)
        .getResponse();
    },
}



// # endregion

// #region STORE FEATURE

const StoreProductIntentHandler = {
    canHandle(handlerInput){
        return handlerInput.requestEnvelope.request.type === "IntentRequest"
            && handlerInput.requestEnvelope.request.intent.name === "StoreProductIntent"
    },
    async handle(handlerInput){
        try{
            const JSONResult = await getDataAsync(`${baseUrlAPI}/product-categories`);
            const JSONCategories = JSONResult.data.length > 0 ? JSONResult.data : [];
            const numberOfCategories = JSONCategories.length;
            const categoriesNameList = JSONCategories.map(item => item.name);
            let categoriesListSpeech = categoriesNameList.join(', ');
            categoriesListSpeech = categoriesListSpeech.replace(/,([^,]+)$/, ' y$1');
            
            //setup intent state
            const attributesManager = handlerInput.attributesManager;
            const attributes = await attributesManager.getSessionAttributes() || {};
            attributes.currentIntent = 'StoreProductIntent';
            attributesManager.setSessionAttributes(attributes); 
            
            const speakOutput = `<speak>
                                Bienvenido a la tienda online, existen ${numberOfCategories} categorías de productos disponibles para elegir, estas son: 
                                ${categoriesListSpeech}. 
                                Para cambiar de categoría diga "Cambiar" <break time="0.5s"/> seguido del nombre de la categoría de producto. 
                                Para comprar un producto diga "Comprar" <break time="0.5s"/> seguido del nombre del producto.
                                Entonces, ¿en que puedo ayudarte?
                                </speak>`
            
            
            const response = {
                screen: "store",
                intent: "changeCategoryIntent",
                parameters: []
            };
                    
            let ws = new WebSocket(baseUrl);
                ws.on('open', function open(){
                    ws.send(JSON.stringify(response));
                    ws.close();
            });                    
            
            return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
        }catch(ex){
            console.log(`error: ${ex}`);
            const speakOutput = `Lo siento, ha ocurrido un error inesperado y no se ha podido procesar su solicitud. Por favor, 
            comuniquese con el administrador al siguiente al numero 945433992`;
            return handlerInput.responseBuilder
            .speak(ex)
            .reprompt(ex)
            .getResponse();
        }
    }
};

const StartedChangeProductCategoryIntentHandler = {
    async canHandle(handlerInput){
        const attributesManager = handlerInput.attributesManager;
        const attributes = await attributesManager.getSessionAttributes() || {};
        const currentIntent = attributes.currentIntent;
        return handlerInput.requestEnvelope.request.type === "IntentRequest"
            && handlerInput.requestEnvelope.request.intent.name === "ChangeProductCategoryIntent"
            && !handlerInput.requestEnvelope.request.intent.slots.productCategory.value
            && currentIntent === "StoreProductIntent"
    },
    handle(handlerInput){
        try{
            
            /*const intent = handlerInput.requestEnvelope.request.intent;
            const categoryName = intent.slots.productCategory.value;*/
            const mockCategories = {
                    status: "ok",
                    categories: [
                        {
                            id: 1,
                            name: "Bebidas",
                            active: true,
                        },
                        {
                            id: 2,
                            name: "Postres",
                            active: true,
                        },
                        {
                            id: 3,
                            name: "Licores",
                            active: true,
                        },
                        {
                            id: 4,
                            name: "Piqueos",
                            active: true,
                        }
                    ]
                };
              
            const categories = mockCategories.categories;  
            const nameListText = categories.map(item => item.name);
            let nameListSpeech = nameListText.join(', ');
            nameListSpeech = nameListSpeech.replace(/,([^,]+)$/, ' y$1');
            
            /*const categories = mockCategories.categories;
            const searchResult = categories.find(e => e.name.toLowerCase() === categoryName.toLowerCase());
            */
            const speakOutput = `<speak>Actualmente disponemos de ${categories.length} categorías de productos en la tienda online. Estas son: ${nameListSpeech}.
                                ¿Cuál es la categoría que desea visualizar?</speak>`
            return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .addElicitSlotDirective('productCategory')
            .getResponse();
            
            
        }catch(ex){
            console.log(ex)
            const speakOutput = `<speak>Lo siento, ha ocurrido un error inesperado y no se ha podido procesar su solicitud. Por favor, 
                                comuníquese con el administrador al siguiente al número <say-as interpret-as="telephone">945433992</say-as></speak>`;
            return handlerInput.responseBuilder
            .speak(ex)
            .reprompt(ex)
            .getResponse();
            
        }
    }
}

const CompletedChangeProductCategoryIntentHandler = {
    async canHandle(handlerInput){
        const attributesManager = handlerInput.attributesManager;
        const attributes = await attributesManager.getSessionAttributes() || {};
        const currentIntent = attributes.currentIntent;
        return handlerInput.requestEnvelope.request.type === "IntentRequest"
            && handlerInput.requestEnvelope.request.intent.name === "ChangeProductCategoryIntent"
            && handlerInput.requestEnvelope.request.intent.slots.productCategory.value
            && currentIntent === "StoreProductIntent"
    },
    async handle(handlerInput){
        try{
            
            const JSONCategories = await getDataAsync(`${baseUrlAPI}/product-categories`);
            const categories = JSONCategories.data.length > 0 ? JSONCategories.data : [];
            const categoryName = handlerInput.requestEnvelope.request.intent.slots.productCategory.value;
                
            const nameListText = categories.map(item => item.name);
            let nameListSpeech = nameListText.join(', ');
            nameListSpeech = nameListSpeech.replace(/,([^,]+)$/, ' y$1');
                
            const searchResult = categories.find(e => e.name.toLowerCase() === categoryName.toLowerCase());
            
            if(searchResult){
                const JSONProducts = await getDataAsync(`${baseUrlAPI}/products?category_id=${searchResult.id}`);
                const products = JSONProducts.data.length > 0 ? JSONProducts.data : [];
                const productQuantity = products.length;
                
                const response = {
                    screen: "store",
                    intent: "changeCategoryIntent",
                    parameters: [
                            {name:"categoryId", value: searchResult.id},
                        ]
                    }
                    
                let ws = new WebSocket(baseUrl);
                ws.on('open', function open(){
                    ws.send(JSON.stringify(response));
                    ws.close();
                });                    
                    
                const attributesManager = handlerInput.attributesManager;
                const attributes = await attributesManager.getSessionAttributes() || {};
                attributes.productCategoryId = searchResult.id;
                attributesManager.setSessionAttributes(attributes);
                    
                const speakOutput = `<speak> 
                                    Haz seleccionado la categoría de ${categoryName}. En el televisor se muestran un total de ${productQuantity} productos pertenecientes a la categoría seleccionada.
                                    Recuerda que : 
                                    Para  proceder a comprar diga "Comprar" <break time="0.5s"/> seguido del nombre del producto.
                                    Para cambiar de categoría diga "Cambiar" <break time="0.5s"/> seguido del nombre de la categoría de producto.
                                    </speak>`;
                                        
                return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
                    
                }else{
                    const speakOutput = `<speak> 
                                        Lo lamento, la categoría brindada no se encuentra disponible en nuestra tienda online. 
                                        Recuerda que las categorías disponibles son: 
                                        ${nameListSpeech}. 
                                        Entonces, ¿Cuál es el nombre de la categoría que deseas visualizar?
                                        </speak>`;
                    return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .addElicitSlotDirective('productCategory')
                    .getResponse();
                }
        }catch(ex){
            console.log(ex);
            const speakOutput = `<speak>Lo siento, ha ocurrido un error inesperado y no se ha podido procesar su solicitud. Por favor, 
                                comuníquese con el administrador al siguiente al número <say-as interpret-as="telephone">945433992</say-as></speak>`;
            return handlerInput.responseBuilder
            .speak(ex)
            .reprompt(ex)
            .getResponse();
        }
    }
};

const InProgressBuyProductIntentHandler = {
    async canHandle(handlerInput){
        const attributesManager = handlerInput.attributesManager;
        const attributes = await attributesManager.getSessionAttributes() || {};
        const currentIntent = attributes.currentIntent;
        return handlerInput.requestEnvelope.request.type === "IntentRequest"
            && handlerInput.requestEnvelope.request.intent.name === "BuyProductIntent"
            && handlerInput.requestEnvelope.request.intent.slots.productName.value
            && !handlerInput.requestEnvelope.request.intent.slots.productQuantity.value
            && currentIntent === "StoreProductIntent"
    },
    async handle(handlerInput){
        try{
            const productName = handlerInput.requestEnvelope.request.intent.slots.productName.value;
            const attributesManager = handlerInput.attributesManager;
            const attributes = await attributesManager.getSessionAttributes() || {};
            const productCategoryId = attributes.productCategoryId;
            console.log(productCategoryId);
            const JSONResult = await getDataAsync(`${baseUrlAPI}/products?category_id=${productCategoryId}`);
            const JSONProducts = JSONResult.data.length > 0 ? JSONResult.data : [];
            const searchProduct = JSONProducts.find(e => e.name.toLowerCase() === productName.toLowerCase());
            if(searchProduct){
              const response = {
                  screen: `store`,
                  intent: `buyProductIntent`,
                  parameters: [
                        {name: "productId", value: searchProduct.id},
                        {name: "startBuy", value: true},
                      ]
              }  
                let ws = new WebSocket(baseUrl);
                ws.on('open', function open(){
                ws.send(JSON.stringify(response));
                ws.close();
                });
                const speakOutput = `<speak>
                                    Haz seleccionado el producto ${searchProduct.name}. Este tiene un precio unitario de <say-as interpret-as="number">${searchProduct.price}</say-as> soles.
                                    Para proseguir con la comprar es necesario que indiques las cantidad de unidades que deseas comprar.
                                    ¿Cuántas unidades del productos deseas adquirir?
                                    </speak>`;
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .addElicitSlotDirective("productQuantity")
                    .getResponse();
            }else{
                const speakOutput = `<speak>
                                    Lo lamento, al parecer el producto solicitado no se encuentra disponible en la categoría seleccionada. 
                                    Puedes utilizar el control remoto del televisor para navegar por los productos disponibles.
                                    Entonces, ¿Cuál es el nombre del producto que desea comprar?
                                    </speak>`;
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .addElicitSlotDirective('productName')
                    .getResponse();
            }
        }catch(ex){
            console.log(ex);
            const speakOutput = `<speak>Lo siento, ha ocurrido un error inesperado y no se ha podido procesar su solicitud. Por favor, 
                                comuníquese con el administrador al siguiente al número <say-as interpret-as="telephone">945433992</say-as></speak>`;
            return handlerInput.responseBuilder
            .speak(ex)
            .reprompt(ex)
            .getResponse();
        }
    }
};

const CompletedBuyProductIntentHandler = {
    async canHandle(handlerInput){
        const attributesManager = handlerInput.attributesManager;
        const attributes = await attributesManager.getSessionAttributes() || {};
        const currentIntent = attributes.currentIntent;
        return handlerInput.requestEnvelope.request.type === "IntentRequest"
            && handlerInput.requestEnvelope.request.intent.name === "BuyProductIntent"
            && handlerInput.requestEnvelope.request.intent.slots.productName.value
            && handlerInput.requestEnvelope.request.intent.slots.productQuantity.value
            && !handlerInput.requestEnvelope.request.intent.slots.confirmTransaction.value
            && currentIntent === "StoreProductIntent"
    },
    async handle(handlerInput){
        try{
            const productName = handlerInput.requestEnvelope.request.intent.slots.productName.value;
            const productQuantity = handlerInput.requestEnvelope.request.intent.slots.productQuantity.value;
            const attributesManager = handlerInput.attributesManager;
            const attributes = await attributesManager.getSessionAttributes() || {};
            const productCategoryId = attributes.productCategoryId;
            const JSONResult = await getDataAsync(`${baseUrlAPI}/products?category_id=${productCategoryId}`);
            const JSONProducts = JSONResult.data.length > 0 ? JSONResult.data : [];
            const searchProduct = JSONProducts.find(e => e.name.toLowerCase() === productName.toLowerCase());
            const totalAmount = searchProduct.price*parseInt(productQuantity);
            const response = {
                  screen: `store`,
                  intent: `buyProductIntent`,
                  parameters: [
                        {name: "productId", value: searchProduct.id},
                        {name: "startBuy", value: true},
                        {name: "productQuantity", value: parseInt(productQuantity)}
                      ]
            }  
              
            let ws = new WebSocket(baseUrl);
            ws.on('open', function open(){
            ws.send(JSON.stringify(response));
            ws.close();
            });
            
            
            const speakOutput = `<speak>
                                Este es el detalle de tu compra hasta el momento: <break time="0.05s"/>
                                ${productQuantity} ${productName} por un monto total de <say-as interpret-as="number">${totalAmount}</say-as> soles. 
                                Recuerda que este monto se agregará como cargo a tu historial de transacciones de compra.
                                ¿Estás seguro de confirmar la transacción?
                                </speak>`
                                
            return handlerInput.responseBuilder
            .addElicitSlotDirective(`confirmTransaction`)
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse()
        }catch(ex){
            console.log(ex);
            const speakOutput = `<speak>
                                Lo siento, ha ocurrido un error inesperado y no se ha podido procesar su solicitud. 
                                Por favor, comuníquese con el administrador al siguiente al número <say-as interpret-as="telephone">945433992</say-as>
                                </speak>`;
            return handlerInput.responseBuilder
            .speak(ex)
            .reprompt(ex)
            .getResponse();
        }
    }
};



const EndingBuyProductIntentHandler = {
    async canHandle(handlerInput){
        const attributesManager = handlerInput.attributesManager;
        const attributes = await attributesManager.getSessionAttributes() || {};
        const currentIntent = attributes.currentIntent;
        return handlerInput.requestEnvelope.request.type === "IntentRequest"
            && handlerInput.requestEnvelope.request.intent.name === "BuyProductIntent"
            && handlerInput.requestEnvelope.request.intent.slots.productName.value
            && handlerInput.requestEnvelope.request.intent.slots.productQuantity.value
            && handlerInput.requestEnvelope.request.intent.slots.confirmTransaction.value
            && currentIntent === "StoreProductIntent"
    },
    async handle(handlerInput){
        try{
            
            const confirmTransaction = handlerInput.requestEnvelope.request.intent.slots.confirmTransaction.value;
            const listYesValues = ["Si","De acuerdo","Confirmo"];
            const listNoValues = ["No", "No gracias", "En desacuerdo"];
            const YesSearch = listYesValues.find(e => e.toLowerCase() === confirmTransaction.toLowerCase());
            const NoSearch = listNoValues.find(e => e.toLowerCase() === confirmTransaction.toLowerCase());
            const productName = handlerInput.requestEnvelope.request.intent.slots.productName.value;
            const productQuantity = handlerInput.requestEnvelope.request.intent.slots.productQuantity.value;
            const attributesManager = handlerInput.attributesManager;
            const attributes = await attributesManager.getSessionAttributes() || {};
            const productCategoryId = attributes.productCategoryId;
            const JSONResult = await getDataAsync(`${baseUrlAPI}/products?category_id=${productCategoryId}`);
            const JSONProducts = JSONResult.data.length > 0 ? JSONResult.data : [];
            const searchProduct = JSONProducts.find(e => e.name.toLowerCase() === productName.toLowerCase());
            const totalAmount = searchProduct.price*parseInt(productQuantity);
            
            if(YesSearch){
                
                const response = {
                  screen: `store`,
                  intent: `buyProductIntent`,
                  parameters: [
                        {name: "productId", value: searchProduct.id},
                        {name: "startBuy", value: true},
                        {name: "productQuantity", value: parseInt(productQuantity)},
                        {name: "endingBuy", value: true}
                      ]
                };
                
                
                const postResult = utils.post(`${baseUrlAPI}/transaccions`)
                const body = {
                        currency_symbol: 'S/.',
                        amount: parseInt(totalAmount),
                        guest_id: 2,
                        transaction_description: `${productQuantity} ${productName}`,
                        transaction_datetime: new Date(),
                        product_id: searchProduct.id
                        
                };
                const transactionResult = utils.post(`${baseUrlAPI}/transactions`, body);
                let ws = new WebSocket(baseUrl);
                ws.on('open', function open(){
                ws.send(JSON.stringify(response));
                ws.close();
                });
                
                const speakOutput = `<speak>
                                        <amazon:emotion name="excited" intensity="medium">Su compra se ha realizado exitósamente!.</amazon:emotion> 
                                        Recuerda que para ver el historial de compras <break time="0.02s"/> diga: "Ver historial de compras".
                                    </speak>`
                                    
                return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse()                    
                
            }else if(NoSearch){
                
                const response = {
                  screen: `store`,
                  intent: `buyProductIntent`,
                  parameters: [
                        {name: "productId", value: searchProduct.id},
                        {name: "startBuy", value: true},
                        {name: "productQuantity", value: parseInt(productQuantity)},
                        {name: "endingBuy", value: false}
                      ]
                };
                
                let ws = new WebSocket(baseUrl);
                ws.on('open', function open(){
                ws.send(JSON.stringify(response));
                ws.close();
                });
                
                const speakOutput = `<speak>
                                      Haz rechazado la solicitud de compra de ${productName}. 
                                      Recuerda que para comprar un producto solo debes decir "Comprar" <break time="0.05s"/> seguido del nombre del producto.   
                                    </speak>`;
                
                return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse()
            }else{
                const speakOutput = `<speak>
                                        Lo lamento, no le he entendido. 
                                        Diga "Sí" para confirmar la compra o "No" para rechazarla.
                                        Entonces, ¿Deseas confirmar la compra?
                                    </speak>`
                                    
                                    
                const response = {
                  screen: `store`,
                  intent: `buyProductIntent`,
                  parameters: [
                        {name: "productId", value: searchProduct.id},
                        {name: "startBuy", value: true},
                        {name: "productQuantity", value: parseInt(productQuantity)},
                        {name: "endingBuy", value: false}
                      ]
                };                    
                
                
                let ws = new WebSocket(baseUrl);
                ws.on('open', function open(){
                ws.send(JSON.stringify(response));
                ws.close();
                });
                                 
                return handlerInput.responseBuilder
                .addElicitSlotDirective(`confirmTransaction`)
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse() 
            }
        }catch(ex){
            console.log(ex);
            const speakOutput = `<speak>
                                Lo siento, ha ocurrido un error inesperado y no se ha podido procesar su solicitud. 
                                Por favor, comuníquese con el administrador al siguiente al número <say-as interpret-as="telephone">945433992</say-as>
                                </speak>`;
            return handlerInput.responseBuilder
            .speak(ex)
            .reprompt(ex)
            .getResponse();
        }
    }
};








// #endregion

// #region TOURISTIC PLACES FEATURE

const ListTouristicPlacesIntentHandler = {
    async canHandle(handlerInput){
        const request = handlerInput.requestEnvelope.request;
        return request.type === "IntentRequest"
            && request.intent.name === "ListTouristicPlaces"
    },
    async handle(handlerInput){
            try{
                
                const JSONResult = await getDataAsync(`${baseUrlAPI}/touristic-places`);
                const JSONTouristicPlaces = JSONResult.data.length > 0 ? JSONResult.data : [];
                const nameListText = JSONTouristicPlaces.map(e => e.name);
                let nameListSpeech = nameListText.join(`, `);
                nameListSpeech = nameListSpeech.replace(/,([^,]+)$/, ' y$1');
            
                const response = {
                    screen: `touristicPlaces`,
                    intent: `listTouristicPlaces`,
                    parameters: []
                };
                
                const attributesManager = handlerInput.attributesManager;
                const attributes = await attributesManager.getSessionAttributes() || {};
                attributes.currentIntent = 'ListTouristicPlacesIntent';
                attributesManager.setSessionAttributes(attributes); 
                
                let ws = new WebSocket(baseUrl);
                ws.on('open', function open(){
                    ws.send(JSON.stringify(response));
                    ws.close();
                }); 
                
                const speakOutput = `<speak>
                                    Bienvenido a nuestra guía turística. Los lugares turísticos cerca al hotel son los siguientes:${nameListSpeech}.
                                    <break time="0.05s"/>
                                    Para conocer más sobre un lugar turístico en específico diga "Dime más sobre" <break time="0.05s"/> seguido del nombre del lugar turístico.
                                    Para obtener especificaciones de como llegar al lugar turístico diga "Como llego" <break time = "0.05s"/> seguido del nombre del lugar turistico.
                                    Entonces, ¿en qué puedo ayudarte?
                                    </speak>
                                    `
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .getResponse();
            }catch(ex){
                console.log(`error: ${ex}`);
                const speakOutput = `<speak>
                                    Lo siento, ha ocurrido un error inesperado y no se ha podido procesar su solicitud. 
                                    Por favor, comuníquese con el administrador al siguiente al número <say-as interpret-as="telephone">945433992</say-as>
                                    </speak>`;
                return handlerInput.responseBuilder
                .speak(ex)
                .reprompt(ex)
                .getResponse();
                
            }
    }
};

const TellMeMoreTouristicPlaceIntentHandler = {
    async canHandle(handlerInput){
        const attributesManager = handlerInput.attributesManager;
        const attributes = await attributesManager.getSessionAttributes() || {};
        const currentIntent = attributes.currentIntent; 
        return handlerInput.requestEnvelope.request.type === "IntentRequest"
            && handlerInput.requestEnvelope.request.intent.name === "TellMeMoreTouristicPlaceIntent"
            && handlerInput.requestEnvelope.request.intent.slots.touristicPlace.value
            && currentIntent === "ListTouristicPlacesIntent"
    },
    async handle(handlerInput){
        try{
            const touristicPlace = handlerInput.requestEnvelope.request.intent.slots.touristicPlace.value;
            const JSONResult = await getDataAsync(`${baseUrlAPI}/touristic-places`);
            const JSONTouristicPlaces = JSONResult.data.length > 0 ? JSONResult.data : [];
            const nameListText = JSONTouristicPlaces.map(e => e.name);
            let nameListSpeech = nameListText.join(`, `);
            nameListSpeech = nameListSpeech.replace(/,([^,]+)$/, ' y$1');
            const searchResult = JSONTouristicPlaces.find(e => e.name.toLowerCase() === touristicPlace.toLowerCase());
            if(searchResult){
                const speakOutput = `<speak>
                                        ${searchResult.description}
                                    </speak>`;
                                    
                 const response = {
                    screen: `touristicPlaces`,
                    intent: `listTouristicPlaces`,
                    parameters: [{name: "touristicPlaceId", value: searchResult.id},{name: "tellMeMore", value: true}]
                };
                
                let ws = new WebSocket(baseUrl);
                ws.on('open', function open(){
                    ws.send(JSON.stringify(response));
                    ws.close();
                }); 
                                    
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .getResponse();
            }else{
                const speakOutput = `<speak>
                                        Lo lamento, actualmente no dispongo de la información de ${touristicPlace}, 
                                        pero puedo brindarte información de los siguientes lugares turísticos:
                                        ${nameListSpeech}
                                        ¿Cuál es el nombre del lugar turístico del que deseas información?
                                    </speak>`;
                 return handlerInput.responseBuilder
                    .addElicitSlotDirective("touristicPlace")
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .getResponse();
            }
        }catch(ex){
            console.log(`error: ${ex}`);
            const speakOutput = `<speak>
                                    Lo siento, ha ocurrido un error inesperado y no se ha podido procesar su solicitud. 
                                    Por favor, comuníquese con el administrador al siguiente al número <say-as interpret-as="telephone">945433992</say-as>
                                </speak>`;
            return handlerInput.responseBuilder
                .speak(ex)
                .reprompt(ex)
                .getResponse();
        }
        
    }
};

const AddressTouristicPlacesIntentHandler = {
    async canHandle(handlerInput){
        const attributesManager = handlerInput.attributesManager;
        const attributes = await attributesManager.getSessionAttributes() || {};
        const currentIntent = attributes.currentIntent;
        return handlerInput.requestEnvelope.request.type === "IntentRequest"
            && handlerInput.requestEnvelope.request.intent.name === "AddressTouristicPlacesIntent"
            && handlerInput.requestEnvelope.request.intent.slots.touristicPlace.value
            && currentIntent === "ListTouristicPlacesIntent"
    },
    async handle(handlerInput){
        try{
            const touristicPlace = handlerInput.requestEnvelope.request.intent.slots.touristicPlace.value;
            const JSONResult = await getDataAsync(`${baseUrlAPI}/touristic-places`);
            const JSONTouristicPlaces = JSONResult.data.length > 0 ? JSONResult.data : [];
            const nameListText = JSONTouristicPlaces.map(e => e.name);
            let nameListSpeech = nameListText.join(`, `);
            nameListSpeech = nameListSpeech.replace(/,([^,]+)$/, ' y$1');
            const searchResult = JSONTouristicPlaces.find(e => e.name.toLowerCase() === touristicPlace.toLowerCase());
            if(searchResult){
                const speakOutput = `<speak>
                                        ${searchResult.reference_address}
                                    </speak>`;
                                    
                 const response = {
                    screen: `touristicPlaces`,
                    intent: `listTouristicPlaces`,
                    parameters: [{name: "touristicPlaceId", value: searchResult.id},{name: "howCanIGet", value: true}]
                };
                
                let ws = new WebSocket(baseUrl);
                ws.on('open', function open(){
                    ws.send(JSON.stringify(response));
                    ws.close();
                }); 
                                    
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .getResponse();
            }else{
                const speakOutput = `<speak>
                                        Lo lamento, actualmente no dispongo de la información de ${touristicPlace}, 
                                        pero puedo brindarte información de los siguientes lugares turísticos:
                                        ${nameListSpeech}
                                        ¿Cuál es el nombre del lugar turístico del que deseas información?
                                    </speak>`;
                 return handlerInput.responseBuilder
                    .addElicitSlotDirective("touristicPlace")
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .getResponse();
            }
        }catch(ex){
            console.log(`error: ${ex}`);
            const speakOutput = `<speak>
                                    Lo siento, ha ocurrido un error inesperado y no se ha podido procesar su solicitud. 
                                    Por favor, comuníquese con el administrador al siguiente al número <say-as interpret-as="telephone">945433992</say-as>
                                </speak>`;
            return handlerInput.responseBuilder
                .speak(ex)
                .reprompt(ex)
                .getResponse();
        }
    }
}


// #endregion

// #region ACCOUNT STATE FEATURE

const AccountStateIntentHandler = {
    canHandle(handlerInput){
        return handlerInput.requestEnvelope.request.type === "IntentRequest"
            && handlerInput.requestEnvelope.request.intent.name === "AccountStateIntent"
    },
    handle(handlerInput){
        try{
            
            const mockAccount = [
            {
            currencySymbol: `S/.`,
            total_amount: 244.50,
            billing_date: `27/03/2020 - 29/04/2020`,
            start_booking_date: `27/03/2020`,
            end_booking_date: `29/04/2020`,
            }
            ];

        const mockSummary = [
            {
            id:1,
            transaction_date: `29/04/2019`,
            transaction_description: `16:57`,
            transaction_hour: `4 San Mateo 500ml`,
            currencySymbol: `S/.`,
            amount: 120.00
            },
            {
            id:2,
            transaction_date: `29/04/2019`,
            transaction_description: `16:57`,
            transaction_hour: `4 San Mateo 500ml`,
            currencySymbol: `S/.`,
            amount: 120.00
            },
            {
            id:3,
            transaction_date: `29/04/2019`,
            transaction_description: `16:57`,
            transaction_hour: `4 San Mateo 500ml`,
            currencySymbol: `S/.`,
            amount: 120.00
            },
            {   
            id:4,
            transaction_date: `29/04/2019`,
            transaction_description: `16:57`,
            transaction_hour: `4 San Mateo 500ml`,
            currencySymbol: `S/.`,
            amount: 120.00
            },
            {
            id:5,
            transaction_date: `29/04/2019`,
            transaction_description: `16:57`,
            transaction_hour: `4 San Mateo 500ml`,
            currencySymbol: `S/.`,
            amount: 120.00
            },
            {
            id:5,
            transaction_date: `29/04/2019`,
            transaction_description: `16:57`,
            transaction_hour: `4 San Mateo 500ml`,
            currencySymbol: `S/.`,
            amount: 120.00
            },
            {
            id:5,
            transaction_date: `29/04/2019`,
            transaction_description: `16:57`,
            transaction_hour: `4 San Mateo 500ml`,
            currencySymbol: `S/.`,
            amount: 120.00
            },
            {
            id:5,
            transaction_date: `29/04/2019`,
            transaction_description: `16:57`,
            transaction_hour: `4 San Mateo 500ml`,
            currencySymbol: `S/.`,
            amount: 120.00
            },
        ];
            
            const numberOfTransactions = mockSummary.length;
            const accountObject = mockAccount.length > 0 ? mockAccount[0] : {};
            
            const response = {
                    screen: `shoppingSummary`,
                    intent: `accountStateIntent`,
                    parameters: []
            };
                
                
                
            let ws = new WebSocket(baseUrl);
            ws.on('open', function open(){
                ws.send(JSON.stringify(response));
                ws.close();
            }); 
            
            
            const speakOutput = `<speak>
                                    Bienvenido a su historial de transacciones de compras, para el periódo <say-as interpret-as="date" format="dmy">${accountObject.start_booking_date}</say-as>
                                    al <say-as interpret-as="date" format="dmy">${accountObject.end_booking_date}</say-as>, ha realizado ${numberOfTransactions} ${numberOfTransactions > 1 ? "transacciones" : "transaccion"} por
                                    un monto total de <say-as interpret-as="number">${accountObject.total_amount}</say-as>.
                                </speak>`
            
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        }catch(ex){
             console.log(`error: ${ex}`);
            const speakOutput = `<speak>
                                    Lo siento, ha ocurrido un error inesperado y no se ha podido procesar su solicitud. 
                                    Por favor, comuníquese con el administrador al siguiente al número <say-as interpret-as="telephone">945433992</say-as>
                                    </speak>`;
            return handlerInput.responseBuilder
            .speak(ex)
            .reprompt(ex)
            .getResponse();
        }
    }
}


// #endregion





/*const TeaGivenOrderIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "IntentRequest"
      && handlerInput.requestEnvelope.request.intent.name === "BookingServiceIntent"
      && handlerInput.requestEnvelope.request.intent.slots.drink.value
      && handlerInput.requestEnvelope.request.intent.slots.drink.value === 'tea'
      && !handlerInput.requestEnvelope.request.intent.slots.teaType.value
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak("Which would you like black, green, oolong, or white tea?")
      .reprompt("Would you like a black, green, oolong, or white tea?")
      .addElicitSlotDirective('teaType')
      .getResponse();
  }
}


const CompletedOrderIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "IntentRequest"
        && handlerInput.requestEnvelope.request.intent.name === "OrderIntent"
        && handlerInput.requestEnvelope.request.dialogState === "COMPLETED";
  },
  handle(handlerInput) {
      
    const drink = handlerInput.requestEnvelope.request.intent.slots.drink.value;
    let type; 

    if (drink === 'coffee') {
        type = handlerInput.requestEnvelope.request.intent.slots.coffeeRoast.value;
    } else if (drink === 'tea') {
        type = handlerInput.requestEnvelope.request.intent.slots.teaType.value;
    } else {
        type = 'water';
    }
      
    const speechText = `It looks like you want ${type} ${drink}`;
    return handlerInput.responseBuilder
    .speak(speechText)
    .getResponse();
  }
}

*/


async function getDataAsync(url){
  try{
    let response = await fetch(url);
    let data = await response.json()
    return data;   
  }catch(err){
      console.log("Error ==> ", err);
  }
}



const validateSlots = function(response,text){
    for(let i = 0; i< response.length; i++){
        console.log(response[i].name + ', ' + text)
        if(response[i].name.toLowerCase() === text.toLowerCase()){
            return true
        }
    }
    return false
}





// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        //YesIntentHandler,
        //NoIntentHandler,
        ...require('./handlers/event/handler'),
        ...require('./handlers/service/handler'),
        ...require('./handlers/restaurant/handler'),
        ...require('./handlers/yes/handler'),
        ...require('./handlers/booking/handler'),
        ...require('./handlers/bookingHistory/handler'),
        ...require('./handlers/store/handler'),
        ...require('./handlers/menu/handler'),
        ...require('./handlers/facilities/handler'),
        ...require('./handlers/moreInformation/handler'),
        ...require('./handlers/account/handler'),
        ...require('./handlers/placesInterest/handler'),
        ...require('./handlers/language/handler'),
        ...require('./handlers/currency/handler'),
        
        
        
        //store feature handlers
        //StoreProductIntentHandler,
        //StartedChangeProductCategoryIntentHandler,
        //CompletedChangeProductCategoryIntentHandler,
        //InProgressBuyProductIntentHandler,
        //CompletedBuyProductIntentHandler,
        //EndingBuyProductIntentHandler,
        //
        // touristic places handlers
        ListTouristicPlacesIntentHandler,
        TellMeMoreTouristicPlaceIntentHandler,
        AddressTouristicPlacesIntentHandler,
        
        
        
        //AccountStateIntentHandler,
        
        RequestHigherInternetIntentHandler,
        StartedShowInfoInternetPackageIntentHandler,
        CompletedShowInfoInternetPackageIntentHandler,
        StartedBuyInternetPackageIntentHandler,
        InProgressBuyInternetPackageIntentHandler,
        CompletedBuyInternetPackageIntentHandler,
        HelloWorldIntentHandler,
        HelpIntentHandler,
        HelpYouCommandsHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        
        // news handler
        //StartInProgressWatchNewsIntentHandler,
        //CompletedWatchNewsIntentHandler,
        //ChangeNewsTopicIntentHandler,
        //
        
        //StartedInProgressListServiceIntentHandler,
        //CompletedListServiceIntentHandler,
        GetWeatherForecastIntentHandler,
        //StartedInProgressFindServiceIntentHandler,
        //CompletedFindServiceIntentHandler,
        //StartedInProgressBookingServiceIntentHandler,
        //RestaurantGivenBookingServiceIntentHandler,
        //BookingServiceGetDateIntentHandler,
        //BookingServiceGetHoursIntentHandler,
        //ConfirmBookingServiceIntentHandler,
        //CompletedBookingServiceIntentHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();
