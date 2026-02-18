const axios = require('axios');

const API_URL = 'http://localhost:5000/api/facilities';

const checkFacilities = async () => {
    try {
        console.log('Fetching facilities...');
        const res = await axios.get(API_URL);
        const facilities = res.data;

        console.log(`Total facilities found: ${facilities.length}`);

        const important = facilities.filter(f => f.isImportant);
        console.log(`Important facilities found: ${important.length}`);

        if (important.length > 0) {
            console.log('Important Facilities List:');
            important.forEach(f => {
                console.log(`- ${f.title} (Icon: ${f.icon}, ID: ${f._id})`);
            });
        } else {
            console.log('⚠️ No important facilities found. The Home page will show fallback amenities.');
        }

    } catch (err) {
        console.error('Error fetching facilities:', err.message);
    }
};

checkFacilities();
