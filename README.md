# 📚 Open Book Library

> A free digital library for discovering, reading, and downloading legally available books.

**Project Status:** 🟢 Active — In Development

Open Book Library is an open-source digital library designed to make book discovery and reading simple and accessible.

The goal is to provide a centralized platform where users can browse books by category, search for books, read PDFs directly in their browser, and download available books for free.

The project also includes an administrator dashboard for managing the entire book collection without modifying the source code.

---

## ✨ Features

### 📖 Public Library

* Browse available books
* Browse books by category
* Search by book title, author, or topic
* View book details
* View book covers
* Read books directly in the browser
* Download available PDF books
* Responsive experience for desktop, tablet, and mobile

### 🔐 Admin Dashboard

The administrator can manage the library without adding books manually to the code.

Admin features include:

* Secure admin login
* Add new books
* Upload PDF files
* Upload book covers
* Add book title and author
* Add descriptions
* Assign categories
* Edit existing books
* Publish/unpublish books
* Delete books
* Manage categories
* View library statistics

### 📚 Book Management

The intended workflow is:

```text
Admin Login
     ↓
Add Book
     ↓
Upload PDF
     ↓
Add/Edit Book Information
     ↓
Select Category
     ↓
Upload Cover (Optional)
     ↓
Publish
     ↓
Book Appears in Public Library
```

Books are **not hardcoded into the application**.

The application stores book information in the database and book files in storage, allowing the collection to grow without changing the source code.

---

## 🗂️ Categories

Books can be organized into categories such as:

* Love & Relationships
* Money & Finance
* Business
* Self Development
* Motivation
* Education
* Fiction
* Religion & Spirituality
* Family
* Health
* Technology
* Other

Categories are managed through the admin dashboard rather than being permanently hardcoded.

---

## 🔍 Book Discovery

Users can discover books through:

* Categories
* Search
* Recently added books
* Book listings
* Individual book pages

The goal is to make finding a book as simple as:

```text
Visit Library
     ↓
Search or Choose Category
     ↓
Choose Book
     ↓
Read Online or Download
```

No user account is required for normal visitors.

---

## 📄 PDF Reading

Books are provided as PDF files.

Users can open a book and read it directly in their browser without needing to download it first.

A download option is also available for books that the administrator has made available for download.

---

## 🖼️ Book Covers

A book can have a separate cover image.

Supported image formats may include:

* JPG
* JPEG
* PNG
* WebP

If a separate cover is not provided, the application can use an appropriate fallback/placeholder.

Where appropriate, the first page of a PDF can also be used as the book's visual cover.

---

## 🛠️ Technology

The project is being developed using a modern web application stack.

Planned/core technologies include:

* React
* TypeScript
* Tailwind CSS
* Supabase
* PostgreSQL
* Supabase Storage
* Authentication
* PDF viewing in the browser

The exact implementation may evolve during development.

---

## 🗄️ Data Architecture

The application separates book information from book files.

### Database

Stores information such as:

```text
Book ID
Title
Author
Description
Category
Cover path
PDF path
Publication status
Created date
Updated date
```

### Storage

Stores:

```text
Book PDFs
Book cover images
```

This allows the application to manage a large collection without placing PDFs directly inside the source code.

---

## 🔐 Security

The admin dashboard is protected by authentication.

Only authorized administrators should be able to:

* Upload books
* Edit books
* Delete books
* Publish/unpublish books
* Manage categories

Sensitive environment variables and secrets must not be committed to the repository.

---

## ⚠️ Copyright & Distribution

This project is intended for books that the administrator is legally allowed to distribute.

Only upload books that are:

* In the public domain
* Openly licensed for redistribution
* Created by the uploader
* Or distributed with permission from the copyright holder

The project does not grant permission to redistribute copyrighted books.

---

## 🚧 Current Status

### 🟢 Active — In Development

The project is currently under active development.

### Current focus

* [x] Project concept
* [x] Repository setup
* [x] Core application planning
* [x] Admin authentication configuration
* [ ] Database implementation
* [ ] Storage implementation
* [ ] Admin dashboard
* [ ] PDF upload
* [ ] Book management
* [ ] Category management
* [ ] Public book library
* [ ] Search
* [ ] Book details page
* [ ] Online PDF reader
* [ ] PDF download
* [ ] Responsive UI
* [ ] Testing
* [ ] Production deployment

Features may change as development continues.

---

## 🗺️ Roadmap

### Phase 1 — Foundation

* Set up application
* Configure database
* Configure storage
* Configure authentication
* Create database schema

### Phase 2 — Admin

* Admin dashboard
* Book upload
* PDF storage
* Cover upload
* Book metadata
* Category management
* Edit/delete functionality
* Publish/unpublish functionality

### Phase 3 — Public Library

* Homepage
* Book listing
* Categories
* Search
* Book details
* Online PDF reading
* Download functionality

### Phase 4 — Improvements

* Better UI
* Accessibility improvements
* Performance optimization
* SEO
* Better PDF experience
* Advanced search/filtering

### Future Ideas

Possible future features include:

* User accounts
* Favorites
* Reading history
* Reading lists
* Book requests
* Ratings and reviews
* Recommendations
* Recently viewed books
* Multiple administrators
* Progressive Web App support

---

## 🚀 Development Philosophy

The project follows a simple principle:

> **Functionality first. Design later.**

The first priority is to make the complete system work:

```text
Upload
   ↓
Store
   ↓
Organize
   ↓
Publish
   ↓
Discover
   ↓
Read
   ↓
Download
```

Once the core functionality is stable, the visual design and user experience can be improved.

---

## 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

If you would like to contribute:

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Test the changes.
5. Open a pull request.

Please keep contributions focused and maintainable.

---

## 📜 License

Choose an appropriate open-source license before publishing the project publicly.

A common choice is the **MIT License**, but the final license should reflect how you want the project and its code to be used.

---

## 📌 Project Status

**🟢 Active — In Development**

Open Book Library is currently being built and tested. The architecture and features may evolve as the project grows.

---

### Built with ❤️ for people who love books.

**Open Book Library — Discover. Read. Grow.**
