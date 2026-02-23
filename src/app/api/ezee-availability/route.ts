import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // 1. Get the Room ID the user is looking at
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get('roomId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!roomId) {
    return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
  }

  // 2. Load the secret keys (which will be empty for now)
  const ezeeApiKey = process.env.EZEE_API_KEY; 
  const hotelCode = process.env.EZEE_HOTEL_CODE;
  const endpointUrl = process.env.EZEE_ENDPOINT_URL;

  // 3. Safety Check: If we don't have keys yet, stop here peacefully
  if (!ezeeApiKey || !hotelCode || !endpointUrl) {
    console.log("Waiting on eZee API keys...");
    return NextResponse.json({ 
      success: false, 
      message: "API Keys pending",
      bookedDates: [] // Returns an empty calendar so the site doesn't break
    });
  }

  try {
    // 4. The actual request to eZee (This will run once we have keys)
    const ezeeResponse = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ezeeApiKey}`
      },
      body: JSON.stringify({
        hotelCode: hotelCode,
        roomType: roomId,
        from: startDate,
        to: endDate
      })
    });

    const availabilityData = await ezeeResponse.json();

    // 5. Send booked dates to the frontend calendar
    return NextResponse.json({ 
      success: true, 
      bookedDates: availabilityData.bookedDates 
    });

  } catch (error) {
    console.error("eZee Sync Error:", error);
    return NextResponse.json({ error: 'Failed to fetch calendar data' }, { status: 500 });
  }
}