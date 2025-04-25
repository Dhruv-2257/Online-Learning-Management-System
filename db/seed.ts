import { db } from "./index";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  try {
    console.log("Starting database seed...");

    // Check for existing data
    const existingUsers = await db.select({ count: schema.users.id }).from(schema.users);
    if (existingUsers.length > 0) {
      console.log("Data already exists, skipping seed");
      return;
    }

    // Create categories
    console.log("Creating categories...");
    const categories = [
      { name: "Web Development", description: "Learn how to build modern web applications" },
      { name: "JavaScript", description: "Master JavaScript programming language and frameworks" },
      { name: "React", description: "Build user interfaces with React" },
      { name: "Data Science", description: "Learn data analysis and machine learning" },
      { name: "Design", description: "Master UI/UX and graphic design principles" },
      { name: "Marketing", description: "Digital marketing strategies and techniques" }
    ];

    const insertedCategories = await Promise.all(
      categories.map(async (category) => {
        const [inserted] = await db.insert(schema.categories).values(category).returning();
        return inserted;
      })
    );

    // Create admin and regular users
    console.log("Creating users...");
    const adminPassword = await hashPassword("admin123");
    const userPassword = await hashPassword("user123");

    const [admin] = await db.insert(schema.users)
      .values({
        username: "admin",
        email: "admin@learnease.com",
        password: adminPassword,
        firstName: "Admin",
        lastName: "User",
        role: "admin"
      })
      .returning();

    const [sarah] = await db.insert(schema.users)
      .values({
        username: "sarahjohnson",
        email: "sarah@example.com",
        password: userPassword,
        firstName: "Sarah",
        lastName: "Johnson",
        role: "user"
      })
      .returning();

    const [mark] = await db.insert(schema.users)
      .values({
        username: "markwilson",
        email: "mark@example.com",
        password: userPassword,
        firstName: "Mark",
        lastName: "Wilson",
        role: "user"
      })
      .returning();

    const [emma] = await db.insert(schema.users)
      .values({
        username: "emmachen",
        email: "emma@example.com",
        password: userPassword,
        firstName: "Emma",
        lastName: "Chen",
        role: "user"
      })
      .returning();

    // Create courses
    console.log("Creating courses...");
    
    // Get category IDs
    const webDevCategoryId = insertedCategories.find(c => c.name === "Web Development")?.id;
    const jsCategoryId = insertedCategories.find(c => c.name === "JavaScript")?.id;
    const reactCategoryId = insertedCategories.find(c => c.name === "React")?.id;

    // Course 1: Web Development Fundamentals
    await db.insert(schema.courses)
      .values({
        title: "Web Development Fundamentals",
        description: "Learn the basics of HTML, CSS, and JavaScript to build your first website.",
        image: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        price: "0",
        instructorId: sarah.id,
        categoryId: webDevCategoryId,
        status: "published",
        content: "# Web Development Fundamentals\n\n## Welcome to the Course!\n\nIn this course, you'll learn the essential skills needed to build your very first website. We'll cover the three fundamental technologies that power the web:\n\n- HTML (Structure)\n- CSS (Style)\n- JavaScript (Interactivity)\n\n## Course Objectives\n\nBy the end of this course, you will be able to:\n\n* Create well-structured HTML documents\n* Style your pages with CSS\n* Add interactivity with basic JavaScript\n* Publish your website online\n\n## Module 1: HTML Basics\n\nHTML (HyperText Markup Language) is the backbone of any webpage. It provides the structure and content.\n\n### Basic HTML Document\n\n```html\n<!DOCTYPE html>\n<html>\n<head>\n  <title>My First Webpage</title>\n</head>\n<body>\n  <h1>Hello, World!</h1>\n  <p>This is my first webpage.</p>\n</body>\n</html>\n```\n\n### Common HTML Elements\n\n* Headings: `<h1>` through `<h6>`\n* Paragraphs: `<p>`\n* Links: `<a href=\"https://example.com\">Link Text</a>`\n* Images: `<img src=\"image.jpg\" alt=\"Description\">`\n* Lists: `<ul>`, `<ol>`, and `<li>`\n\n## Module 2: CSS Styling\n\nCSS (Cascading Style Sheets) is used to style your HTML elements, controlling layout, colors, fonts, and more.\n\n### Basic CSS Syntax\n\n```css\nselector {\n  property: value;\n}\n```\n\n### Example CSS\n\n```css\nbody {\n  font-family: Arial, sans-serif;\n  background-color: #f0f0f0;\n  margin: 0;\n  padding: 20px;\n}\n\nh1 {\n  color: #3B82F6;\n  text-align: center;\n}\n\np {\n  line-height: 1.5;\n}\n```\n\n## Module 3: JavaScript Basics\n\nJavaScript adds interactivity to your webpages.\n\n### Basic JavaScript Example\n\n```javascript\n// Display an alert when a button is clicked\ndocument.getElementById('myButton').addEventListener('click', function() {\n  alert('Button was clicked!');\n});\n\n// Change text content\ndocument.getElementById('myElement').textContent = 'New text content';\n```\n\n## Final Project\n\nFor your final project, you'll build a personal portfolio website that showcases:\n\n1. A home page about you\n2. A projects page showing your work\n3. A contact page with a form\n\nGood luck, and happy coding!",
      });

    // Course 2: JavaScript Masterclass
    await db.insert(schema.courses)
      .values({
        title: "JavaScript Masterclass",
        description: "Advanced JavaScript concepts including ES6+, async/await, and modern frameworks.",
        image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        price: "49.99",
        instructorId: mark.id,
        categoryId: jsCategoryId,
        status: "published",
        content: "# JavaScript Masterclass\n\n## Course Overview\n\nWelcome to the JavaScript Masterclass! This comprehensive course will take you from intermediate to advanced JavaScript concepts.\n\n## What You'll Learn\n\n* ES6+ features and syntax\n* Asynchronous programming with Promises and async/await\n* Modern JavaScript frameworks and libraries\n* Performance optimization techniques\n* Testing and debugging strategies\n\n## Module 1: Modern JavaScript (ES6+)\n\n### Arrow Functions\n\n```javascript\n// Traditional function\nfunction add(a, b) {\n  return a + b;\n}\n\n// Arrow function\nconst add = (a, b) => a + b;\n```\n\n### Destructuring\n\n```javascript\n// Array destructuring\nconst [first, second] = [1, 2];\n\n// Object destructuring\nconst { name, age } = { name: 'John', age: 30 };\n```\n\n### Template Literals\n\n```javascript\nconst name = 'World';\nconsole.log(`Hello, ${name}!`);\n```\n\n### Spread and Rest Operators\n\n```javascript\n// Spread\nconst arr1 = [1, 2, 3];\nconst arr2 = [...arr1, 4, 5]; // [1, 2, 3, 4, 5]\n\n// Rest\nconst [first, ...rest] = [1, 2, 3, 4, 5]; // first = 1, rest = [2, 3, 4, 5]\n```\n\n## Module 2: Asynchronous JavaScript\n\n### Promises\n\n```javascript\nfunction fetchData() {\n  return new Promise((resolve, reject) => {\n    // Simulating API call\n    setTimeout(() => {\n      const data = { id: 1, name: 'User' };\n      resolve(data);\n      // If error: reject(new Error('Failed to fetch data'));\n    }, 1000);\n  });\n}\n\nfetchData()\n  .then(data => console.log(data))\n  .catch(error => console.error(error));\n```\n\n### Async/Await\n\n```javascript\nasync function fetchUserData() {\n  try {\n    const response = await fetch('https://api.example.com/users/1');\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error('Error fetching user data:', error);\n  }\n}\n```\n\n## Module 3: Advanced Concepts\n\n### Closures\n\n```javascript\nfunction createCounter() {\n  let count = 0;\n  \n  return {\n    increment: () => ++count,\n    decrement: () => --count,\n    getCount: () => count\n  };\n}\n\nconst counter = createCounter();\nconsole.log(counter.increment()); // 1\nconsole.log(counter.increment()); // 2\nconsole.log(counter.getCount()); // 2\n```\n\n### Prototypes and Classes\n\n```javascript\n// ES6 Class\nclass Person {\n  constructor(name, age) {\n    this.name = name;\n    this.age = age;\n  }\n  \n  greet() {\n    return `Hello, my name is ${this.name}`;\n  }\n}\n\nconst john = new Person('John', 30);\nconsole.log(john.greet()); // \"Hello, my name is John\"\n```\n\n## Final Project\n\nFor your final project, you'll build a single-page application using pure JavaScript (no frameworks) that demonstrates:\n\n1. Fetching and displaying data from an API\n2. Client-side routing\n3. Form validation\n4. State management\n\nHappy coding!",
      });

    // Course 3: React for Beginners
    await db.insert(schema.courses)
      .values({
        title: "React for Beginners",
        description: "Learn React from scratch and build modern web applications with hooks and context.",
        image: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        price: "39.99",
        instructorId: emma.id,
        categoryId: reactCategoryId,
        status: "published",
        content: "# React for Beginners\n\n## Welcome to React!\n\nReact is a JavaScript library for building user interfaces. This course will teach you how to build modern web applications with React, focusing on hooks and context.\n\n## Course Objectives\n\nBy the end of this course, you will be able to:\n\n* Set up a React development environment\n* Create and compose React components\n* Manage state with hooks\n* Share state with Context API\n* Build and deploy a complete React application\n\n## Module 1: Getting Started with React\n\n### What is React?\n\nReact is a declarative, efficient, and flexible JavaScript library for building user interfaces. It lets you compose complex UIs from small and isolated pieces of code called \"components\".\n\n### Your First React Component\n\n```jsx\nimport React from 'react';\n\nfunction HelloWorld() {\n  return (\n    <div>\n      <h1>Hello, World!</h1>\n      <p>Welcome to React</p>\n    </div>\n  );\n}\n\nexport default HelloWorld;\n```\n\n### JSX Syntax\n\nJSX is a syntax extension for JavaScript that looks similar to HTML but allows you to write JavaScript directly within it.\n\n```jsx\nconst name = 'John';\nconst element = <h1>Hello, {name}</h1>;\n```\n\n## Module 2: React Hooks\n\n### useState Hook\n\nThe useState hook lets you add state to functional components.\n\n```jsx\nimport React, { useState } from 'react';\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  \n  return (\n    <div>\n      <p>You clicked {count} times</p>\n      <button onClick={() => setCount(count + 1)}>\n        Click me\n      </button>\n    </div>\n  );\n}\n```\n\n### useEffect Hook\n\nThe useEffect hook lets you perform side effects in functional components.\n\n```jsx\nimport React, { useState, useEffect } from 'react';\n\nfunction Example() {\n  const [count, setCount] = useState(0);\n  \n  // Similar to componentDidMount and componentDidUpdate\n  useEffect(() => {\n    document.title = `You clicked ${count} times`;\n  }, [count]); // Only re-run if count changes\n  \n  return (\n    <div>\n      <p>You clicked {count} times</p>\n      <button onClick={() => setCount(count + 1)}>\n        Click me\n      </button>\n    </div>\n  );\n}\n```\n\n## Module 3: React Context\n\n### Creating a Context\n\n```jsx\nimport React, { createContext, useState } from 'react';\n\n// Create a context\nexport const ThemeContext = createContext();\n\n// Create a provider component\nexport function ThemeProvider({ children }) {\n  const [theme, setTheme] = useState('light');\n  \n  const toggleTheme = () => {\n    setTheme(theme === 'light' ? 'dark' : 'light');\n  };\n  \n  return (\n    <ThemeContext.Provider value={{ theme, toggleTheme }}>\n      {children}\n    </ThemeContext.Provider>\n  );\n}\n```\n\n### Using the Context\n\n```jsx\nimport React, { useContext } from 'react';\nimport { ThemeContext } from './ThemeContext';\n\nfunction ThemedButton() {\n  const { theme, toggleTheme } = useContext(ThemeContext);\n  \n  return (\n    <button\n      onClick={toggleTheme}\n      style={{ \n        background: theme === 'dark' ? '#333' : '#fff',\n        color: theme === 'dark' ? '#fff' : '#333'\n      }}\n    >\n      Toggle Theme\n    </button>\n  );\n}\n```\n\n## Final Project\n\nFor your final project, you'll build a task management application with the following features:\n\n1. Add, edit, and delete tasks\n2. Mark tasks as complete\n3. Filter tasks by status\n4. Dark/light theme toggle\n5. Store tasks in local storage\n\nHappy coding!",
      });

    // Create enrollments (empty by default)

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
