const socket = require('ws');
const constants = require("../../constants/constants");
const utils = require("../../utils/util");

const handlers = [
    {
    async canHandle(handlerInput){
        return handlerInput.requestEnvelope.request.type === "IntentRequest"
            && handlerInput.requestEnvelope.request.intent.name === "AccountStateIntent"
    },
    async handle(handlerInput){
        let speakOutput;
        let x = {};
        let ws;
        
        try{
            
            const accountResult = await utils.getReq(constants.ENDPOINT_ACCOUNT_BY_GUEST(constants.GUEST_ID), { method: 'GET' });
            console.log(accountResult);
            console.log(constants.GUEST_ID);
            const account = accountResult.data;
            
            const start_booking_date = new Date(account[0].billing_date_start).toLocaleDateString("en-US");
            const end_booking_date = new Date(account[0].billing_date_end).toLocaleDateString("en-US");
            
            const transactions = await utils.getReq(constants.ENDPOINT_TRANSACTIONS, { method: 'GET' });
            const transactionsGuest = transactions.data.filter(e => e.guest_id === constants.GUEST_ID);
            
            
            x = {
                    screen: `shoppingSummary`,
                    intent: `AccountStateIntent`,
                    parameters: []
                };
                
            ws = new socket(constants.SOCKET_URL);
            ws.on('open', function open(){
                ws.send(JSON.stringify(x));
                ws.close();
            });
            
            if(transactionsGuest.length > 0){
                
                speakOutput = `<speak>
                            Bienvenido a su resumen de cuenta, para el periódo <say-as interpret-as="date" format="dmy">${start_booking_date}</say-as>
                            al <say-as interpret-as="date" format="dmy">${end_booking_date}</say-as>, ha realizado ${transactionsGuest.length} ${ transactionsGuest.length > 1  ? "transacciones" : "transacción"} por
                            un monto total de <say-as interpret-as="number">${account[0].total_amount}</say-as> soles.
                          </speak>`; 
                
            }else{
                
                speakOutput = `<speak>
                                Bienvenido a su resumen de cuenta, para el periódo <say-as interpret-as="date" format="dmy">${start_booking_date}</say-as>
                                al <say-as interpret-as="date" format="dmy">${end_booking_date}</say-as>, usted no ha realizado ninguna transacción. 
                                </speak>` 
            }
            
            const attributesManager = handlerInput.attributesManager;
            const attributes = await attributesManager.getSessionAttributes() || {};
            attributes.currentIntent = 'shoppingSummary';
            attributesManager.setSessionAttributes(attributes);
            
            
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
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
        }
    }
}
];

module.exports = handlers;



