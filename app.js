const authorization = "Basic M3VaR0JjTG5BUWpPN3paeEpYeU4xaGllVE1HYXNTTUo6R2EwTXRyWWNDbEtjRjh1NA==";
let hasSearched = 0;
const searchRisk = async (hasSearchedRisk) => {
    let apiUrl;
    if (hasSearchedRisk == 'wind') {
        apiUrl = `call api risque de vent`;
    } else if (hasSearchedRisk == 'water') {
        apiUrl = `call api risque inondation`;
    } else {
        apiUrl = `call api temperature min max`;
    }
    try {
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
