// File: /api/info.js

const fetch = require('node-fetch');

// Ye Vercel ka standard handler function hai
module.exports = async (req, res) => {
    // URL se mobile number nikalein
    const { mobile } = req.query;

    if (!mobile) {
        return res.status(400).json({ error: 'Mobile number is required' });
    }

    // !! IMPORTANT: Apna API key yahan daalein ya Environment Variable ka istemal karein
    const apiKey = 'kankan1'; 

    const apiEndpoints = [
        `https://seller-ki-mkc.taitanx.workers.dev/?mobile=${mobile}`,
        `https://mkapi-v2.onrender.com/num?mobile=${mobile}&api_key=${apiKey}`,
        `https://ifsc.taitaninfo.workers.dev/?code=${mobile}`,
        `https://adhar-opal.vercel.app/api/fetch?key=wamphire&aadhaar=${mobile}`,
        `https://nixonsmmapi.s77134867.workers.dev/?mobile=${mobile}`,
        `http://king.thesmmpanel.shop/number-info?mobile=${mobile}`
    ];

    try {
        const apiCalls = apiEndpoints.map(url =>
            fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error fetching from ${url}: ${response.statusText}`);
                }
                return response.json();
            })
            .catch(error => {
                console.error(`Failed to fetch from ${url}:`, error.message);
                return { error: error.message };
            })
        );

        const results = await Promise.all(apiCalls);

        const finalResponse = {
            mobile: mobile,
            source_apis: [
                { name: "Seller Ki MKC", data: results[0] },
                { name: "MKAPI v2", data: results[1] },
                { name: "IFSC Taitan", data: results[2] },
                { name: "Adhar Opal", data: results[3] },
                { name: "Nixon SMM", data: results[4] },
                { name: "King SMM Panel", data: results[5] }
            ]
        };

        res.status(200).json(finalResponse);

    } catch (error) {
        console.error("An unexpected error occurred:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
