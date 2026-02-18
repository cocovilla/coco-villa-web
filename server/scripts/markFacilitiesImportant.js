const axios = require('axios');

const API_URL = 'http://localhost:5000/api/facilities';

const markImportant = async () => {
    try {
        console.log('Fetching facilities...');
        const res = await axios.get(API_URL);
        const facilities = res.data;

        // Facilities to mark as important (titles must match existing ones or fallbacks)
        // Adjust these titles based on what is likely in the DB or just pick the first 4
        const targetTitles = ['Wifi', 'Swimming Pool', 'Air Conditioning', 'Breakfast', 'Parking'];

        let count = 0;

        for (const facility of facilities) {
            // Mark as important if it matches target titles OR just mark the first 4 if titles don't match
            if (count < 4) {
                console.log(`Marking "${facility.title}" as important...`);
                await axios.put(`${API_URL}/${facility._id}`, { isImportant: true });
                count++;
            }
        }

        console.log(`✅ Marked ${count} facilities as important.`);

    } catch (err) {
        console.error('Error updating facilities:', err.message);
    }
};

markImportant();
