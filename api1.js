// server.js

const express = require('express');
const fetch = require('node-fetch'); // API call karne ke liye

const app = express();
const PORT = 3000; // Aapka server is port par chalega

// Ye hamara main API endpoint hai
app.get('/api/info', async (req, res) => {
    // URL se mobile number nikalein
    const { mobile } = req.query;

    if (!mobile) {
        return res.status(400).json({ error: 'Mobile number is required' });
    }

    console.log(`Fetching data for mobile number: ${mobile}`);

    // Sabhi API endpoints ki list
    const apiEndpoints = [
        // Note: Maine aapke diye gaye URLs ko mobile number ke saath adjust kar diya hai
        `https://seller-ki-mkc.taitanx.workers.dev/?mobile=${mobile}`,
        `https://mkapi-v2.onrender.com/num?mobile=${mobile}&api_key=your_api_key_here`, // !! IMPORTANT: Yahan apna API key daalein
        `https://ifsc.taitaninfo.workers.dev/?code=${mobile}`, // Ye IFSC ke liye hai, mobile ke liye kaam nahi karega, lekin hum call kar rahe hain
        `https://adhar-opal.vercel.app/api/fetch?key=wamphire&aadhaar=${mobile}`, // Ye Aadhaar ke liye hai, hum mobile number bhej rahe hain
        `https://nixonsmmapi.s77134867.workers.dev/?mobile=${mobile}`,
        `http://king.thesmmpanel.shop/number-info?mobile=${mobile}`
        // Aapka pehla wala API (?aadhar) mobile number ke saath match nahi khata, isliye use hata diya gaya hai.
    ];

    try {
        // Sabhi APIs ko ek saath call karein
        const apiCalls = apiEndpoints.map(url =>
            fetch(url)
            .then(response => {
                // Agar response theek nahi hai (jaise 404, 500 error), to error phek de
                if (!response.ok) {
                    throw new Error(`Error fetching from ${url}: ${response.statusText}`);
                }
                return response.json(); // Response ko JSON mein badlein
            })
            .catch(error => {
                // Agar koi API fail ho jaati hai, to uski jagah error message daal dein
                console.error(`Failed to fetch from ${url}:`, error.message);
                return { error: error.message }; // Error ko object mein return karein taaki baaki API kaam karein
            })
        );

        // Sabhi calls ke complete hone ka intezaar karein
        const results = await Promise.all(apiCalls);

        // Ek final, combined response banayein
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

        // Client ko final response bhejein
        res.json(finalResponse);

    } catch (error) {
        console.error("An unexpected error occurred:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Server ko start karein
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Try accessing: http://localhost:${PORT}/api/info?mobile=9876543210`);
});