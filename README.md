# 🏔️ Winterstone Lodge

A luxury hotel booking platform for an Alpine retreat in the Himalayas, built with modern web technologies.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square&logo=mongodb)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)

---

## ✨ Features

### Guest Experience
- 🛏️ **Room Booking** - Browse and book luxury suites with real-time availability
- 📅 **Date Selection** - Interactive calendar with blocked dates
- 🎁 **Add-ons** - Enhance stay with breakfast, transfers, spa sessions, and more
- 📧 **Email Confirmations** - Beautiful booking confirmation emails
- 💳 **Payment Integration** - Razorpay payment gateway

### Admin Dashboard
- 📊 **Analytics Dashboard** - Booking stats, revenue charts, occupancy metrics
- 🏠 **Room Management** - CRUD for room types and individual room units
- 📋 **Booking Management** - View, filter, and manage all bookings
- ⭐ **Reviews** - Moderate guest reviews
- 👥 **Team** - Manage staff and roles
- ⚙️ **Settings** - Configure check-in/out times, special request options
- 🎁 **Add-ons Management** - Create and manage paid add-ons

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 16 (App Router), React 19 |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS, Framer Motion |
| **Database** | MongoDB with Mongoose |
| **Auth** | NextAuth v5 (Credentials Provider) |
| **Payments** | Razorpay |
| **Email** | Nodemailer (Gmail SMTP / Resend) |

---

## 📋 Prerequisites

Before you begin, ensure you have:
- **Node.js** v18+ installed - [Download](https://nodejs.org/)
- **MongoDB** database (local or Atlas)
- **Razorpay** account for payments

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Borax0x0/Winterstone.git
cd Winterstone
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_key

# Razorpay (Optional - Mock mode available)
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# Email (Gmail SMTP for development)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Or Resend for production
RESEND_API_KEY=your_resend_api_key
```

### 4. Run the Development Server
```bash
npm run dev
```

### 5. Access the Application
- **Site**: [http://localhost:3000](http://localhost:3000)
- **Admin**: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page
│   ├── book/              # Booking flow
│   ├── rooms/             # Room listing & details
│   ├── admin/             # Admin dashboard
│   │   ├── addons/        # Add-ons management
│   │   ├── bookings/      # Booking management
│   │   ├── rooms/         # Room management
│   │   ├── reviews/       # Review moderation
│   │   ├── settings/      # Site settings
│   │   └── team/          # Staff management
│   └── api/               # API routes
├── components/            # React components
│   └── admin/             # Admin-specific components
├── context/               # React contexts
├── hooks/                 # Custom hooks
├── lib/                   # Utilities
├── models/                # Mongoose models
└── auth.ts               # NextAuth configuration
```

---

## 🗄️ Database Models

| Model | Description |
|-------|-------------|
| **User** | Authentication with roles (guest/admin/superadmin) |
| **Room** | Room types with pricing, amenities, gallery |
| **RoomUnit** | Individual room instances |
| **Booking** | Reservations with payment tracking |
| **AddOn** | Paid add-ons (breakfast, transfers, etc.) |
| **Review** | Guest reviews with moderation |
| **Event** | Hotel events |
| **Employee** | Staff management |
| **Settings** | Site configuration |
| **Subscriber** | Newsletter subscriptions |

---

## 🔐 Admin Access

Default admin creation is handled via seed script or manual database entry. Create a user with `role: "admin"` or `role: "superadmin"` in MongoDB.

---

## 📸 Screenshots

*Add screenshots here*

---

## 📝 License

This project was built as a client project. Portfolio copy maintained for showcase purposes.

---

## 👤 Author

**Borax0x0**
- GitHub: [@Borax0x0](https://github.com/Borax0x0)
