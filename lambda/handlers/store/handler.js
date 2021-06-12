const socket = require('ws');
const constants = require("../../constants/constants");
const utils = require("../../utils/util");

const handlers = [
    
    {
        async canHandle(handlerInput) {
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                && handlerInput.requestEnvelope.request.intent.name === "StoreProductIntent"
                && !handlerInput.requestEnvelope.request.intent.slots.confirmChangeCategory.value
                && !handlerInput.requestEnvelope.request.intent.slots.productCategory.value
                && !handlerInput.requestEnvelope.request.intent.slots.confirmStartBuy.value
                && !handlerInput.requestEnvelope.request.intent.slots.productName.value
                && !handlerInput.requestEnvelope.request.intent.slots.confirmEndBuy.value
        },
        async handle(handlerInput) {
            let speakOutput;
            let x = {};
            let ws;
            let response = {};
            let data = {};
            
            try{
                
                response = await utils.getReq(constants.ENDPOINT_PRODUCT_CATEGORIES, { method: 'GET' });
                data = response.data;
                const nameListText = data.map(x => x.name);
                let nameListSpeech = nameListText.join(',<break time="0.01s" /> ');
                nameListSpeech = nameListSpeech.replace(/,([^,]+)$/, ' y$1');
                
                x = {
                    screen: `store`,
                    intent: `storeIntent`,
                    parameters: []
                    };
                    
                ws = new socket(constants.SOCKET_URL);
                ws.on('open', function open(){
                    ws.send(JSON.stringify(x));
                    ws.close();
                });
                
                const attributesManager = handlerInput.attributesManager;
                const attributes = await attributesManager.getSessionAttributes() || {};
                
                attributes.currentIntent = 'store';
                attributesManager.setSessionAttributes(attributes);
                
                
                speakOutput = `<speak>
                                Bienvenido a la tienda de productos del hotel.
                                El hotel pone a tu disposición ${data.length} categorías de productos, los cuales son:
                                ${nameListSpeech}
                                ¿Deseas visualizar una categoría en específico?
                               </speak>`;
                               
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .addElicitSlotDirective('confirmChangeCategory')
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
                && handlerInput.requestEnvelope.request.intent.name === "StoreProductIntent"
                && handlerInput.requestEnvelope.request.intent.slots.confirmChangeCategory.value
                && !handlerInput.requestEnvelope.request.intent.slots.productCategory.value
                && !handlerInput.requestEnvelope.request.intent.slots.confirmStartBuy.value
                && !handlerInput.requestEnvelope.request.intent.slots.productName.value
                && !handlerInput.requestEnvelope.request.intent.slots.confirmEndBuy.value
        },
        async handle(handlerInput) {
            let speakOutput;
            let x = {};
            let ws;
            let response = {};
            let data = {};
            
            try{
                
                response = await utils.getReq(constants.ENDPOINT_PRODUCT_CATEGORIES, { method: 'GET' });
                const answerId = handlerInput.requestEnvelope.request.intent.slots.confirmChangeCategory.resolutions.resolutionsPerAuthority[0].values[0].value.id;
                
                if(Number(answerId) < 2){
                    //say yes
                    
                
                    speakOutput = `<speak>
                                    ¿Cuál es el nombre de la categoría de producto que deseas visualizar?
                                   </speak>`;
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .reprompt("Lo lamento, no le he comprendido. ¿Qué categoría de producto deseas visualizar?")
                        .addElicitSlotDirective('productCategory')
                        .getResponse();
                }else{
                    //say no
                    speakOutput = `<speak>
                                    Lo comprendo, recuerda que para cambiar de categoría de producto, debes decir:
                                    "Cambia" <break time="0.02s" /> seguido del nombre de la categoría.
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
                && handlerInput.requestEnvelope.request.intent.name === "StoreProductIntent"
                && handlerInput.requestEnvelope.request.intent.slots.confirmChangeCategory.value
                && handlerInput.requestEnvelope.request.intent.slots.productCategory.value
                && !handlerInput.requestEnvelope.request.intent.slots.confirmStartBuy.value
                && !handlerInput.requestEnvelope.request.intent.slots.productName.value
                && !handlerInput.requestEnvelope.request.intent.slots.confirmEndBuy.value
        },
        async handle(handlerInput) {
            let speakOutput;
            let x = {};
            let ws;
            let response = {};
            let data = {};
            
            try{
                
                const productCategory = handlerInput.requestEnvelope.request.intent.slots.productCategory.value;
                
                response = await utils.getReq(constants.ENDPOINT_PRODUCT_CATEGORIES, { method: 'GET' });
                data = response.data;
                
                const nameListText = data.map(x => x.name);
                let nameListSpeech = nameListText.join(',<break time="0.01s" /> ');
                nameListSpeech = nameListSpeech.replace(/,([^,]+)$/, ' y$1');
                
                const productCategorySearch = data.find(x => x.name.toLowerCase() === productCategory.toLowerCase());
                
                if(productCategorySearch){
                    
                    const productsResult = await utils.getReq(constants.ENDPOINT_PRODUCTS, { method: 'GET' });
                    const products = productsResult.data.filter(x => Number(x.product_category_id) === Number(productCategorySearch.id));
                    
                    const productListText = products.map(x => x.name);
                    let productListSpeech = productListText.join(', <break time="0.01s"/>');
                    productListSpeech = productListSpeech.replace(/,([^,]+)$/, ' y$1');
                    
                    
                    const attributesManager = handlerInput.attributesManager;
                    const attributes = await attributesManager.getSessionAttributes() || {};
                
                    attributes.currentIntent = 'store';
                    attributes.productCategory = productCategorySearch.id;
                    attributes.productCategoryName = productCategorySearch.name;
                    attributesManager.setSessionAttributes(attributes);
                    
                    
                    x = {
                    screen: `store`,
                    intent: `storeIntent`,
                    parameters: [
                            {name: 'productCategory', value: productCategorySearch.id},
                        ]
                    };
                    
                    ws = new socket(constants.SOCKET_URL);
                    ws.on('open', function open(){
                        ws.send(JSON.stringify(x));
                        ws.close();
                    });
                    
                
                    speakOutput = `
                                    <speak>
                                        Haz elegido la categoría de ${productCategory}. 
                                        Para esta categoría disponemos de ${products.length} productos.
                                        Estos son:
                                        ${productListSpeech}
                                        ¿Estás interesado en comprar alguno de estos productos?
                                    </speak>
                                  `;
                                  
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .reprompt(speakOutput)
                        .addElicitSlotDirective('confirmStartBuy')
                        .getResponse();
                    
                }else{
                    
                    speakOutput = `<speak>
                                    Lo lamento, la categoría ${productCategory} no se encuentra dentro de las categorías de productos disponibles.
                                    Las categorías disponibles son: 
                                    ${nameListSpeech}
                                    ¿Cuál es el nombre de la categoría que desea visualizar?
                                   </speak>`
                                   
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .reprompt("Lo lamento, no le he comprendido. Cual es el nombre de la categoria de producto que desea visualizar?")
                        .addElicitSlotDirective('productCategory')
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
                && handlerInput.requestEnvelope.request.intent.name === "StoreProductIntent"
                && handlerInput.requestEnvelope.request.intent.slots.confirmChangeCategory.value
                && handlerInput.requestEnvelope.request.intent.slots.productCategory.value
                && handlerInput.requestEnvelope.request.intent.slots.confirmStartBuy.value
                && !handlerInput.requestEnvelope.request.intent.slots.productName.value
                && !handlerInput.requestEnvelope.request.intent.slots.confirmEndBuy.value
                
        },
        async handle(handlerInput) {
            let speakOutput;
            let x = {};
            let ws;
            let response = {};
            let data = {};
            
            try{
                
                const answerId = handlerInput.requestEnvelope.request.intent.slots.confirmStartBuy.resolutions.resolutionsPerAuthority[0].values[0].value.id;
                
                if(Number(answerId) < 2){
                    //say yes
                    
                
                    speakOutput = `<speak>
                                    ¿Cuál es el nombre del producto que desea comprar?
                                   </speak>`;
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .reprompt("Lo lamento, no le he comprendido. ¿Cuál es el nombre del producto que desea comprar?")
                        .addElicitSlotDirective('productName')
                        .getResponse();
                }else{
                    //say no
                    speakOutput = `<speak>
                                    Lo comprendo, recuerda que para comprar un producto, debes decir:
                                    "Compra" <break time="0.02s" /> seguido del nombre del producto.
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
                && handlerInput.requestEnvelope.request.intent.name === "StoreProductIntent"
                && handlerInput.requestEnvelope.request.intent.slots.confirmChangeCategory.value
                && handlerInput.requestEnvelope.request.intent.slots.productCategory.value
                && handlerInput.requestEnvelope.request.intent.slots.confirmStartBuy.value
                && handlerInput.requestEnvelope.request.intent.slots.productName.value
                && !handlerInput.requestEnvelope.request.intent.slots.confirmEndBuy.value
        },
        async handle(handlerInput) {
            let speakOutput;
            let x = {};
            let ws;
            let response = {};
            let data = {};
            
            try{
                
                const attributesManager = handlerInput.attributesManager;
                const attributes = await attributesManager.getSessionAttributes() || {};
                const productCategoryId = attributes.productCategory;
                const productName = handlerInput.requestEnvelope.request.intent.slots.productName.value;
                const productCategoryName = handlerInput.requestEnvelope.request.intent.slots.productCategory.value;
                
                attributes.currentIntent = 'store';
                
                
            
                const productsResult = await utils.getReq(constants.ENDPOINT_PRODUCTS, { method: 'GET' });
                const products = productsResult.data.filter(x => Number(x.product_category_id) === Number(productCategoryId));
                
                const nameListText = products.map(x => x.name);
                let nameListSpeech = nameListText.join(',<break time="0.01s" /> ');
                nameListSpeech = nameListSpeech.replace(/,([^,]+)$/, ' y$1');
                
                
                const productResult = await utils.getReq(`${constants.ENDPOINT_PRODUCTS}?name=${productName}`, { method: 'GET' });
                const product = productResult.data;
                
                if(product.length > 0){
                    
                    
                    x = {
                        screen: `store`,
                        intent: `storeIntent`,
                        parameters: [
                            {name: 'productCategory', value: productCategoryId},
                            {name: 'product', value: product[0].id},
                        ]
                    };
                    
                    ws = new socket(constants.SOCKET_URL);
                    ws.on('open', function open(){
                        ws.send(JSON.stringify(x));
                        ws.close();
                    });
                    
                    
                    speakOutput = `<speak>
                                    Haz elegido comprar el producto ${product[0].name} por un importe total de ${product[0].price} soles.
                                    <break time="0.02s" />
                                    ¿Deseas confirmar la compra?
                                   </speak>`;
                    
                    
                    attributes.currentIntent = 'store';
                    attributes.productId = product[0].id;
                    attributes.productName = product[0].name;
                    attributes.productPrice = product[0].price;
                    
                    attributesManager.setSessionAttributes(attributes);
                    
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .reprompt(speakOutput)
                        .addElicitSlotDirective('confirmEndBuy')
                        .getResponse();
                    
                }else{
                    speakOutput = `<speak>
                                    Lo lamento, el producto ${productName} no se encuentra disponible en la tienda.
                                    Los productos de la categoría de ${productCategoryName} son: 
                                    ${nameListSpeech}
                                    <break time="0.03s" />
                                    ¿Cuál es el nombre del producto que desea comprar?
                                   </speak>`;
                                   
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .reprompt(speakOutput)
                        .addElicitSlotDirective('productName')
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
                && handlerInput.requestEnvelope.request.intent.name === "StoreProductIntent"
                && handlerInput.requestEnvelope.request.intent.slots.confirmChangeCategory.value
                && handlerInput.requestEnvelope.request.intent.slots.productCategory.value
                && handlerInput.requestEnvelope.request.intent.slots.confirmStartBuy.value
                && handlerInput.requestEnvelope.request.intent.slots.productName.value
                && handlerInput.requestEnvelope.request.intent.slots.confirmEndBuy.value
        },
        async handle(handlerInput) {
            let speakOutput;
            let x = {};
            let ws;
            let response = {};
            let data = {};
            
            try{
                
                const answerId = handlerInput.requestEnvelope.request.intent.slots.confirmEndBuy.resolutions.resolutionsPerAuthority[0].values[0].value.id;
                
                const attributesManager = handlerInput.attributesManager;
                const attributes = await attributesManager.getSessionAttributes() || {};
                const productId = attributes.productId;
                const productCategoryId = attributes.productCategory;
                attributes.currentIntent = 'store';
                
                if(Number(answerId) < 2){
                    //say yes
                    const productsResult = await utils.getReq(constants.ENDPOINT_PRODUCTS, { method: 'GET' });
                    
                    console.log(productsResult);
                    console.log(productId);
                    
                    const product = productsResult.data.filter( x => Number(x.id) === Number(productId));
                    console.log(product);
                    
                    x = {
                    screen: `store`,
                    intent: `storeIntent`,
                    parameters: [
                            {name: 'productCategory', value: productCategoryId},
                            {name: 'product', value: productId},
                            {name: 'confirm', value: answerId},
                        ]
                    };
                    
                    ws = new socket(constants.SOCKET_URL);
                    ws.on('open', function open(){
                        ws.send(JSON.stringify(x));
                        ws.close();
                    });
                
                
                
                    speakOutput = `<speak>
                                    La transacción se ha completado con éxito. El producto ${product[0].name} se ha agregado a tu cuenta por un monto total de ${product[0].price} soles.
                                    Puedes verificar tu compra ingresando al historial de transacciones, solo tienes que decir:
                                    "Muestrame el historial de compras".
                                    <break time="0.03s" />
                                    Recuerda que para comprar otro producto, puedes decir:
                                    "Compra" <break time="0.02s"/> seguido del nombre del producto.
                                   </speak>`;
                                   
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .reprompt(speakOutput)
                        .getResponse();
                }else{
                    //say no
                    speakOutput = `<speak>
                                    Lo comprendo, recuerda que para comprar un producto, debes decir:
                                    "Compra" <break time="0.02s" /> seguido del nombre del producto.
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
            
            const attributesManager = handlerInput.attributesManager;
            const attributes = await attributesManager.getSessionAttributes() || {};
            const currentIntent = attributes.currentIntent;
            const productCategory = attributes.productCategory;
            
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                && handlerInput.requestEnvelope.request.intent.name === "BuyProductIntent"
                && !handlerInput.requestEnvelope.request.intent.slots.productCategory.value
                && !handlerInput.requestEnvelope.request.intent.slots.productName.value
                && !handlerInput.requestEnvelope.request.intent.slots.confirmTransaction.value
        },
        async handle(handlerInput) {
            let speakOutput;
            let x = {};
            let ws;
            let response = {};
            let data = {};
            
            try{
                
                const answerId = handlerInput.requestEnvelope.request.intent.slots.confirmEndBuy.resolutions.resolutionsPerAuthority[0].values[0].value.id;
                
                const attributesManager = handlerInput.attributesManager;
                const attributes = await attributesManager.getSessionAttributes() || {};
                const productId = attributes.productId;
                const productCategoryId = attributes.productCategory;
                attributes.currentIntent = 'store';
                
                if(Number(answerId) < 2){
                    //say yes
                    const productsResult = await utils.getReq(constants.ENDPOINT_PRODUCTS, { method: 'GET' });
                    
                    console.log(productsResult);
                    console.log(productId);
                    
                    const product = productsResult.data.filter( x => Number(x.id) === Number(productId));
                    console.log(product);
                    
                    x = {
                    screen: `store`,
                    intent: `storeIntent`,
                    parameters: [
                            {name: 'productCategory', value: productCategoryId},
                            {name: 'product', value: productId},
                            {name: 'confirm', value: answerId},
                        ]
                    };
                    
                    ws = new socket(constants.SOCKET_URL);
                    ws.on('open', function open(){
                        ws.send(JSON.stringify(x));
                        ws.close();
                    });
                
                
                
                    speakOutput = `<speak>
                                    La transacción se ha completado con éxito. El producto ${product[0].name} se ha agregado a tu cuenta por un monto total de ${product[0].price} soles.
                                    Puedes verificar tu compra ingresando al historial de transacciones, solo tienes que decir:
                                    "Muestrame mi resumen de cuenta".
                                    <break time="0.03s" />
                                    Recuerda que para comprar otro producto, puedes decir:
                                    "Compra" <break time="0.02s"/> seguido del nombre del producto.
                                   </speak>`;
                                   
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .reprompt(speakOutput)
                        .getResponse();
                }else{
                    //say no
                    speakOutput = `<speak>
                                    Lo comprendo, recuerda que para comprar un producto, debes decir:
                                    "Compra" <break time="0.02s" /> seguido del nombre del producto.
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
            
            const attributesManager = handlerInput.attributesManager;
            const attributes = await attributesManager.getSessionAttributes() || {};
            const currentIntent = attributes.currentIntent;
            const productCategory = attributes.productCategory;
            
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                && handlerInput.requestEnvelope.request.intent.name === "BuyProductIntent"
                && handlerInput.requestEnvelope.request.intent.slots.productName.value
                && !handlerInput.requestEnvelope.request.intent.slots.confirmTransaction.value                                        
                && currentIntent === 'store'
        },
        async handle(handlerInput) {
            let speakOutput;
            let x = {};
            let ws;
            let response = {};
            let data = {};
            
            try{
                
                const attributesManager = handlerInput.attributesManager;
                const attributes = await attributesManager.getSessionAttributes() || {};
                
                const productCategoryId = attributes.productCategory;
                const productCategoryName = attributes.productCategoryName;
                
                
                const productsResult = await utils.getReq(constants.ENDPOINT_PRODUCTS, { method: 'GET' });
                const products = productsResult.data.filter(x => x.product_category_id === Number(productCategoryId));
                
                const nameListText = products.map(x => x.name);
                let nameListSpeech = nameListText.join(',<break time="0.01s" /> ');
                nameListSpeech = nameListSpeech.replace(/,([^,]+)$/, ' y$1');
                
                const productName = handlerInput.requestEnvelope.request.intent.slots.productName.value;
                console.log(productName);
                
                const productResult = await utils.getReq(`${constants.ENDPOINT_PRODUCTS}?name=${productName}`, { method: 'GET' });
                const product = productResult.data;
                
                console.log(product);
                
                if(product.length > 0){
                    
                    
                    x = {
                        screen: `store`,
                        intent: `storeIntent`,
                        parameters: [
                            {name: 'productCategory', value: productCategoryId},
                            {name: 'product', value: product[0].id},
                        ]
                    };
                    
                    ws = new socket(constants.SOCKET_URL);
                    ws.on('open', function open(){
                        ws.send(JSON.stringify(x));
                        ws.close();
                    });
                    
                    
                    speakOutput = `<speak>
                                    Haz elegido comprar el producto ${product[0].name} por un importe total de ${product[0].price} soles.
                                    <break time="0.02s" />
                                    ¿Deseas confirmar la compra?
                                   </speak>`;
                    
                    
                    attributes.currentIntent = 'store';
                    attributes.productId = product[0].id;
                    attributes.productName = product[0].name;
                    attributes.productPrice = product[0].price;
                    
                    attributesManager.setSessionAttributes(attributes);
                    
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .reprompt(speakOutput)
                        .addElicitSlotDirective('confirmTransaction')
                        .getResponse();
                    
                }else{
                    speakOutput = `<speak>
                                    Lo lamento, el producto ${productName} no se encuentra disponible en la tienda.
                                    Los productos de la categoría de ${productCategoryName} son: 
                                    ${nameListSpeech}
                                    <break time="0.03s" />
                                    ¿Cuál es el nombre del producto que desea comprar?
                                   </speak>`;
                                   
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .reprompt(speakOutput)
                        .addElicitSlotDirective('productName')
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
            
            const attributesManager = handlerInput.attributesManager;
            const attributes = await attributesManager.getSessionAttributes() || {};
            const currentIntent = attributes.currentIntent;
            const productCategory = attributes.productCategory;
            
            return handlerInput.requestEnvelope.request.type === "IntentRequest"
                && handlerInput.requestEnvelope.request.intent.name === "BuyProductIntent"
                && handlerInput.requestEnvelope.request.intent.slots.productName.value
                && handlerInput.requestEnvelope.request.intent.slots.confirmTransaction.value                                        
                && currentIntent === 'store'
        },
        async handle(handlerInput) {
            let speakOutput;
            let x = {};
            let ws;
            let response = {};
            let data = {};
            
            try{
                
                const answerId = handlerInput.requestEnvelope.request.intent.slots.confirmTransaction.resolutions.resolutionsPerAuthority[0].values[0].value.id;
                
                const attributesManager = handlerInput.attributesManager;
                const attributes = await attributesManager.getSessionAttributes() || {};
                
                
                const productId = attributes.productId;
                
                const productCategoryId = attributes.productCategory;
                attributes.currentIntent = 'store';
                
                if(Number(answerId) < 2){
                    //say yes
                    const productsResult = await utils.getReq(constants.ENDPOINT_PRODUCTS, { method: 'GET' });
                    
                    const product = productsResult.data.filter( x => Number(x.id) === Number(productId));
                    
                    
                    x = {
                    screen: `store`,
                    intent: `storeIntent`,
                    parameters: [
                            {name: 'productCategory', value: productCategoryId},
                            {name: 'product', value: productId},
                            {name: 'confirm', value: answerId},
                        ]
                    };
                    
                    ws = new socket(constants.SOCKET_URL);
                    ws.on('open', function open(){
                        ws.send(JSON.stringify(x));
                        ws.close();
                    });
                
                
                
                    speakOutput = `<speak>
                                    La transacción se ha completado con éxito. El producto ${product[0].name} se ha agregado a tu cuenta por un monto total de ${product[0].price} soles.
                                    <break time="0.01s" />
                                    Puedes verificar tu compra ingresando a tu resumen de cuenta, solo tienes que decir:
                                    "Muéstrame mi resumen de cuenta".
                                    <break time="0.03s" />
                                    Recuerda que para comprar otro producto, puedes decir:
                                    "Compra" <break time="0.02s"/> seguido del nombre del producto.
                                   </speak>`;
                                   
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .reprompt(speakOutput)
                        .getResponse();
                }else{
                    //say no
                    speakOutput = `<speak>
                                    Lo comprendo, recuerda que para comprar un producto, debes decir:
                                    "Compra" <break time="0.02s" /> seguido del nombre del producto.
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
    
    
    
    
    
    
]

module.exports = handlers;
