const socket = require('ws');
const constants = require("../../constants/constants");
const utils = require("../../utils/util");

const handlers = [
    
    // Booking exist serviceType
    
    {
        async canHandle(handlerInput) {
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                && handlerInput.requestEnvelope.request.intent.name === "BookingServicesIntent"
                && handlerInput.requestEnvelope.request.intent.slots.serviceType.value
                && !handlerInput.requestEnvelope.request.intent.slots.serviceName.value
                && !handlerInput.requestEnvelope.request.intent.slots.dishType.value
                && !handlerInput.requestEnvelope.request.intent.slots.date.value
                && !handlerInput.requestEnvelope.request.intent.slots.hour.value
                && !handlerInput.requestEnvelope.request.intent.slots.confirm.value
        },
        async handle(handlerInput) {
            let speakOutput;
            const serviceType = handlerInput.requestEnvelope.request.intent.slots.serviceType.value;
            const serviceTypeId = handlerInput.requestEnvelope.request.intent.slots.serviceType.resolutions.resolutionsPerAuthority[0].values[0].value.id; 
            
            try{
                
                let response = {};
                let data = {};
                let nameListText = '';
                let nameListSpeech = '';
                let x = {};
                let ws;
            
                const attributesManager = handlerInput.attributesManager;
                const attributes = await attributesManager.getSessionAttributes() || {};
                
                attributes.currentIntent = 'bookings'
                        
                attributesManager.setSessionAttributes(attributes);
            
                switch(Number(serviceTypeId)){
                    case 1:
                        
                        response = await utils.getReq(constants.ENDPOINT_RESTAURANTS, { method: 'GET' });
                        data = response.data;
                        nameListText = data.map(x => x.name);
                        nameListSpeech = nameListText.join(', ');
                        nameListSpeech = nameListSpeech.replace(/,([^,]+)$/, ' y$1');
                        
                        x = {
                            screen: `booking`,
                            intent: `BookingServiceIntent`,
                            parameters: [{name: "serviceType", value: 'restaurantes' }]
                        };
                
                        ws = new socket(constants.SOCKET_URL);
                        ws.on('open', function open(){
                            ws.send(JSON.stringify(x));
                            ws.close();
                        });
                        

                        speakOutput = `<speak>
                                        El hotel dispone de ${data.length} ${data.length > 1 ? "restaurantes ubicados" : "restaurante ubicado"} dentro de sus instalaciones. 
                                        Estos son :
                                        ${nameListSpeech}.
                                        <break time="0.02s"/>
                                        Los restaurantes ofrecen la posiblidad de reservar platos de comida en las categorías de desayunos, almuerzos y cenas.
                                        ¿Cual es el nombre del restaurante que desea reservar?
                                       </speak>`;
                                       
                        console.log(speakOutput);
                        
                        return handlerInput.responseBuilder
                            .addElicitSlotDirective('serviceName')
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
                            screen: `booking`,
                            intent: `BookingServiceIntent`,
                            parameters: [{name: "serviceType", value: 'gimnasios' }]
                        };
                
                        ws = new socket(constants.SOCKET_URL);
                        ws.on('open', function open(){
                            ws.send(JSON.stringify(x));
                            ws.close();
                        });
                        
                        
                        speakOutput = `<speak>
                                        El hotel dispone de ${data.length} ${data.length > 1 ? "gimnasios ubicados" : "gimnasio ubicado"} dentro de sus instalaciones. 
                                        ${data.length > 1 ? "Estos son:" : "Este es:"}
                                        ${nameListSpeech}.
                                        <break time="0.02s"/>
                                        Los gimnasios ofrecen a sus huéspedes la posiblidad de reservar sus instalaciones y materiales de entrenamiento para ejercitarse.
                                        ¿Cual es el nombre del gimnasio que desea reservar?
                                       </speak>`;
                                       
                        return handlerInput.responseBuilder
                            .addElicitSlotDirective('serviceName')
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
                            screen: `booking`,
                            intent: `BookingServiceIntent`,
                            parameters: [{name: "serviceType", value: 'spas' }]
                        };
                
                        ws = new socket(constants.SOCKET_URL);
                        ws.on('open', function open(){
                            ws.send(JSON.stringify(x));
                            ws.close();
                        });
                        
                        
                        speakOutput = `<speak>
                                        El hotel dispone de ${data.length} ${data.length > 1 ? "spas ubicados" : "spa ubicado"} dentro de sus instalaciones. 
                                        ${data.length > 1 ? "Estos son:" : "Este es:"}
                                        ${nameListSpeech}.
                                        <break time="0.02s"/>
                                        Los spas ofrecen a sus huéspedes la posiblidad de reservar sesiones de relajamiento y bienestar para equilibrar los sentidos del cuerpo.
                                        Para proceder con la reserva, es necesario que me indique el nombre del spa que desea reservar.
                                        ¿Cual es el nombre del spas que desea reservar?
                                       </speak>`;
                        console.log(speakOutput);
                        
                        return handlerInput.responseBuilder
                            .addElicitSlotDirective('serviceName')
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
        async canHandle(handlerInput) {
            
            const attributesManager = handlerInput.attributesManager;
            const attributes = await attributesManager.getSessionAttributes() || {};
            
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                && handlerInput.requestEnvelope.request.intent.name === "BookingServicesIntent" 
                && handlerInput.requestEnvelope.request.intent.slots.serviceType.value
                && handlerInput.requestEnvelope.request.intent.slots.serviceName.value
                && attributes.currentIntent === 'bookings'
                && !handlerInput.requestEnvelope.request.intent.slots.dishType.value
                && !handlerInput.requestEnvelope.request.intent.slots.date.value
                && !handlerInput.requestEnvelope.request.intent.slots.hour.value
                && !handlerInput.requestEnvelope.request.intent.slots.confirm.value
                
        },
        async handle(handlerInput) {
            let speakOutput = '';
            try{
            
                
                const serviceType = handlerInput.requestEnvelope.request.intent.slots.serviceType.value;
                const serviceName = handlerInput.requestEnvelope.request.intent.slots.serviceName.value
                
                const attributesManager = handlerInput.attributesManager;
                const attributes = await attributesManager.getSessionAttributes() || {};
                
                const serviceTypeId = handlerInput.requestEnvelope.request.intent.slots.serviceType.resolutions.resolutionsPerAuthority[0].values[0].value.id;

                
                let url = '';
                let serviceTypeLabel = '';
                let serviceTypeLabelPlural = '';
                let x = {};
                let ws;
                
                switch(Number(serviceTypeId)){
                    case 1:
                        url = constants.ENDPOINT_RESTAURANTS;
                        serviceTypeLabel = 'restaurante';
                        serviceTypeLabelPlural = 'restaurantes';
                        // mostrar platos de comida
                        break;
                    case 2:
                        url = constants.ENDPOINT_GYMS;
                        serviceTypeLabel = 'gimnasio';
                        serviceTypeLabelPlural = 'gimnasios'
                        break;
                    case 3:
                        url = constants.ENDPOINT_SPAS;
                        serviceTypeLabel = 'spa';
                        serviceTypeLabelPlural = 'spas'
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
                    
                    attributes.serviceId = service[0].id;
                    attributes.serviceName = service[0].name;
                    attributes.serviceType = serviceTypeLabelPlural;
                    
                
                    
                    if(Number(serviceTypeId) === 1){
                        //solicitar el tipo plato de comida
                        speakOutput = `<speak>
                                        El dia de hoy, el ${serviceTypeLabel} ${service[0].name} ofrece en su carta de comidas 
                                        ${9} ${'desayunos'}, 
                                        ${5} ${'almuerzos'} y
                                        ${3} ${'cenas'}.
                                        Cual es el tipo de comida que deseas visualizar?
                                        </speak>`;
                                        
                        //mostrar listado de platos de comida          
                        x = {
                            screen: `booking`,
                            intent: `BookingServiceIntent`,
                            parameters: [
                                {name: 'serviceType', value: serviceTypeLabelPlural},
                                {name: 'serviceId', value: service[0].id }, 
                            ]
                        };
                
                
                        ws = new socket(constants.SOCKET_URL);
                    
                        ws.on('open', function open(){
                            ws.send(JSON.stringify(x));
                            ws.close();
                        });                
                        
                        attributes.restaurantId = service[0].id;
                        attributes.restaurantName = service[0].name;
                        attributes.currentIntent = 'restaurants'
                        
                        attributesManager.setSessionAttributes(attributes);
                        return handlerInput.responseBuilder
                            .speak(speakOutput)
                            .reprompt(speakOutput)
                            .addElicitSlotDirective('dishType')
                            .getResponse();
                        
                    }else{
                        //solicitar la fecha de la reserva
                        speakOutput = `<speak>
                                        Por favor, indícame la fecha de la reserva.
                                        </speak>`;
                                        
                                        
                         x = {
                            screen: `booking`,
                            intent: `BookingServiceIntent`,
                            parameters: [
                                {name: 'serviceType', value: serviceTypeLabelPlural},
                                {name: 'serviceId', value: service[0].id }, 
                            ]
                        };
                
                
                        ws = new socket(constants.SOCKET_URL);
                        
                        ws.on('open', function open(){
                            ws.send(JSON.stringify(x));
                            ws.close();
                        }); 
                        
                        attributesManager.setSessionAttributes(attributes);
                        
                        return handlerInput.responseBuilder
                            .speak(speakOutput)
                            .reprompt(speakOutput)
                            .addElicitSlotDirective('date')
                            .getResponse();
                    }
                    
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
    
    // Booking 
    
    {
        canHandle(handlerInput) {
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                && handlerInput.requestEnvelope.request.intent.name === "BookingServicesIntent" 
                && handlerInput.requestEnvelope.request.intent.slots.serviceType.value
                && handlerInput.requestEnvelope.request.intent.slots.serviceName.value
                && Number(handlerInput.requestEnvelope.request.intent.slots.serviceType.resolutions.resolutionsPerAuthority[0].values[0].value.id) === 1
                && handlerInput.requestEnvelope.request.intent.slots.dishType.value
                && !handlerInput.requestEnvelope.request.intent.slots.dishName.value
                && !handlerInput.requestEnvelope.request.intent.slots.date.value
                && !handlerInput.requestEnvelope.request.intent.slots.hour.value
                && !handlerInput.requestEnvelope.request.intent.slots.confirm.value
        },
        async handle(handlerInput) {
            let speakOutput = '';
            let x = {};
            let ws;
            let serviceTypeLabelPlural;
            try{
                
                const serviceType = handlerInput.requestEnvelope.request.intent.slots.serviceType.value;
                const serviceTypeId = handlerInput.requestEnvelope.request.intent.slots.serviceType.resolutions.resolutionsPerAuthority[0].values[0].value.id;
                
                
                console.log("serviceType: ", serviceTypeId);
                
                const serviceName = handlerInput.requestEnvelope.request.intent.slots.serviceName.value
                const dishType = handlerInput.requestEnvelope.request.intent.slots.dishType.value;
                
                console.log("dishType: ", dishType)
                
                const dishTypesResult = await utils.getReq(constants.ENDPOINT_DISH_TYPES, { method: 'GET' });
                const dishTypes = dishTypesResult.data;
                
                console.log(dishTypes);
                
                const dishTypeObject = dishTypes.find( x => x.description.toLowerCase() === dishType.toLowerCase());
                
                const nameListText = dishTypes.map( x => x.description);
                let nameListSpeech = nameListText.join(`, `);
                nameListSpeech = nameListSpeech.replace(/,([^,]+)$/, ' y$1');
                
                const attributesManager = handlerInput.attributesManager;
                const attributes = await attributesManager.getSessionAttributes() || {};
                
                const serviceId = attributes.serviceId;
                const serviceNameAttr = attributes.serviceName;
                
                switch(Number(serviceTypeId)){
                    case 1:
                        serviceTypeLabelPlural = 'restaurantes';
                        // mostrar platos de comida
                        break;
                    case 2:
                        serviceTypeLabelPlural = 'gimnasios'
                        break;
                    case 3:
                        serviceTypeLabelPlural = 'spas'
                        break;
                    default:
                        break;
                }
                
                if(dishTypeObject){
                    
                    
                    const dishesResult = await utils.getReq(constants.ENDPOINT_DISHES, { method: 'GET'});
                    const dishes = dishesResult.data;
                    
                    console.log(dishes);
                    
                    const a = dishes.filter(x => x.restaurant_id === Number(serviceId) && x.dish_type_id === Number(dishTypeObject.id));
                    
                
                    attributes.dishTypeId = dishTypeObject.id;
                    attributes.dishType = dishTypeObject.id;
                    attributesManager.setSessionAttributes(attributes);
                    
                    const nameDishesListText = a.map(x => x.name);
                    let nameDishesListSpeech = nameDishesListText.join(',<break time="0.01s"/> ');
                    nameDishesListSpeech = nameDishesListSpeech.replace(/,([^,]+)$/, ' y$1');
                    
                    console.log(nameDishesListSpeech);
                    
                    
                     x = {
                            screen: `booking`,
                            intent: `BookingServiceIntent`,
                            parameters: [
                                {name: 'serviceType', value: serviceTypeLabelPlural},
                                {name: 'serviceId', value:  serviceId},
                                {name: 'dishType', value: dishTypeObject.id },
                            ]
                        };
                
                        ws = new socket(constants.SOCKET_URL);
                    
                        ws.on('open', function open(){
                            ws.send(JSON.stringify(x));
                            ws.close();
                        });                
                    
                    speakOutput = `<speak>
                                    El restaurante ${serviceNameAttr} ofrece ${a.length} ${dishTypeObject.description}. 
                                    Estos son: <break time="0.02s" />
                                    ${nameDishesListSpeech}
                                    <break time="0.02s" />
                                    Cual es el nombre del ${dishTypeObject.description} que deseas reservar?
                                   </speak>`;
                                   
                    console.log(speakOutput);
                    
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .reprompt(speakOutput)
                        .addElicitSlotDirective("dishName")
                        .getResponse();
                                   

                    
                }else{
                    //nombre de tipo de plato incorrecto
                    speakOutput = `<speak>
                                    Lo lamento, el nombre del tipo de comida es incorrecto. Los tipos de comida disponibles son:
                                    ${nameListSpeech}.
                                    ¿Cuál es el nombre del tipo de comida que desea visualizar?
                                  </speak>`
                    
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .reprompt(speakOutput)
                        .addElicitSlotDirective('dishType')
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
        canHandle(handlerInput) {
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                && handlerInput.requestEnvelope.request.intent.name === "BookingServicesIntent" 
                && handlerInput.requestEnvelope.request.intent.slots.serviceType.value
                && handlerInput.requestEnvelope.request.intent.slots.serviceName.value
                && Number(handlerInput.requestEnvelope.request.intent.slots.serviceType.resolutions.resolutionsPerAuthority[0].values[0].value.id) === 1
                && handlerInput.requestEnvelope.request.intent.slots.dishType.value
                && handlerInput.requestEnvelope.request.intent.slots.dishName.value
                && !handlerInput.requestEnvelope.request.intent.slots.date.value
                && !handlerInput.requestEnvelope.request.intent.slots.hour.value
                && !handlerInput.requestEnvelope.request.intent.slots.confirm.value
        },
        async handle(handlerInput) {
            let speakOutput = '';
            let x = {};
            let ws = {};
            let serviceTypeLabelPlural = '';
            
            try{
                
                const serviceType = handlerInput.requestEnvelope.request.intent.slots.serviceType.value;
                const serviceName = handlerInput.requestEnvelope.request.intent.slots.serviceName.value
                const dishType = handlerInput.requestEnvelope.request.intent.slots.dishType.value;
                const dishName = handlerInput.requestEnvelope.request.intent.slots.dishName.value;
                const serviceTypeId = handlerInput.requestEnvelope.request.intent.slots.serviceType.resolutions.resolutionsPerAuthority[0].values[0].value.id;
                
                const attributesManager = handlerInput.attributesManager;
                const attributes = await attributesManager.getSessionAttributes() || {};
                
                const serviceId = attributes.serviceId;
                const dishTypeId = attributes.dishTypeId;
                const serviceNameAttr = attributes.serviceName;
                
                const dishesResult = await utils.getReq(constants.ENDPOINT_DISHES, { method: 'GET'});
                const dishes = dishesResult.data;
                
                const a = dishes.filter(x => x.restaurant_id === Number(serviceId) && x.dish_type_id === Number(dishTypeId));
                
                const nameDishesListText = a.map(x => x.name);
                let nameDishesListSpeech = nameDishesListText.join(`, <break time="0.01s"/>`);
                nameDishesListSpeech = nameDishesListSpeech.replace(/,([^,]+)$/, ' y$1');
                
                
                const b = a.find( x => x.name.toLowerCase() === dishName.toLowerCase());
                
                
                if(b){
                    
                    switch(Number(serviceTypeId)){
                        case 1:
                            serviceTypeLabelPlural = 'restaurantes';
                            // mostrar platos de comida
                            break;
                        case 2:
                            serviceTypeLabelPlural = 'gimnasios'
                            break;
                        case 3:
                            serviceTypeLabelPlural = 'spas'
                            break;
                        default:
                            break;
                    }
                    
                    attributes.dishId = b.id;
                    attributesManager.setSessionAttributes(attributes);
                    
                    x = {
                            screen: `booking`,
                            intent: `BookingServiceIntent`,
                            parameters: [
                                {name: 'serviceType', value: serviceTypeLabelPlural},
                                {name: 'serviceId', value:  serviceId},
                                {name: 'dishType', value: dishTypeId},
                                {name: 'dishId', value: b.id}
                            ]
                        };
                
                        ws = new socket(constants.SOCKET_URL);
                    
                        ws.on('open', function open(){
                            ws.send(JSON.stringify(x));
                            ws.close();
                        });          
                    
                    
                    
                    speakOutput = `<speak>
                                    Para proceder con la reserva es necesario que indiques la fecha de la reserva.
                                    ¿Cuál es la fecha de la reserva?
                                    </speak>`;
                                    
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .reprompt(speakOutput)
                        .addElicitSlotDirective('date')
                        .getResponse();
                    
                }else{
                    //nombre de plato incorrecto
                    speakOutput = `<speak>
                                    Lo lamento, el ${dishType} ${dishName} no se encuentra dentro del menú del día. Los ${dishType} disponibles son los siguientes: <break time="0.02s"/>
                                    ${nameDishesListSpeech}
                                    ¿Cuál es el nombre del ${dishType} que desea reservar?
                                   </speak>`;    
                                   
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .reprompt(speakOutput)
                        .addElicitSlotDirective('dishName')
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
        canHandle(handlerInput) {
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                && handlerInput.requestEnvelope.request.intent.name === "BookingServicesIntent" 
                && handlerInput.requestEnvelope.request.intent.slots.serviceType.value
                && handlerInput.requestEnvelope.request.intent.slots.serviceName.value
                && handlerInput.requestEnvelope.request.intent.slots.date.value
                && !handlerInput.requestEnvelope.request.intent.slots.hour.value
                && !handlerInput.requestEnvelope.request.intent.slots.confirm.value
        },
        async handle(handlerInput) {
            let speakOutput = '';
            let x = {};
            let ws = {};
            let serviceTypeLabelPlural = '';
            
            try{
                
                const serviceType = handlerInput.requestEnvelope.request.intent.slots.serviceType.value;
                const serviceName = handlerInput.requestEnvelope.request.intent.slots.serviceName.value
                const date = handlerInput.requestEnvelope.request.intent.slots.date.value;
                
                const serviceTypeId = handlerInput.requestEnvelope.request.intent.slots.serviceType.resolutions.resolutionsPerAuthority[0].values[0].value.id;
                
                const dishType = handlerInput.requestEnvelope.request.intent.slots.dishType.value;
                const dishName = handlerInput.requestEnvelope.request.intent.slots.dishName.value;
                
                const attributesManager = handlerInput.attributesManager;
                const attributes = await attributesManager.getSessionAttributes() || {};
                
                const serviceId = attributes.serviceId;
                const dishTypeId = attributes.dishTypeId;
                const serviceNameAttr = attributes.serviceName;
                const dishId = attributes.dishId;
                
                switch(Number(serviceTypeId)){
                        case 1:
                            serviceTypeLabelPlural = 'restaurantes';
                            // mostrar platos de comida
                            break;
                        case 2:
                            serviceTypeLabelPlural = 'gimnasios'
                            break;
                        case 3:
                            serviceTypeLabelPlural = 'spas'
                            break;
                        default:
                            break;
                }
                
                
                x = {
                    screen: `booking`,
                    intent: `BookingServiceIntent`,
                    parameters: [
                            {name: 'serviceType', value: serviceTypeLabelPlural},
                            {name: 'serviceId', value:  serviceId},
                            {name: 'dishType', value: dishTypeId},
                            {name: 'dishId', value: dishId},
                            {name: 'date', value: date}
                        ]
                    };
                
                ws = new socket(constants.SOCKET_URL);
                    
                ws.on('open', function open(){
                    ws.send(JSON.stringify(x));
                    ws.close();
                });          
                
                speakOutput = `<speak>
                                ¿Cuál es la hora de la reserva?
                               </speak>`;
                               
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .addElicitSlotDirective('hour')
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
        canHandle(handlerInput) {
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                && handlerInput.requestEnvelope.request.intent.name === "BookingServicesIntent" 
                && handlerInput.requestEnvelope.request.intent.slots.serviceType.value
                && handlerInput.requestEnvelope.request.intent.slots.serviceName.value
                && handlerInput.requestEnvelope.request.intent.slots.date.value
                && handlerInput.requestEnvelope.request.intent.slots.hour.value
                && !handlerInput.requestEnvelope.request.intent.slots.confirm.value
        },
        async handle(handlerInput) {
            let speakOutput = '';
            let x = {};
            let ws;
            
            
            try{
                
                const serviceType = handlerInput.requestEnvelope.request.intent.slots.serviceType.value;
                const serviceName = handlerInput.requestEnvelope.request.intent.slots.serviceName.value
                
                const serviceTypeId = handlerInput.requestEnvelope.request.intent.slots.serviceType.resolutions.resolutionsPerAuthority[0].values[0].value.id;
                const timeId = handlerInput.requestEnvelope.request.intent.slots.hour.resolutions.resolutionsPerAuthority[0].values[0].value.id;
                
                console.log(serviceTypeId);
                
                const date = handlerInput.requestEnvelope.request.intent.slots.date.value;
                const hour = handlerInput.requestEnvelope.request.intent.slots.hour.value;
                
                const dishType = handlerInput.requestEnvelope.request.intent.slots.dishType.value;
                const dishName = handlerInput.requestEnvelope.request.intent.slots.dishName.value;
                
                const attributesManager = handlerInput.attributesManager;
                const attributes = await attributesManager.getSessionAttributes() || {};
                
                const serviceId = attributes.serviceId;
                const serviceTypeLabelPlural = attributes.serviceType;
                const dishTypeId = attributes.dishTypeId;
                const dishId = attributes.dishId;
                const serviceNameAttr = attributes.serviceName;
                
                
                
                switch(Number(serviceTypeId)){
                    case 1:
                        speakOutput = `<speak>
                                        Tu reserva del ${dishType} ${dishName} en el restaurante ${serviceNameAttr} se programará para la fecha ${date} a las ${hour}.
                                        <break time="0.02s" /> 
                                        ¿Deseas confirmar la reserva?
                                      </speak>`
                            break;
                    case 2:
                        speakOutput = `<speak>
                                        Tu reserva del gimnasio ${serviceNameAttr} se programará para la fecha ${date} a las ${hour}.
                                        <break time="0.02s" /> 
                                        ¿Deseas confirmar la reserva?
                                       </speak>`;
                            break;
                    case 3:
                        speakOutput = `<speak>
                                        Tu reserva del spa ${serviceNameAttr} se programará para la fecha ${date} a las ${hour}.
                                        <break time="0.02s" /> 
                                        ¿Deseas confirmar la reserva?
                                       </speak>`;
                            break;
                }
                
                console.log(speakOutput);
                
                
                x = {
                    screen: `booking`,
                    intent: `BookingServiceIntent`,
                    parameters: [
                            {name: 'serviceType', value: serviceTypeLabelPlural},
                            {name: 'serviceId', value:  serviceId},
                            {name: 'dishType', value: dishTypeId},
                            {name: 'dishId', value: dishId},
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
    
    
    {
        canHandle(handlerInput) {
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                && handlerInput.requestEnvelope.request.intent.name === "BookingServicesIntent" 
                && handlerInput.requestEnvelope.request.intent.slots.serviceType.value
                && handlerInput.requestEnvelope.request.intent.slots.serviceName.value
                && handlerInput.requestEnvelope.request.intent.slots.date.value
                && handlerInput.requestEnvelope.request.intent.slots.hour.value
                && handlerInput.requestEnvelope.request.intent.slots.confirm.value
        },
        async handle(handlerInput) {
            let speakOutput = '';
            let x = {};
            let ws;
            let serviceTypeLabel;
            let dishTypeLabel;
            
            try{
                
                const serviceType = handlerInput.requestEnvelope.request.intent.slots.serviceType.value;
                const serviceName = handlerInput.requestEnvelope.request.intent.slots.serviceName.value
                
                const serviceTypeId = handlerInput.requestEnvelope.request.intent.slots.serviceType.resolutions.resolutionsPerAuthority[0].values[0].value.id;
                const confirmId = handlerInput.requestEnvelope.request.intent.slots.confirm.resolutions.resolutionsPerAuthority[0].values[0].value.id;
                const timeId = handlerInput.requestEnvelope.request.intent.slots.hour.resolutions.resolutionsPerAuthority[0].values[0].value.id;
                
                console.log(serviceTypeId);
                
                const date = handlerInput.requestEnvelope.request.intent.slots.date.value;
                const hour = handlerInput.requestEnvelope.request.intent.slots.hour.value;
                
                const dishType = handlerInput.requestEnvelope.request.intent.slots.dishType.value;
                const dishName = handlerInput.requestEnvelope.request.intent.slots.dishName.value;
                
                const attributesManager = handlerInput.attributesManager;
                const attributes = await attributesManager.getSessionAttributes() || {};
                
                const serviceId = attributes.serviceId;
                const dishTypeId = attributes.dishTypeId;
                const dishId = attributes.dishId;
                const serviceNameAttr = attributes.serviceName;
                
                
                switch(dishType){
                    case 'desayunos':
                        dishTypeLabel = 'desayuno';
                        break;
                    case 'almuerzos':
                        dishTypeLabel = 'almuerzo';
                        break;
                    case 'cenas':
                        dishTypeLabel = 'cena';
                        break;
                }
                
                
                
                switch(Number(serviceTypeId)){
                    case 1:
                        speakOutput = `<speak>
                                        Tu reserva del ${dishType} ${dishName} en el restaurante ${serviceNameAttr} se ha confirmado para la fecha ${date} a las ${hour}.
                                        Recuerda que para visualizar tus reservas puedes decir:
                                        <break time="0.02s" /> Muestrame el listado de reservas.
                                      </speak>`
                            break;
                    case 2:
                        speakOutput = `<speak>
                                        Tu reserva del gimnasio ${serviceNameAttr} se ha confirmado para la fecha ${date} a las ${hour}.
                                        Recuerda que para visualizar tus reservas puedes decir:
                                        <break time="0.02s" /> Muestrame el listado de reservas.
                                       </speak>`;
                            break;
                    case 3:
                        speakOutput = `<speak>
                                        Tu reserva del spa ${serviceNameAttr} se ha confirmado para la fecha ${date} a las ${hour}.
                                        Recuerda que para visualizar tus reservas puedes decir:
                                        <break time="0.02s" /> Muestrame el listado de reservas.
                                       </speak>`;
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
                    
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .reprompt(speakOutput)
                        .getResponse();
                    
                }else{
                    //say no
                    
                     speakOutput = `<speak>
                                         Tu reserva ha sido cancelada.<break time="0.02s"/>
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




