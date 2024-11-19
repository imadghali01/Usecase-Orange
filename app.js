const authorization = "Basic M3VaR0JjTG5BUWpPN3paeEpYeU4xaGllVE1HYXNTTUo6R2EwTXRyWWNDbEtjRjh1NA==";
const numeroTest = [];
let hasSearched = 0;
////CALL TOKEN
const callToken = async ()=>{
    const callFetch = await fetch("https://api.orange.com/oauth/v3/token", {
        method: 'POST',
        headers: {
            "Authorization": `${authorization}`,
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json",
        },
        body:
        "grant_type=client_credentials",
    });
    return callFetch;
}

////CALL USER LOCATION (await token)
const userLocation = async (numerodeteluser) =>{
    const location = await fetch("apiUrl", {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${callToken()}`,
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json",
        },
        body:`${numerodeteluser}`
    })
    return location;
}

///CALL GEOFENCING  by risk type(await userlocation, searched risk & token )
const searchRisk = async (hasSearchedRisk, usertel) => {
    let apiUrl;
    if (hasSearchedRisk == 'wind') {
        apiUrl = `call api risque de vent`; //call georisk endpoint tempete
    } else if (hasSearchedRisk == 'water') {
        apiUrl = `call api risque inondation`; //call georisk endpoint inondation
    } else {
        apiUrl = `call api temperature min max`; //call georisk endpoint temperature
    }
    try {
        apiUrl+=`location = ${userLocation(usertel)}`; // call de l api georisk avec la location userlocation() qui va nous renvoyé les zones a risque dans le coin il nous faudra ensuite un call de la carte geofencing avec les point chaud autour en couleur
        const callAp = await fetch(apiUrl, { 
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${callToken()}`,
                'Content-Type': 'application/json'
            }
        });
        const searchedRisk = await callAp.json();
        //foreach searchedrisk call api de geofencing pour noter les point chaud sur la map 

    } catch (error) {
        console.error('Erreur:', error);
    }
};


