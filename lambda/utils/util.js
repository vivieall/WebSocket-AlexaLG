const constants = require("../constants/constants.js");
const fetch = require('node-fetch');

function validateTopic(topic){
    let flag = false; 
    for(let i = 0; i < constants.topics.length; i++){
        if(constants.topics[i].es === topic){
            flag = true;
            break;
        }
    }
    return flag;
};


async function getReq(url,headers){
    try{
        const response = await fetch(url, headers);
        const data = await response.json();
        return data;
    }catch(ex){
        console.log(ex)
    }
}

async function postReq(url, body){
    try{
        const response = await fetch(url, {method: "POST", body: JSON.stringify(body),headers: {"Content-Type": "application/json"}});
        const data = await response.json();
        return data;   
    }catch(ex){
        console.log(ex)
    }
}



module.exports.validateTopic = validateTopic;
module.exports.getReq = getReq;
module.exports.postReq = postReq;
