# Product Requirements Document

**Product**: SevaBook - ISKCON Temple Book Stall Inventory & POS System
**Author**: Arindam Dawn
**Stakeholders**: Temple President, Book Stall Seva Coordinator, Volunteers
**Last Updated**: 2025-04-13
**Currency**: Indian Rupee (₹)

---

## Problem Statement

The ISKCON Temple Book Stall currently manages book and spiritual item inventory manually using notebooks or spreadsheets. This leads to stock mismanagement, difficulty during festival rush, and no visibility into sales or donations. We need a comprehensive inventory and point-of-sale (POS) system to help volunteers manage stock in/out, process sales efficiently, monitor item availability, and generate reports — all accessible via web and mobile devices. The system should support regional languages to accommodate native users and provide professional inventory management features including barcode generation and printing.

---

## Users & Use Cases

### Primary Users

- **Seva Volunteers**: Process sales transactions, log donations, and update stock.
- **Admin (Coordinator)**: Add/remove items, manage users, configure system settings, export reports, generate barcodes.
- **Viewers (Temple Heads)**: View sales/donation statistics and inventory reports.

### Use Cases

- Add new spiritual items (books, incense, puja items, etc.) with detailed attributes
- View and edit item details including language variants
- Generate and print barcodes for inventory items
- Process sales transactions with barcode scanning
- Log incoming stock (e.g., from BBT or central store)
- Record stock outflows (sales, donations, festival distributions)
- Track item-wise and category-wise transactions
- Generate and print customizable receipts
- Export reports (daily/monthly/festival-wise)
- Configure system settings (receipt templates, barcode formats, etc.)
- Multi-user access with role-based permissions
- Use the system in multiple languages (English, Bengali, Hindi)

---

## User Stories

### Sales & POS
- As a volunteer, I want to scan product barcodes to quickly add items to a customer's bill, so I can process sales efficiently.
- As a volunteer, I want to manually search and add items to a bill when barcode scanning isn't working, so I can complete sales in any situation.
- As a volunteer, I want to select payment methods (cash, UPI, card) when finalizing a sale, so I can accurately record how payment was received.
- As a volunteer, I want to print a receipt for customers after a sale is complete, so they have proof of purchase.

### Inventory Management
- As a volunteer, I want to quickly record a book sale or donation with quantity, so I can keep stock accurate during festivals.
- As an admin, I want to see which items are low in stock, so I can reorder before they run out.
- As an admin, I want to add a new item to the inventory with details like name, category, price, language variants, and initial stock, so that it's available for sale or distribution.
- As an admin, I want to take a photo of an item and have AI recognize and pre-fill inventory details, so I can add new items more quickly and accurately.
- As an admin, I want to edit the details of an existing item (e.g., stock quantity, price, description), so I can keep the inventory accurate and up to date.
- As a volunteer, I want to quickly adjust stock quantities during stock reconciliation, so I can fix any discrepancies found during physical audits.

### Barcode & Label Management
- As an admin, I want to generate barcodes for inventory items, so they can be easily scanned during sales.
- As an admin, I want to customize the content and layout of barcode labels (50mm x 25mm), so they include relevant information like price, title, and language.
- As an admin, I want to preview barcode labels before printing them, so I can ensure they look correct.
- As an admin, I want to print barcode labels on a thermal printer, so I can attach them to inventory items.

### Reporting & Administration
- As a temple president, I want to download monthly seva reports to present in the management meeting.
- As a viewer, I want to see the dashboard but not be able to modify anything.
- As an admin, I want to customize receipt templates with temple branding and information, so receipts look professional.
- As an admin, I want to configure the system to support multiple languages (English, Bengali, Hindi), so volunteers can use it in their preferred language.

---

## Assumptions

- Temple already has internet access and a mobile device at the stall.
- The stall has or will acquire thermal printers for receipts and barcode labels.
- Volunteers will be trained to use the system UI in their preferred language.
- Basic authentication and role-based access are required.
- The system will support multiple regional languages (English, Bengali, Hindi) for the interface.
- The system will track payment methods but not integrate with payment gateways initially.

---

## Requirements

### Functional Requirements

#### Inventory Management
- Add/edit/delete items with fields like name, price (in ₹), stock, category, language variant, description.
- Support for language variants of the same item (e.g., Bhagavad Gita in English, Bengali, Hindi).
- Generate unique barcodes for each inventory item.
- AI-powered inventory addition using image recognition.
- Auto-update stock levels on transactions.
- Filter and search items by name, category, language, price range, and stock level.
- Low stock alerts and notifications.

#### Barcode System
- Generate standard barcodes (EAN-13, Code 128) for inventory items.
- Customize barcode label content (item name, price, language, etc.).
- Preview barcode labels before printing.
- Print barcode labels on thermal printers (50mm x 25mm size).

#### Point of Sale (POS)
- Scan barcodes to add items to a sale.
- Manual item search and addition to sales.
- Support for multiple payment methods (Cash, UPI, Card, etc.).
- Calculate totals, taxes, and change due.
- Process sales with multiple items.
- Print customizable receipts on thermal printers.

#### Transaction Management
- Record transactions: type (sale, donation, stock in), quantity, date, notes.
- Track payment methods for sales.
- Filter and search transactions by date/category/type/payment method.

#### Reporting
- Generate sales reports by date range, category, payment method.
- Export reports to Excel/PDF.
- Inventory valuation reports.
- Best-selling items reports.

#### User Management
- Manage users and roles with different permission levels.
- Login and secure session handling.
- Multi-language interface support (English, Bengali, Hindi).
- User preference settings for language.

### Non-Functional Requirements

#### System Requirements
- Mobile-responsive design optimized for tablets and smartphones
- Fast loading even on slow networks
- Backup-ready PostgreSQL database via Supabase
- Loosely coupled architecture with Supabase for data storage and authentication
- Database abstraction layer to allow swapping backend services if required
- Auditable transaction logs
- Deployed on Vercel or equivalent platform
- Multi-language support (English, Bengali, Hindi) for all user interfaces
- Compatibility with standard thermal printers for receipts and barcode labels
- Secure data handling and privacy compliance
- Offline transaction capability with sync when connection is restored
- Regular automated backups

#### AI Requirements
- Response time for image recognition under 3 seconds
- Minimum 85% accuracy for common inventory items
- Graceful degradation when AI services are unavailable
- Privacy-preserving image processing (no permanent storage of images)
- Transparent confidence scores for AI predictions
- Ability to function without AI features when offline

---

## Non-Goals

- No complex accounting features beyond basic sales tracking
- No customer relationship management (CRM) features
- No integration with external ERP systems

---

## Success Metrics

- System adopted and used by volunteers during upcoming Rath Yatra festival
- 100% of inventory updated and accurate before and after the event
- Time to process a sale transaction is under 30 seconds (including barcode scanning and receipt printing)
- Barcode scanning success rate of at least 95%
- Receipt printing success rate of at least 98%
- Monthly usage logs and successful report exports
- User satisfaction rating of at least 4/5 from volunteers using the system
- Successful use of the system in multiple languages by native speakers

---

## Barcode and Receipt Printing Specifications

### Barcode System

#### Barcode Generation
- System will generate unique barcodes for each inventory item
- Support for standard barcode formats: EAN-13, Code 128, QR codes
- Each book variant (different language of same title) will have a unique barcode
- Barcodes will encode item ID and can be linked to full product information in database

#### Barcode Label Design
- Label Size: 50mm x 25mm (standard thermal printer size)
- Content Elements:
  - Barcode graphic
  - Item name/title (truncated if too long)
  - Price in ₹
  - Language indicator (for books with multiple language variants)
  - Optional: Category or item type
- Preview functionality before printing
- Template customization options for administrators

#### Barcode Printing
- Compatible with standard thermal printers
- Support for printing single labels or batches
- Option to reprint labels when needed
- Print queue management

### Receipt Printing

#### Receipt Design
- Customizable header with temple name and address
- Transaction details (date, time, volunteer name)
- Itemized list of products with quantities and prices
- Subtotal, taxes (if applicable), and total amount
- Payment method information
- Optional: Thank you message or promotional content
- Optional: Donation acknowledgment text

#### Receipt Customization
- Admin interface for customizing receipt templates
- Preview functionality before saving changes
- Multiple templates for different purposes (regular sales, donations, etc.)
- Support for temple logo or branding elements

#### Receipt Printing
- Compatible with standard thermal receipt printers
- Option to email digital receipts
- Automatic printing after transaction completion
- Manual reprint option for previous transactions

---

## Point of Sale (POS) System

### Sales Transaction Flow

#### New Sale Process
1. Volunteer initiates a new sale
2. Items are added to the cart by:
   - Scanning barcodes with a connected scanner
   - Manual search and selection
   - Quick buttons for popular items
3. Quantities can be adjusted for each item
4. System calculates subtotal automatically
5. Volunteer selects payment method (Cash, UPI, Card, etc.)
6. For cash payments, system calculates change due
7. Transaction is finalized and receipt is printed
8. Inventory is automatically updated

#### Sale Modification
- Ability to void items before finalizing sale
- Option to apply discounts (percentage or fixed amount)
- Support for cancelling entire transactions
- Ability to process returns and exchanges

### Payment Methods

#### Supported Payment Types
- Cash
- UPI (PhonePe, Google Pay, Paytm, etc.)
- Google Pay API integration for digital payments
- Credit/Debit Card
- Other (configurable by admin)

#### Payment Processing
- Record payment method for each transaction
- Support for split payments (multiple payment methods)
- Cash drawer management for physical currency
- End-of-day reconciliation tools

### POS Interface

#### Design Requirements
- Touch-friendly interface optimized for tablets
- Quick access to common functions
- Visual indicators for successful scans
- Clear display of current transaction items and total
- Support for dark mode for different lighting conditions
- Accessible in all supported languages

#### Hardware Integration
- Compatible with standard USB and Bluetooth barcode scanners
- Support for thermal receipt printers
- Optional cash drawer integration
- Responsive design for various screen sizes

---

## AI Integration

### Image Recognition for Inventory Management

#### Core Functionality
- Integrate with AI vision models (Google Gemini 2.0 or equivalent) for image recognition
- Allow users to take photos of inventory items using device camera
- Automatically identify and extract product information from images
- Pre-populate inventory form fields based on AI analysis
- Support for recognizing book covers, packaging, and product labels

#### User Flow
1. User selects "Add Item via Image" option
2. Camera interface opens for capturing product image
3. AI processes the image and identifies the product
4. System pre-fills inventory form with recognized details
5. User reviews, modifies if needed, and confirms the information
6. Item is added to inventory with appropriate categorization

#### AI Model Integration
- Implement SDK integration with Google Gemini 2.0 or similar AI models
- Create abstraction layer for AI services to allow swapping providers
- Implement fallback to manual entry when AI confidence is low
- Cache common items for faster recognition of frequently stocked products

#### Training and Improvement
- Allow feedback on AI recognition accuracy to improve future results
- Periodically update AI models to improve recognition capabilities
- Build specialized recognition for spiritual items and books common in ISKCON stores
- Support for recognizing text in multiple languages (English, Bengali, Hindi)

---

## Backend Architecture

### Supabase Integration

#### Database Architecture
- Utilize Supabase as the primary backend service for data storage and authentication
- Implement a database abstraction layer to decouple the application from Supabase
- Design database schema to support all inventory, sales, and user management requirements
- Utilize Supabase Row Level Security (RLS) for data access control

#### Authentication & Authorization
- Leverage Supabase Auth for user authentication
- Implement role-based access control using Supabase policies
- Support email/password and social authentication methods
- Secure API endpoints with proper authentication checks

#### Data Access Layer
- Create a repository pattern to abstract database operations
- Implement service interfaces that can be implemented for different backend providers
- Use dependency injection to allow swapping backend services
- Maintain clear separation between data access and business logic

#### Offline Support
- Implement local storage for offline data caching
- Design synchronization mechanisms for offline-to-online data transfer
- Handle conflict resolution for concurrent updates

### Payment Integration

#### Google Pay API Integration
- Integrate with Google Pay API for digital payment processing
- Support one-time payments for sales transactions
- Implement proper error handling and transaction verification
- Provide fallback payment options when Google Pay is unavailable

#### Payment Processing Flow
1. Initialize Google Pay API client during application startup
2. Present Google Pay as a payment option during checkout
3. Generate payment request with transaction details
4. Process payment response and update transaction status
5. Provide receipt after successful payment

#### Security Considerations
- Implement server-side verification of payment transactions
- Secure storage of payment-related information
- Comply with payment industry security standards
- Regular security audits of payment processing code

---

## Multi-Language Support

### Inventory Language Variants

#### Book Language Variants
- System will support multiple language variants of the same book title
- Each language variant will be treated as a separate inventory item with its own:
  - Stock quantity
  - Barcode
  - Price (may vary by language)
  - Language indicator
- Common attributes can be shared across variants:
  - Author
  - Category
  - Publication information
  - Base description

#### Language Variant Management
- Ability to create a new book and immediately add multiple language variants
- Bulk operations across all variants of the same title
- Reporting that can consolidate or separate variants
- Search functionality that can find all variants of a title

### User Interface Localization

#### Supported Languages
- English (default)
- Bengali
- Hindi

#### Localization Features
- Complete translation of all UI elements, messages, and reports
- Language selection option in user preferences
- Language switching without losing current context
- Proper handling of right-to-left languages if added in future
- Date, time, and number formatting according to locale

#### Content Management
- Ability to enter product descriptions in multiple languages
- Support for non-Latin scripts in all text fields
- Search functionality that works across all supported languages

---

## Technical Architecture

### Application Architecture

#### Frontend
- React with TypeScript for type safety
- Vite for fast development and optimized builds
- Tailwind CSS for responsive UI components
- State management with React Context API and hooks
- Component-based architecture with reusable UI elements

#### Backend
- Supabase for database, authentication, and storage
- PostgreSQL database with proper indexing and optimization
- RESTful API endpoints for data access
- Serverless functions for business logic when needed

#### Integration Layer
- Adapter pattern for external service integration
- Interface-based design for swappable components
- Service locator for dependency management
- Repository pattern for data access abstraction
- AI service abstraction for vision model integration

#### Deployment
- Vercel for frontend hosting and serverless functions
- Supabase for backend services
- CI/CD pipeline for automated testing and deployment
- Environment-based configuration management

### System Design Principles

#### Loose Coupling
- Clear separation between UI, business logic, and data access
- Interface-based design for all external service integrations
- Dependency injection for service management
- Event-driven communication between components when appropriate

#### Scalability
- Horizontal scaling through stateless design
- Efficient database queries with proper indexing
- Caching strategies for frequently accessed data
- Asynchronous processing for non-critical operations

#### Maintainability
- Consistent coding standards and patterns
- Comprehensive documentation
- Automated testing at multiple levels
- Clear module boundaries and responsibilities

---

## Future Work

- PWA with enhanced offline support for rural areas or low-connectivity festivals
- Integration with additional payment gateways
- Advanced inventory analytics and forecasting
- Customer loyalty program and membership tracking
- Mobile app version with enhanced features
- Integration with donation tracking system
- Support for additional regional languages
- Advanced receipt customization with promotional messages
- Integration with accounting software
- Bulk barcode printing and inventory management tools
- Migration to different backend service if needed
- Enhanced AI capabilities for inventory management and sales recommendations
- Integration with more advanced AI models as they become available
