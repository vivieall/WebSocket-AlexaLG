const socket = require('ws');
const constants = require("../../constants/constants");
const utils = require("../../utils/util");

const handlers = [
    
    //ListServicesIntentHandler
    {
        canHandle(handlerInput) {
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                && handlerInput.requestEnvelope.request.intent.name === "ListServiceIntent" 
                && !handlerInput.requestEnvelope.request.intent.slots.service.value
                && !handlerInput.requestEnvelope.request.intent.slots.startBooking.value
                && !handlerInput.requestEnvelope.request.intent.slots.serviceName.value
                && !handlerInput.requestEnvelope.request.intent.slots.date.value
                && !handlerInput.requestEnvelope.request.intent.slots.time.value
                && !handlerInput.requestEnvelope.request.intent.slots.confirm.value
        },
        async handle(handlerInput) {
            let speakOutput;
            try{
                
                const attributesManager = handlerInput.attributesManager;
                const attributes = await attributesManager.getSessionAttributes() || {};
                attributes.currentIntent = 'ListServiceIntent';
                attributesManager.setSessionAttributes(attributes); 
                
                console.log(constants.ENDPOINT_GYMS);
                const response = await utils.getReq(constants.ENDPOINT_GYMS, { method: 'GET' });
                const gyms = response.data;
                const nameListText = gyms.map(e => e.name);
                let nameListSpeech = nameListText.join(`, `);
                nameListSpeech = nameListSpeech.replace(/,([^,]+)$/, ' y$1'); 
                
                
                const x = {
                  screen: `services`,
                  intent: `ListServiceIntent`,
                  parameters: []
                };
                
                
                let ws = new socket(constants.SOCKET_URL);
                
                ws.on('open', function open(){
                    ws.send(JSON.stringify(x));
                    ws.close();
                });
                
                speakOutput = `<speak>
                                El hotel pone a tu disposicion los siguientes servicios:
                                Restaurantes,
                                Spas y
                                Gimnasios.
                                Actualmente te mostramos los gimnasios disponibles dentro del hotel.
                                Tienes la posibilidad de reservar entre ${gyms.length} gimnasios, los cuales son:
                                ${nameListSpeech}.
                                Recuerda que: <break time="0.02s"/>
                                Para reservar un servicio puedes decir: 
                                "RESERVAR EL GIMNASIO" <break time="0.05s"/> seguido del nombre del gimnasio.
                                <break time="0.02s"/>
                                Para visuailizar otro tipo de servicio puedes decir:
                                "Muestrame" <break time="0.05s"/> seguido del nombre del tipo de servicio.
                                Entonces en que puedo ayudarte?
                               </speak>`
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
    
    //List services exist {serviceType}
    {
        canHandle(handlerInput) {
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                && handlerInput.requestEnvelope.request.intent.name === "ListServiceIntent" 
                && handlerInput.requestEnvelope.request.intent.slots.service.value
                && !handlerInput.requestEnvelope.request.intent.slots.startBooking.value
                && !handlerInput.requestEnvelope.request.intent.slots.serviceName.value
                && !handlerInput.requestEnvelope.request.intent.slots.date.value
                && !handlerInput.requestEnvelope.request.intent.slots.time.value
                && !handlerInput.requestEnvelope.request.intent.slots.confirm.value
        },
        async handle(handlerInput) {
            let speakOutput = '';
            try{
                
                const serviceType = handlerInput.requestEnvelope.request.intent.slots.service.value;
                const serviceTypeId = handlerInput.requestEnvelope.request.intent.slots.service.resolutions.resolutionsPerAuthority[0].values[0].value.id;
                const attributesManager = handlerInput.attributesManager;
                const attributes = await attributesManager.getSessionAttributes() || {};
                
                let response = {};
                let data = {};
                let nameListText = '';
                let nameListSpeech = '';
                let x = {};
                let ws;
                
                switch(Number(serviceTypeId)){
                    case 1:
                        
                        response = await utils.getReq(constants.ENDPOINT_RESTAURANTS, { method: 'GET' });
                        data = response.data;
                        nameListText = data.map(x => x.name);
                        nameListSpeech = nameListText.join(', ');
                        nameListSpeech = nameListSpeech.replace(/,([^,]+)$/, ' y$1');
                        
                        x = {
                            screen: `services`,
                            intent: `ListServiceIntent`,
                            parameters: [{name: "serviceType", value: serviceType }]
                        };
                
                        ws = new socket(constants.SOCKET_URL);
                        ws.on('open', function open(){
                            ws.send(JSON.stringify(x));
                            ws.close();
                        });
                        
                        attributes.currentIntent = 'BookingRestaurantIntent';
                        attributes.serviceType = serviceType;
                        attributesManager.setSessionAttributes(attributes);
                        
                        speakOutput = `<speak>
                                        Actualmente el hotel dispone de ${data.length} ${data.length > 1 ? "restaurantes ubicados" : "restaurante ubicado"} dentro de sus instalaciones. 
                                        Estos son :
                                        ${nameListSpeech}.
                                        <break time="0.02s"/>
                                        Los restaurantes ofrecen la posiblidad de reservar platos de comida en las categorías de desayunos, almuerzos y cenas.
                                        ¿Deseas visualizar el menú de comida de un restaurante en específico?
                                       </speak>`;
                                       
                        console.log(speakOutput);
                        
                        return handlerInput.responseBuilder
                            .addElicitSlotDirective('startBooking')
                            .speak(speakOutput)
                            .reprompt(speakOutput)
                            .getResponse();
                        
                        
                    case 2:
                        
                        response = await utils.getReq(constants.ENDPOINT_GYMS, { method: 'GET' });
                        data = response.data;
                        nameListText = data.map(x => x.name);
                        nameListSpeech = nameListText.join(', ');
                        nameListSpeech = nameListSpeech.replace(/,([^,]+)$/, ' y$1');
                        
                        x = {
                            screen: `services`,
                            intent: `ListServiceIntent`,
                            parameters: [{name: "serviceType", value: serviceType }]
                        };
                
                        ws = new socket(constants.SOCKET_URL);
                        ws.on('open', function open(){
                            ws.send(JSON.stringify(x));
                            ws.close();
                        });
                        
                        
                        attributes.currentIntent = 'BookingGymIntent';
                        attributes.serviceType = serviceType;
                        attributesManager.setSessionAttributes(attributes);
                        
                        speakOutput = `<speak>
                                        Actualmente el hotel dispone de ${data.length} ${data.length > 1 ? "gimnasios ubicados" : "gimnasio ubicado"} dentro de sus instalaciones. 
                                        ${data.length > 1 ? "Estos son:" : "Este es:"}
                                        ${nameListSpeech}.
                                        <break time="0.02s"/>
                                        Los gimnasios ofrecen a sus huéspedes la posiblidad de reservar sus instalaciones y materiales de entrenamiento para ejercitarse.
                                        ¿Deseas reservar un gimnasio en específico?
                                       </speak>`;
                                       
                        return handlerInput.responseBuilder
                            .addElicitSlotDirective('startBooking')
                            .speak(speakOutput)
                            .reprompt(speakOutput)
                            .getResponse();    
                        
                    case 3:
                        
                        response = await utils.getReq(constants.ENDPOINT_SPAS, { method: 'GET' });
                        data = response.data;
                        nameListText = data.map(x => x.name);
                        nameListSpeech = nameListText.join(', ');
                        nameListSpeech = nameListSpeech.replace(/,([^,]+)$/, ' y$1');
                        
                        x = {
                            screen: `services`,
                            intent: `ListServiceIntent`,
                            parameters: [{name: "serviceType", value: serviceType }]
                        };
                
                        ws = new socket(constants.SOCKET_URL);
                        ws.on('open', function open(){
                            ws.send(JSON.stringify(x));
                            ws.close();
                        });
                        
                        attributes.currentIntent = 'BookingSpaIntent';
                        attributes.serviceType = serviceType;
                        attributesManager.setSessionAttributes(attributes);
                        
                        speakOutput = `<speak>
                                        Actualmente el hotel dispone de ${data.length} ${data.length > 1 ? "spas ubicados" : "spa ubicado"} dentro de sus instalaciones. 
                                        ${data.length > 1 ? "Estos son:" : "Este es:"}
                                        ${nameListSpeech}.
                                        <break time="0.02s"/>
                                        Los spas ofrecen a sus huéspedes la posiblidad de reservar sesiones de relajamiento y bienestar para equilibrar los sentidos del cuerpo.
                                        ¿Deseas reservar un spa en específico?
                                       </speak>`;
                        console.log(speakOutput);
                        
                        return handlerInput.responseBuilder
                            .addElicitSlotDirective('startBooking')
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
    
    //List services exist { serviceType, startBooking }
    {
        canHandle(handlerInput) {
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                && handlerInput.requestEnvelope.request.intent.name === "ListServiceIntent" 
                && handlerInput.requestEnvelope.request.intent.slots.service.value
                && handlerInput.requestEnvelope.request.intent.slots.startBooking.value
                && !handlerInput.requestEnvelope.request.intent.slots.serviceName.value
                && !handlerInput.requestEnvelope.request.intent.slots.date.value
                && !handlerInput.requestEnvelope.request.intent.slots.time.value
                && !handlerInput.requestEnvelope.request.intent.slots.confirm.value
        },
        async handle(handlerInput) {
            let speakOutput = '';
            try{
                
                const serviceType = handlerInput.requestEnvelope.request.intent.slots.service.value;
                const serviceTypeId = handlerInput.requestEnvelope.request.intent.slots.service.resolutions.resolutionsPerAuthority[0].values[0].value.id;
                const answerId = handlerInput.requestEnvelope.request.intent.slots.startBooking.resolutions.resolutionsPerAuthority[0].values[0].value.id;
                
                
                
                const attributesManager = handlerInput.attributesManager;
                const attributes = await attributesManager.getSessionAttributes() || {};
                
                let response = {};
                let data = {};
                let nameListText = '';
                let nameListSpeech = '';
                let x = {};
                let ws;
                
                console.log("answerId:",answerId);
                
                if(Number(answerId) < 2){
                    //say yes
                    
                    switch(Number(serviceTypeId)){
                    case 1:
                        
                        speakOutput = `<speak>
                                        Para visualizar el menú de platos de comida, es necesario que indiques el nombre del restaurante que al que deseas consultar.
                                        <break time="0.01s" />
                                        ¿Cuál es el nombre del restaurante?
                                       </speak>`
                        break;
                    case 2:
                        speakOutput = `<speak>
                                        Para proceder con la reserva, es necesario que indiques el nombre del gimnasio que desea reservar.
                                        <break time="0.01s" />
                                        ¿Cuál es el nombre del gimnasio?
                                       </speak>`
                        break;
                    case 3:
                        speakOutput = `<speak>
                                        Para proceder con la reserva es necesario que me indiques el nombre del spa que desea reservar.
                                        <break time="0.01s" />
                                        ¿Cuál es el nombre del spa?
                                       </speak>`
                        break;
                    }
                    
                     x = {
                            screen: `booking`,
                            intent: `BookingServiceIntent`,
                            parameters: []
                    };
                
                    ws = new socket(constants.SOCKET_URL);
                    ws.on('open', function open(){
                            ws.send(JSON.stringify(x));
                            ws.close();
                    });
                    
                    console.log(speakOutput);
                    
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .reprompt(speakOutput)
                        .addElicitSlotDirective('serviceName')
                        .getResponse();
                        
                        
                    
                }else{
                    //say no
                    switch(Number(serviceTypeId)){
                    case 1:
                        
                        speakOutput = `<speak>
                                        Lo comprendo,<break time="0.02s"/> recuerda que para visualizar el menú de comida de un restaurante debes decir: 
                                        "Muéstrame el menú" <break time="0.05s"/> seguido del nombre del restaurante.
                                       </speak>`
                        break;
                    case 2:
                        speakOutput = `<speak>
                                        Lo comprendo,<break time="0.02s"/> recuerda que para reservar un gimnasio debes decir: 
                                        "Reserva el gimnasio" <break time="0.05s"/> seguido del nombre del gimnasio que deseas reservar.
                                       </speak>`
                        break;
                    case 3:
                        speakOutput = `<speak>
                                        Lo comprendo,<break time="0.02s"/> recuerda que para reservar un spa debes decir: 
                                        "Reserva el spa" <break time="0.05s"/> seguido del nombre del spa que deseas reservar.
                                       </speak>`
                        break;
                    }
                    console.log(speakOutput);
                
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
    
    //List services exist { serviceType, startBooking, serviceName }
    {
        canHandle(handlerInput) {
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                && handlerInput.requestEnvelope.request.intent.name === "ListServiceIntent" 
                && handlerInput.requestEnvelope.request.intent.slots.service.value
                && handlerInput.requestEnvelope.request.intent.slots.startBooking.value
                && handlerInput.requestEnvelope.request.intent.slots.serviceName.value
                && !handlerInput.requestEnvelope.request.intent.slots.date.value
                && !handlerInput.requestEnvelope.request.intent.slots.time.value
                && !handlerInput.requestEnvelope.request.intent.slots.confirm.value
        },
        async handle(handlerInput) {
            let speakOutput = '';
            try{
                
                const serviceType = handlerInput.requestEnvelope.request.intent.slots.service.value;
                const serviceName = handlerInput.requestEnvelope.request.intent.slots.serviceName.value
                
                const attributesManager = handlerInput.attributesManager;
                const attributes = await attributesManager.getSessionAttributes() || {};
                
                const serviceTypeId = handlerInput.requestEnvelope.request.intent.slots.service.resolutions.resolutionsPerAuthority[0].values[0].value.id;
                const answerId = handlerInput.requestEnvelope.request.intent.slots.startBooking.resolutions.resolutionsPerAuthority[0].values[0].value.id;
                
                let url = '';
                let serviceTypeLabel = '';
                let x = {};
                let ws;
                
                switch(Number(serviceTypeId)){
                    case 1:
                        url = constants.ENDPOINT_RESTAURANTS;
                        serviceTypeLabel = 'restaurante';
                        break;
                    case 2:
                        url = constants.ENDPOINT_GYMS;
                        serviceTypeLabel = 'gimnasio';
                        break;
                    case 3:
                        url = constants.ENDPOINT_SPAS;
                        serviceTypeLabel = 'spas';
                        break;
                    default:
                        break;
                }
                
                
                const serviceResult = await utils.getReq(`${url}?name=${serviceName}`, { method: 'GET' });
                const servicesResult = await utils.getReq(url, { method: 'GET' });
                
                const service = serviceResult.data;
                const services = servicesResult.data;
                
                const nameListText = services.map( x => x.name);
                let nameListSpeech = nameListText.join(`, `);
                nameListSpeech = nameListSpeech.replace(/,([^,]+)$/, ' y$1');
                
                
                if(service.length > 0){
                    
                    speakOutput = `<speak>
                                    Por favor, indícame la fecha de la reserva.
                                    
                                    </speak>`;
                                    
                    x = {
                        screen: `booking`,
                        intent: `BookingServiceIntent`,
                        parameters: [
                            {name: 'serviceType', value: serviceType},
                            {name: 'serviceId', value: service[0].id }, 
                        ]
                    };
                
                
                    ws = new socket(constants.SOCKET_URL);
                
                    ws.on('open', function open(){
                        ws.send(JSON.stringify(x));
                        ws.close();
                    });                         
                                    
                    attributes.serviceId = service[0].id;
                    attributesManager.setSessionAttributes(attributes); 
                    
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .reprompt(speakOutput)
                        .addElicitSlotDirective('date')
                        .getResponse();
                    
                }else{
                    
                    speakOutput = `<speak>
                                    El nombre del ${serviceTypeLabel} es incorrecto.
                                    Los ${serviceType} disponibles son los siguientes:
                                        ${nameListSpeech}
                                    <break time="0.02s"/>
                                    Cuál es el nombre del ${serviceTypeLabel}?
                                   </speak>`;
                                   
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .reprompt(speakOutput)
                        .addElicitSlotDirective('serviceName')
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
    
    //List services exist { serviceType, startBooking, serviceName, date }
    {
        canHandle(handlerInput) {
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                && handlerInput.requestEnvelope.request.intent.name === "ListServiceIntent" 
                && handlerInput.requestEnvelope.request.intent.slots.service.value
                && handlerInput.requestEnvelope.request.intent.slots.startBooking.value
                && handlerInput.requestEnvelope.request.intent.slots.serviceName.value
                && handlerInput.requestEnvelope.request.intent.slots.date.value
                && !handlerInput.requestEnvelope.request.intent.slots.time.value
                && !handlerInput.requestEnvelope.request.intent.slots.confirm.value
        },
        async handle(handlerInput) {
            let speakOutput = '';
            let x = {};
            let ws;
            
            try{
                
                const serviceType = handlerInput.requestEnvelope.request.intent.slots.service.value;
                const serviceName = handlerInput.requestEnvelope.request.intent.slots.serviceName.value;
                const date = handlerInput.requestEnvelope.request.intent.slots.date.value;
                
                
                const serviceTypeId = handlerInput.requestEnvelope.request.intent.slots.service.resolutions.resolutionsPerAuthority[0].values[0].value.id;
                const answerId = handlerInput.requestEnvelope.request.intent.slots.startBooking.resolutions.resolutionsPerAuthority[0].values[0].value.id;
                
                const attributesManager = handlerInput.attributesManager;
                const attributes = await attributesManager.getSessionAttributes() || {};
                
                
                const serviceId = attributes.serviceId;

                speakOutput = `<speak>
                                 ¿Cuál es la hora de la reserva?
                               </speak>`;
                               
                x = {
                  screen: `booking`,
                  intent: `BookingServiceIntent`,
                  parameters: [
                      {name: 'serviceType', value: serviceType},
                      {name: 'serviceId', value: serviceId }, 
                      {name: 'date', value: date}
                    ]
                };
                
                
                ws = new socket(constants.SOCKET_URL);
                
                ws.on('open', function open(){
                    ws.send(JSON.stringify(x));
                    ws.close();
                });                
                
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .addElicitSlotDirective('time')
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
    
    
    //List services exist { serviceType, startBooking, serviceName, date, time }
    {
        canHandle(handlerInput) {
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                && handlerInput.requestEnvelope.request.intent.name === "ListServiceIntent" 
                && handlerInput.requestEnvelope.request.intent.slots.service.value
                && handlerInput.requestEnvelope.request.intent.slots.startBooking.value
                && handlerInput.requestEnvelope.request.intent.slots.serviceName.value
                && handlerInput.requestEnvelope.request.intent.slots.date.value
                && handlerInput.requestEnvelope.request.intent.slots.time.value
                && !handlerInput.requestEnvelope.request.intent.slots.confirm.value
        },
        async handle(handlerInput) {
            let speakOutput = '';
            let x = {};
            let ws;
            let serviceTypeLabel;
            
            try{
                
                const serviceType = handlerInput.requestEnvelope.request.intent.slots.service.value;
                const serviceName = handlerInput.requestEnvelope.request.intent.slots.serviceName.value;
                const serviceTypeId = handlerInput.requestEnvelope.request.intent.slots.service.resolutions.resolutionsPerAuthority[0].values[0].value.id;
                const timeId = handlerInput.requestEnvelope.request.intent.slots.time.resolutions.resolutionsPerAuthority[0].values[0].value.id;
                
                switch(Number(serviceTypeId)){
                    case 1:
                        serviceTypeLabel = "restaurante";
                        break;
                    case 2:
                        serviceTypeLabel = "gimnasio";
                        break;
                    case 3:
                        serviceTypeLabel = "spa";
                        break;
                    default:
                        break;
                }
                
                const date = handlerInput.requestEnvelope.request.intent.slots.date.value;
                const time = handlerInput.requestEnvelope.request.intent.slots.time.value;
                
                const attributesManager = handlerInput.attributesManager;
                const attributes = await attributesManager.getSessionAttributes() || {};
                
                
                const serviceId = attributes.serviceId;
                
                speakOutput = `<speak>
                                 ¿Deseas confimar la reserva del ${serviceTypeLabel} ${serviceName} para el día ${date} a las ${time}?
                                 Puedes decir "Sí" para Aceptar o <break time="0.01s"/> 
                                 "No" para rechazar.
                               </speak>`;
                
                x = {
                  screen: `booking`,
                  intent: `BookingServiceIntent`,
                  parameters: [
                      {name: 'serviceType', value: serviceType},
                      {name: 'serviceId', value: serviceId }, 
                      {name: 'date', value: date}, 
                      {name: 'time', value: timeId}
                    ]
                };
                
                
                ws = new socket(constants.SOCKET_URL);
                
                ws.on('open', function open(){
                    ws.send(JSON.stringify(x));
                    ws.close();
                }); 
                
                
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .addElicitSlotDirective('confirm')
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
    //List services exist { serviceType, startBooking, serviceName, date, time, confirm }
    {
        canHandle(handlerInput) {
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                && handlerInput.requestEnvelope.request.intent.name === "ListServiceIntent" 
                && handlerInput.requestEnvelope.request.intent.slots.service.value
                && handlerInput.requestEnvelope.request.intent.slots.startBooking.value
                && handlerInput.requestEnvelope.request.intent.slots.serviceName.value
                && handlerInput.requestEnvelope.request.intent.slots.date.value
                && handlerInput.requestEnvelope.request.intent.slots.time.value
                && handlerInput.requestEnvelope.request.intent.slots.confirm.value
        },
        async handle(handlerInput) {
            let speakOutput = '';
            let x = {};
            let ws;
            let serviceTypeLabel;
            
            try{
                
                const serviceType = handlerInput.requestEnvelope.request.intent.slots.service.value;
                const serviceName = handlerInput.requestEnvelope.request.intent.slots.serviceName.value;
                const date = handlerInput.requestEnvelope.request.intent.slots.date.value;
                const time = handlerInput.requestEnvelope.request.intent.slots.time.value;
                const serviceTypeId = handlerInput.requestEnvelope.request.intent.slots.service.resolutions.resolutionsPerAuthority[0].values[0].value.id;
                const timeId = handlerInput.requestEnvelope.request.intent.slots.time.resolutions.resolutionsPerAuthority[0].values[0].value.id;
                const confirmId = handlerInput.requestEnvelope.request.intent.slots.startBooking.resolutions.resolutionsPerAuthority[0].values[0].value.id;
                
                const attributesManager = handlerInput.attributesManager;
                const attributes = await attributesManager.getSessionAttributes() || {};
                
                
                const serviceId = attributes.serviceId;
                
                switch(Number(serviceTypeId)){
                    case 1:
                        serviceTypeLabel = `restaurante`;
                        break;
                    case 2:
                        serviceTypeLabel = `gimnasio`;
                        break;
                    case 3:
                        serviceTypeLabel =  `spa`;
                        break;
                    }
                
                
                if(Number(confirmId) < 2){
                    //say yes
                    
                    
                     x = {
                            screen: `booking`,
                            intent: `BookingServiceIntent`,
                            parameters: [{name: 'serviceType', value: serviceType},
                                        {name: 'serviceId', value: serviceId }, 
                                        {name: 'date', value: date}, 
                                        {name: 'time', value: timeId},
                                        {name: 'confirm', value: confirmId}
                                ]
                    };
                
                    ws = new socket(constants.SOCKET_URL);
                    ws.on('open', function open(){
                            ws.send(JSON.stringify(x));
                            ws.close();
                    });
                    
                    speakOutput = `<speak>
                                    Tu reserva del ${serviceTypeLabel} ${serviceName} ha sido confirmada para la fecha ${date} a las ${time}.<break time="0.02s"/>
                                    Para visualizar tu historial de reservas puedes decir: <break time="0.02s" /> 
                                    "Muéstrame el historial de reservas".
                                   </speak>`
                    
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .reprompt(speakOutput)
                        .getResponse();
                    
                }else{
                    //say no
                    
                     speakOutput = `<speak>
                                         Tu reserva del ${serviceTypeLabel} ${serviceName} ha sido cancelada.<break time="0.02s"/> 
                                       </speak>`

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
    
    
];

module.exports = handlers;




