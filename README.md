# Virtual Mimic - D&D 5e Character Creator
Virtual Mimic is a website developed to help RPG players who want to create and manage their characters in an easy way, with dynamic updates and a responsive character sheet!
This project is built as a deep dive into the Foundations of Software Development, focusing on the complete lifecycle of a web application—from user interaction in the browser to complex business logic in the backend and persistent storage in the cloud.

# Base Structure
* The core objective of this project is to implement a robust CRUD (Create, Read, Update, Delete) system. It demonstrates:
* State Management: How user inputs are captured and validated.
* Business Logic: Translating complex tabletop RPG rules (Hit Points calculation, Proficiency Bonuses, Ability Modifiers) into clean Java code.
* Data Persistence: Mapping relational data models to a cloud-hosted PostgreSQL database.
* Responsiveness: Creating a dynamic UI that updates in real-time as character levels change, without relying on heavy frontend frameworks.

# Stack
Backend - Java 21 + Spring Boot - Handles REST APIs, security, and D&D rule calculations.
Dependency Manager - Maven - Manages project lifecycle and external libraries.
Frontend - Vanilla HTML5, CSS3, JavaScript - A pure, "no-framework" approach to DOM manipulation and UI responsiveness.
Database - PostgreSQL (via Supabase) - Relational storage for characters, classes, and equipment.
