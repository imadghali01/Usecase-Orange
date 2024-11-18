const authorization = "Basic M3VaR0JjTG5BUWpPN3paeEpYeU4xaGllVE1HYXNTTUo6R2EwTXRyWWNDbEtjRjh1NA==";
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
}

////CALL USER LOCATION (await token)

///CALL GEOFENCING  by risk type(await userlocation )
const searchRisk = async (hasSearchedRisk, userlocation) => {
    let apiUrl;
    if (hasSearchedRisk == 'wind') {
        apiUrl = `call api risque de vent`;
    } else if (hasSearchedRisk == 'water') {
        apiUrl = `call api risque inondation`;
    } else {
        apiUrl = `call api temperature min max`;
    }
    try {
        apiUrl+=`location = ${userlocation}`;
        const callAp = await fetch(apiUrl, { 
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authorization}`,
                'Content-Type': 'application/json'
            }
        });
        const searchedRisk = await callAp.json();
        return searchedRisk;
    } catch (error) {
        console.error('Erreur:', error);
    }
};


