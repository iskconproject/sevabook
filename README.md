# SevaBook - ISKCON Temple Book Stall Inventory & POS System

SevaBook is a beautiful, intuitive inventory and point-of-sale system designed specifically for ISKCON temple book stalls. With its stunning UI/UX inspired by Steve Jobs' design philosophy, SevaBook makes managing inventory and processing sales a seamless experience.

## Features

- **Beautiful UI/UX Design**: Inspired by Steve Jobs' design philosophy with a spiritual aesthetic
- **Inventory Management**: Track books and other items with detailed information
- **Point of Sale**: Process sales quickly and efficiently
- **Barcode Generation**: Create and print barcodes for all inventory items
- **Multilingual Support**: Full support for English, Bengali, and Hindi
- **INR Currency**: Designed specifically for Indian Rupee
- **Thermal Printing**: Customizable thermal printing for labels and receipts
- **AI Integration**: Add inventory items through image recognition (powered by Google Gemini 2.0)
- **Google Pay Integration**: Accept payments through Google Pay
- **Reporting**: Generate detailed sales and inventory reports
- **User Management**: Manage staff with different permission levels

## Technology Stack

- **Frontend**: React with TypeScript
- **UI Components**: shadcn/ui (based on Radix UI)
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: React Context API
- **Form Handling**: React Hook Form with Zod validation
- **Internationalization**: i18next
- **Barcode Generation**: react-barcode, jsbarcode
- **Thermal Printing**: react-thermal-printer

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- pnpm (v7 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/sevabook.git
   cd sevabook
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create a `.env` file in the root directory with your credentials:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_GEMINI_API_KEY=your-gemini-api-key
   ```

   You can get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey).

4. Start the development server:
   ```bash
   pnpm dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
sevabook/
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── inventory/  # Inventory-related components
│   │   ├── layout/     # Layout components
│   │   ├── pos/        # Point of Sale components
│   │   └── ui/         # shadcn/ui components
│   ├── contexts/       # React Context providers
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions and services
│   │   ├── ai/         # AI integration services
│   │   ├── i18n/       # Internationalization
│   │   ├── supabase/   # Supabase client and abstractions
│   │   └── utils/      # Utility functions
│   └── pages/          # Application pages
├── public/             # Static assets
└── docs/               # Documentation
```

## Customization

### Themes

SevaBook comes with a beautiful theme inspired by ISKCON's spiritual aesthetics. You can customize the colors in `src/index.css`.

### Translations

Add or modify translations in the JSON files located in `src/lib/i18n/locales/`.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- ISKCON for their spiritual inspiration
- shadcn for the beautiful UI components
- The React and TypeScript communities for their excellent tools and documentation
