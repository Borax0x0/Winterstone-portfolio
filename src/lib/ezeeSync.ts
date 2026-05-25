
/**
 * Utility to push local website bookings to eZee Channel Manager (Yanolja Cloud)
 * to ensure two-way synchronization of inventory and prevent double-bookings.
 */

interface EzeeBookingPayload {
  Room_Details: {
    [key: string]: {
      Rateplan_Id: string;
      Ratetype_Id: string;
      Roomtype_Id: string;
      baserate: string;
      extradultrate: string;
      extrachildrate: string;
      number_adults: string;
      number_children: string;
      ExtraChild_Age: string;
      First_Name: string;
      Last_Name: string;
      SpecialRequest: string;
    };
  };
  check_in_date: string;
  check_out_date: string;
  Email_Address: string;
  MobileNo: string;
}

// MAPPING: Local slug -> eZee IDs
// Roomtype_Id, Ratetype_Id, Rateplan_Id confirmed via live API calls (May 2026)
// RateTypeID == RoomTypeID confirmed by getdataAPI.php Rate request
// RatePlanID == RoomTypeID confirmed by pms_connectivity.php RoomInfo response
const ROOM_ID_MAPPING: Record<string, { Rateplan_Id: string; Ratetype_Id: string; Roomtype_Id: string }> = {
  "zen-nest": {
    Rateplan_Id: "5109700000000000001",   // Standard Double
    Ratetype_Id: "5109700000000000001",
    Roomtype_Id: "5109700000000000001",
  },
  "sunlit-studio": {
    Rateplan_Id: "5109700000000000002",   // Deluxe Double
    Ratetype_Id: "5109700000000000002",
    Roomtype_Id: "5109700000000000002",
  },
  "skyline-haven": {
    Rateplan_Id: "5109700000000000003",   // Super Deluxe
    Ratetype_Id: "5109700000000000003",
    Roomtype_Id: "5109700000000000003",
  },
};

export async function pushBookingToEzee(booking: any) {
  const hotelCode = process.env.EZEE_HOTEL_CODE;
  const apiKey = process.env.EZEE_AUTH_CODE; // Using AuthCode as APIKey as suggested
  const baseUrl = "https://live.ipms247.com/booking/reservation_api/listing.php";

  if (!hotelCode || !apiKey) {
    console.error("eZee Sync: Missing HotelCode or APIKey in environment variables.");
    return { success: false, error: "Configuration missing" };
  }

  const mapping = ROOM_ID_MAPPING[booking.roomSlug] || ROOM_ID_MAPPING[booking.roomName?.toLowerCase().replace(/\s+/g, '-')];
  
  if (!mapping) {
    console.warn(`eZee Sync: No room mapping found for slug "${booking.roomSlug}" or name "${booking.roomName}". Skipping push.`);
    return { success: false, error: "Room mapping not found" };
  }

  const nameParts = booking.guestName.split(" ");
  const firstName = nameParts[0] || "Guest";
  const lastName = nameParts.slice(1).join(" ") || "Winterstone";

  const bookingData: EzeeBookingPayload = {
    Room_Details: {
      Room_1: {
        ...mapping,
        baserate: Math.round(booking.totalAmount / (booking.nights || 1)).toString(),
        extradultrate: "0",
        extrachildrate: "0",
        number_adults: (booking.guests || 2).toString(),
        number_children: "0",
        ExtraChild_Age: "0",
        First_Name: firstName,
        Last_Name: lastName,
        SpecialRequest: booking.specialRequests?.join(", ") || "",
      },
    },
    check_in_date: booking.checkIn,
    check_out_date: booking.checkOut,
    Email_Address: booking.email,
    MobileNo: booking.phone || "",
  };

  try {
    const url = new URL(baseUrl);
    url.searchParams.append("request_type", "InsertBooking");
    url.searchParams.append("HotelCode", hotelCode);
    url.searchParams.append("APIKey", apiKey);
    url.searchParams.append("BookingData", JSON.stringify(bookingData));

    console.log(`eZee Sync: Pushing booking ${booking._id} to eZee...`);
    
    const response = await fetch(url.toString(), {
      method: "GET", // Documentation shows it as a GET request with query params
      headers: {
        "Accept": "application/json",
      },
    });

    const result = await response.json();

    if (result.ReservationNo) {
      console.log(`eZee Sync: Successfully pushed! eZee Reservation No: ${result.ReservationNo}`);
      return { success: true, reservationNo: result.ReservationNo };
    } else {
      console.error("eZee Sync: Failed to push booking. Response:", result);
      return { success: false, error: result };
    }
  } catch (error) {
    console.error("eZee Sync: Error during API call:", error);
    return { success: false, error };
  }
}
